// https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html
const utility = require('../utility');

// Go to an intent
module.exports.elicitIntent = function(sessionAttributes, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitIntent',
      message
    }
  };
};

// Let amazon lex decide
module.exports.delegate = function(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Delegate',
      slots
    }
  };
};

// Go to a slot
module.exports.elicitSlot = function(sessionAttributes, intentName, slots, slotToElicit, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message,
    }
  };
};

// Yes or no to confirm
module.exports.confirmIntent = function(sessionAttributes, intentName, slots, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ConfirmIntent',
      intentName,
      slots,
      message,
    }
  };
};

// No future response
module.exports.close = function(sessionAttributes, fulfillmentState, message, genericAttachments) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
      responseCard: utility.getResponseCard(genericAttachments),
    }
  };
};
