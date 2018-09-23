const fees = require('./fees');

// Route the incoming request based on intent.
// Request is provided in the event slot.
exports.handler = (event, context, callback) => {
  console.log(event, context, callback);
  try {
    if (!process.env.NOLOG) {
      console.log(JSON.stringify(event));
      console.log(`event.bot.name=${event.bot.name}`);
    }

    if (event.bot.name !== 'CR_chatbot') {
      callback('Invalid Bot Name');
    }

    ready(event, callback);
  } catch (err) {
    callback(err);
  }
};

function ready(event, callback) {
  if (!handlers[event.currentIntent.name]) {
    throw new Error(`Intent ${event.currentIntent.name} not supported`);
  }
  handlers[event.currentIntent.name](event, callback);
}

const handlers = {
  'PolicyLookup': function(intentRequest, callback) {
    const slots = mapSlots(intentRequest.currentIntent);
    if (!slots.supplier || !slots.country) {
      throw new Error('Need supplier and country for PolicyLookup');
    }
    callback(null, buildTextResponse(getPolicy(slots.supplier, slots.country)));
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
    dialogAction: {
      "type": "Close",
      "fulfillmentState": "Fulfilled",
      "message": {
        "contentType": "PlainText",
        "content": text
      }
    }
  };
}

function getPolicy(supplier, country) {
  let feeDetails;

  for (let i = 0; i < fees.length; i++) {
    let policyObj = fees[i]['Supplier'];
    let supplierName = policyObj.toLowerCase().includes(supplier.toLowerCase());
    let countryName = policyObj.toLowerCase().includes(country.toLowerCase());
    if( supplierName && countryName) {
      feeDetails = fees[i]['Cross Border Details'];
      break;
    }
  }

  if (feeDetails) {return feeDetails;}
  return 'Crossing International Borders is not permitted.';
}