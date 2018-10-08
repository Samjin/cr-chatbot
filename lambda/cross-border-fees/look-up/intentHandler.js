const validateDialogs = require('./validateDialogs');
const validateFullfilment = require('./validateFullfilment');
const utility = require('../utility');

module.exports = {
  PolicyLookup: function(intentRequest, callback) {
    const slots = utility.mapSlots(intentRequest.currentIntent);
    const source = intentRequest.invocationSource;

    if (source === 'DialogCodeHook') {
      return validateDialogs(intentRequest, slots, callback);
    }

    if (source === 'FulfillmentCodeHook') {
      return validateFullfilment(slots, callback);
    }
  }
};
