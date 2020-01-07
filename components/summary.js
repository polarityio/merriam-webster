'use strict'
polarity.export = PolarityComponent.extend({
  summary: Ember.computed.alias('block.data.summary')
});