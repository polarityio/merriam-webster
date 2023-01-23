"use strict";

const request = require("postman-request");
const config = require("./config/config");
const _ = require("lodash");
const async = require("async");
const fs = require("fs");
let Logger;
let requestDefault;

/**
 * Main function 
 * @param entities Entities to look up
 * @param options Options set by user
 * @param cb Callback - what we're passing our info back through
 */
function doLookup(entities, options, cb) {
  let lookupResults = [];
  let tasks = [];
  let uniqueEntities = [];
  Logger.trace({ entities }, "entities");

  // filter down to only entities with unique lowercase values
  uniqueEntities = _.chain(entities).map(entity => (
    {...entity, "value": entity.value.toLowerCase()}
    )).uniqBy("value").value();
  
  Logger.trace({ uniqueEntities }, "uniqueEntities");
  // builds our list of tasks
  uniqueEntities.forEach(entity => {
    if (entity.value) {
      const requestOptions = {
        method: "GET",
        uri: `https://dictionaryapi.com/api/v3/references/collegiate/json/` +
             `${entity.value}?key=${options.apiKey}`,
        json: true
      };

      Logger.debug({ uri: requestOptions.uri }, "Request URI");

      tasks.push(function (done) {
        // callback function for each request
        requestDefault(requestOptions, function (error, res, body) {
          if (error) {
            done({
              error: error,
              entity: entity.value,
              detail: "Error in Request"
            });
            return;
          }
          let result = {};
          if (res.statusCode === 200) {
            result = {
              entity,  // entity + metadata 
              body  // response body
            };
          } else if (res.statusCode === 429) {
            // reached rate limit
            error = "Reached API Lookup Limit";
          } else {
            // Non 200 status code
            done({
              error,
              httpStatus: res.statusCode,
              body,
              detail: "Unexpected Non 200 HTTP Status Code",
              entity: entity.value
            });
            return;
          }

          done(error, result);
        });
      });
    }
  });

  // this executes tasks asynchronously with a limit and a callback
  async.parallelLimit(tasks, 10, (err, results) => {
    if (err) {
      cb(err);
      return;
    }
    results.forEach(result => {
      Logger.trace({ result }, "Checking data to see if blocking");

      if (result.body === null || _isMiss(result.body)) {
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else{
        let exactMatches = []
        result.body.forEach(match => {
          let lowerStems = match.meta.stems.map(stem => stem.toLowerCase());
          if (lowerStems.includes(result.entity.value)) {
            exactMatches.push({
                type: match.fl,
                defs: match.shortdef,
                hw: match.hwi.hw
            });
          }
        });
        lookupResults.push({
            entity: result.entity,
            data: {
                summary: [exactMatches.length],
                details: exactMatches
            }
        });
      }
    });

    Logger.trace({ lookupResults }, "Lookup Results");

    // end-level callback
    cb(null, lookupResults);
  });
}

function _isMiss(body) {
  return body &&
    Array.isArray(body) &&
    (body.length === 0 ||
     !body[0].hasOwnProperty("meta"));
}

/**
 * Run as soon as the integration (independent node instance) starts up
 * @param logger integration-specific logging instance
 */
function startup(logger) {
  Logger = logger;

  let defaults = {};

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    defaults.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    defaults.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    defaults.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    defaults.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    defaults.proxy = config.request.proxy;
  }

  requestDefault = request.defaults(defaults);
}

/**
 * Run after startup and validates the user options
 * @param logger integration-specific logging instance
 */
function validateOptions(userOptions, cb) {
  let errors = [];
  if (
    typeof userOptions.apiKey.value !== "string" ||
    (typeof userOptions.apiKey.value === "string" &&
      userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: "apiKey",
      message: "You must provide a valid Merriam-Webster key"
    });
  }
  cb(null, errors);
}

module.exports = {
  doLookup: doLookup,
  validateOptions: validateOptions,
  startup: startup
};