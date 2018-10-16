const fees = require('../fees2');

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
  return 'I’m sorry, but travel to this location is not permitted by the local car rental company.';
}

module.exports = function(slots, callback) {
    if (!slots.bookingNumber || !slots.supplier || !slots.pickupCountry || !slots.dropoffCountry) {
      throw new Error('Need bookingNumber, supplier and country for PolicyLookup');
    }
    callback(null, buildTextResponse(getPolicy(slots.supplier, slots.pickupCountry, slots.dropoffCountry)));
};
