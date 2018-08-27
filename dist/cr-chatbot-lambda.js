// Handles canned responses to help requests

'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Load the policy list in a global
// So it stays loaded as long as Lambda function is still hot
let policyList;

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
  try {
    if (!process.env.NOLOG) {
      console.log(JSON.stringify(event));
      console.log(`event.bot.name=${event.bot.name}`);
    }

    if (event.bot.name !== 'CR_chatbot') {
      callback('Invalid Bot Name');
    }

    // Make sure policy list is loaded
    if (!policyList) {
      s3.getObject({Bucket: 'cr-chatbot', Key: 'fees.json'}, (err, data) => {
        if (!data) {
          throw new Error('Error ' + err);
        }
        policyList = JSON.parse(data.Body.toString('ascii'));
        ready();
      });
    } else {
      ready();
    }

    function ready() {
      if (!handlers[event.currentIntent.name]) {
        throw new Error(`Intent ${event.currentIntent.name} not supported`);
      }
      handlers[event.currentIntent.name](event, (response) => callback(null, response));
    }
  } catch (err) {
    callback(err);
  }
};


const handlers = {
  'PolicyLookup': function(intentRequest, callback) {
    const slots = mapSlots(intentRequest.currentIntent);
    if (!slots.supplier || !slots.country) {
      throw new Error('Need supplier and country for PolicyLookup');
    }
    callback(buildTextResponse(getPolicy(slots.supplier, slots.country)));
  },
};


function mapSlots(intent) {
  const slots = {};
  let slot;

  // First copy over resolved slot details
  for (slot in intent.slotDetails) {
    if (slot && intent.slotDetails[slot] &&
      intent.slotDetails[slot].resolutions &&
      Array.isArray(intent.slotDetails[slot].resolutions) &&
      (intent.slotDetails[slot].resolutions.length > 0) &&
      intent.slotDetails[slot].resolutions[0].value) {
      slots[slot] = intent.slotDetails[slot].resolutions[0].value;
    }
  }

  // Now overlay any slots (if we didn't get slot details)
  for (slot in intent.slots) {
    if (slot && !slots[slot]) {
      slots[slot] = intent.slots[slot];
    }
  }

  return slots;
}


function buildTextResponse(text) {
  return {
    type: "Close",
    fulfillmentState: "Fulfilled",
    dialogAction: {
      message: {
        contentType: 'PlainText',
        content: text,
      },
    },
  };
}


function getPolicy(supplier, country) {
  const supplierUpper = supplier.toUpperCase();
  const countryUpper = country.toUpperCase();

  if (policyList[supplierUpper] && policyList[supplierUpper][countryUpper]) {
    return policyList[supplierUpper][countryUpper];
  }

  return 'Crossing International Borders is not permitted.';
}
