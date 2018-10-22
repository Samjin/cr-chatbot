const csvFilePath = 'fees.csv'
const csv = require('csvtojson');
let fees;
csv().fromFile(csvFilePath).then((jsonObj)=>{
  fees = jsonObj;
})

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
  let feeAnswer;
  for (let i = 0; i < fees.length; i++) {
    let supplierName = fees[i]['Pickup Supplier'].toLowerCase().includes(supplier.toLowerCase());
    let pickupCountryName = fees[i]['Pickup Location'].toLowerCase().includes(pickupCountry.toLowerCase());
    let dropoffCountryName = fees[i]['Destination'].toLowerCase().includes(dropoffCountry.toLowerCase());
    if( supplierName && pickupCountryName && dropoffCountryName ) {
      feeAnswer = [
        `The cross border fee is ${fees[i]['Fee']}. `,
        `${fees[i]['Notes 1']} `,
        `${fees[i]['Notes 2']}`,
        `Thank you`
      ].join(' ');
      break;
    }
  }
  if (feeAnswer && feeAnswer.length) {return feeAnswer;}
  return 'I’m sorry, but travel to this location is not permitted by the local car rental company.';
}

module.exports = function(slots, callback) {
    if (!slots.bookingNumber || !slots.supplier || !slots.pickupCountry || !slots.dropoffCountry) {
      throw new Error('Need bookingNumber, or supplier or pick up country and dropoff country');
    }
    callback(null, buildTextResponse(getPolicy(slots.supplier, slots.pickupCountry, slots.dropoffCountry)));
};
