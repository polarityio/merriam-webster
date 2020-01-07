module.exports = {
  
    /**
     * Name of the integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @required
     */
    name: 'Merriam-Webster',
    /**
     * The acronym that appears in the notification window when information from this integration
     * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
     * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
     * here will be carried forward into the notification window.
     *
     * @type String
     * @required
     */
    acronym: 'DICT',
    /**
     * Description for this integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @optional
     */
    description: 'Searches the Merriam-Webster Collegiate dictionary for the entity',
    customTypes: [
      {
        key: 'word',
        regex: /([A-Za-z]\w+)/
      }
    ],
    request: {
      cert: '',
      key: '',
      passphrase: '',
      ca: '',
      proxy: '',
      rejectUnauthorized: true
    },
    /**
     * An array of style files (css or less) that will be included for your integration. Any styles specified in
     * the below files can be used in your custom template.
     *
     * @type Array
     * @optional
     */
    styles: ['./styles/style.less'],
    /**
     * Provide custom component logic and template for rendering the integration details block.  If you do not
     * provide a custom template and/or component then the integration will display data as a table of key value
     * pairs.
     *
     * @type Object
     * @optional
     */
    block: {
      component: {
        file: './components/block.js'
      },
      template: {
        file: './templates/block.hbs'
      }
    },
    summary: {
      component: {
        file: './components/summary.js'
      },
      template: {
        file: './templates/summary.hbs'
      }
    },
    logging: {
      level: 'trace' //info, trace, debug, info, warn, error, fatal
    },
    /**
     * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
     * as an array of option objects.
     *
     * @type Array
     * @optional
     */
    options: [
      {
        key: 'apiKey',
        name: "API Key",
        description: "The API key need to access the Merriam-Webster API",
        default: "",
        type: 'password',
        userCanEdit: true,
        adminOnly: false
      }
    ]
  };