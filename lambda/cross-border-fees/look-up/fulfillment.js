const fees = require('../fees');
const dialogActions = require('./dialogActions');

function getPolicyMessage(supplier, pickupCountry, dropoffCountry) {
  let feeAnswer;
  for (let i = 0; i < fees.length; i++) {
    let eachObj = fees[i];
    let supplierName = eachObj['Pickup Supplier'].toLowerCase().includes(supplier.toLowerCase());
    let pickupCountryName = eachObj['Pickup Location'].toLowerCase().includes(pickupCountry.toLowerCase());
    let dropoffCountryName = eachObj['Destination'].toLowerCase().includes(dropoffCountry.toLowerCase());
    if( supplierName && pickupCountryName && dropoffCountryName ) {
      let feeAmount = eachObj['Fee'];
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
        `${eachObj['Notes 1']} `,
        `${eachObj['Notes 2']} `,
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
    throw new Error('Need bookingNumber, supplier, pick up country and drop off country');
  }

  let message = {
    contentType: 'PlainText',
    content: getPolicyMessage(slots.supplier, slots.pickupCountry, slots.dropoffCountry),
  }

  // responseCard prop
  let genericAttachments = {
    title: 'Can I help you to look up another cross border fee?',
    imageUrl: null,
    subTitle: null,
    attachmentLinkUrl: null,
    buttons: [{
      "text": "Yes",
      "value": "Restart cross border fees",
    }, {
      "text": "No",
      "value": "no",
    }],
  }

  callback(null, dialogActions.close(intentRequest.sessionAttributes, 'Fulfilled', message, genericAttachments));

  // possible to use confirmIntent to add follow up question?
  // return Promise.resolve(dialogActions.confirmIntent(intentRequest.sessionAttributes, 'ConfirmIntent', message, genericAttachments));
};
