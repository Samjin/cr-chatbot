const fees = require('../fees');
const dialogActions = require('./dialogActions');

function getPolicyMessage(supplier, pickupCountry, dropoffCountry) {
  let feeAnswer;
  for (let i = 0; i < fees.length; i++) {
    let supplierName = fees[i]['Pickup Supplier'].toLowerCase().includes(supplier.toLowerCase());
    let pickupCountryName = fees[i]['Pickup Location'].toLowerCase().includes(pickupCountry.toLowerCase());
    let dropoffCountryName = fees[i]['Destination'].toLowerCase().includes(dropoffCountry.toLowerCase());
    if( supplierName && pickupCountryName && dropoffCountryName ) {
      let feeAmount = fees[i]['Fee'];
      let feeAtCounter = false;

      // If fee is Free of charge
      if (feeAmount.toLowerCase().includes('free of charge')) {
        feeAmount.toLowerCase();
      } else
      // If fee can only get at pickup counter.
      if (feeAmount.toLowerCase().includes('please enquire')) {
        feeAtCounter = true;
      }

      feeAnswer = [
        feeAtCounter ? `${feeAmount}. ` : `The cross border fee is ${feeAmount}. `,
        `${fees[i]['Notes 1']} `,
        `${fees[i]['Notes 2']} `,
        `Thank you.`
      ].join(' ');

      break;
    }
  }
  if (feeAnswer && feeAnswer.length) {return feeAnswer;}
  return 'I’m sorry, but travel to this location is not permitted by the local car rental company.';
}

module.exports = function(intentRequest, slots, callback) {
    if (!slots.bookingNumber || !slots.supplier || !slots.pickupCountry || !slots.dropoffCountry) {
      throw new Error('Need bookingNumber, or supplier or pick up country and dropoff country');
    }
  let message = {
    contentType: 'PlainText',
    content: getPolicyMessage(slots.supplier, slots.pickupCountry, slots.dropoffCountry)
  }
  callback(null, dialogActions.close(intentRequest.sessionAttributes, 'Fulfilled', message));
};
