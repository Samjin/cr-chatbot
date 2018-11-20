const validateDialog = require('./validateDialog');
const fulfillment = require('./fulfillment');
const utility = require('../utility');

module.exports = {
  PolicyLookup: function(intentRequest, callback) {
    const slots = utility.mapSlots(intentRequest.currentIntent);
    const source = intentRequest.invocationSource;

    if (source === 'DialogCodeHook') {
      return validateDialog(intentRequest, slots);
    }

    if (source === 'FulfillmentCodeHook') {
      return fulfillment(intentRequest, slots, callback);
    }
  },
};
