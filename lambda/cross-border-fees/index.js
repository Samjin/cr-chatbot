const fees = require('./fees2')
const validationResponse = require('./validationResponse')

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

    if (!handlers[event.currentIntent.name]) {
      throw new Error(`Intent ${event.currentIntent.name} not supported`);
    }
    handlers[event.currentIntent.name](event, callback);

  } catch (err) {
    callback(err);
  }
};

const handlers = {
  'PolicyLookup': function(intentRequest, callback) {
    const slots = mapSlots(intentRequest.currentIntent);
    const source = intentRequest.invocationSource; //dialog codehook

    if(source === 'DialogCodeHook') {
      callback(validationResponse.delegate(intentRequest.sessionAttributes, intentRequest.currentIntent.slots));
      return;
    }

    if (!slots.supplier || !slots.pickupCountry || !slots.dropoffCountry) {
      throw new Error('Need supplier and country for PolicyLookup');
    }
    callback(null, buildTextResponse(getPolicy(slots.supplier, slots.pickupCountry, slots.dropoffCountry)));
  }
};

function mapSlots(intent) {
  const slots = {};
  let slot;

  // First copy over resolved slot details
  for (slot in intent.slotDetails) {
    if (
      slot && intent.slotDetails[slot] &&
      intent.slotDetails[slot].resolutions &&
      Array.isArray(intent.slotDetails[slot].resolutions) &&
      (intent.slotDetails[slot].resolutions.length > 0) &&
      intent.slotDetails[slot].resolutions[0].value
    ) {
      slots[slot] = intent.slotDetails[slot].resolutions[0].value;
    }
  }

  // Now overlay any slots (if we didn't get slot details)
  for (slot in intent.slots) {
    if (!slots[slot]) {
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

function getPolicy(supplier, pickupCountry, dropoffCountry) {
  let feeDetails;

  for (let i = 0; i < fees.length; i++) {
    let supplierName = fees[i]['Pickup Supplier'].toLowerCase().includes(supplier.toLowerCase());
    let pickupCountryName = fees[i]['Pickup Location'].toLowerCase().includes(pickupCountry.toLowerCase());
    let dropoffCountryName = fees[i]['Destination'].toLowerCase().includes(dropoffCountry.toLowerCase());
    if( supplierName && pickupCountryName && dropoffCountryName ) {
      feeDetails = [
        `The cross border fee is ${fees[i]['Fee']}. `,
        `${fees[i]['Notes 1']} `,
        `${fees[i]['Notes 2']}`
      ].join(' ');
      break;
    }
  }

  if (feeDetails) {return feeDetails;}
  return 'Crossing International Borders is not permitted.';
}
