const fees = require('../fees2');
const utility = require('../utility');
const dialogActions = require('../dialogActions');

const availableSupplier = utility.availableGroup(fees).supplier;
const availablePickup = utility.availableGroup(fees).pickup;
const availableDropoff = utility.availableGroup(fees).dropoff;

function hasNumber(myString) {
  return /\d/.test(myString);
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (!messageContent) {
    return {
      isValid,
      violatedSlot,
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: 'PlainText', content: messageContent },
  };
}

function validateDialog(bookingNumber, supplier, pickupCountry, dropoffCountry) {
  // let invalidNumber = 'This is an invalid booking number. Please type correct number again.';
  // if (!hasNumber(bookingNumber)) {
  //   return buildValidationResult(false, 'bookingNumber', invalidNumber);
  // }
  // if (bookingNumber.length < 7 || bookingNumber.length > 18) {
  //   return buildValidationResult(false, 'bookingNumber', `Booking number is either too short or too long. Please type correct number again.`);
  // }
  // if (bookingNumber.indexOf(' ') > -1) {
  //   return buildValidationResult(false, 'bookingNumber', `There should be no space in booking numbers. Please type correct number again.`);
  // }

  if (supplier && availableSupplier.indexOf(supplier.toLowerCase()) === -1) {
    return buildValidationResult(false, 'supplier', `We cannot find the supplier. Please type correct supplier name.`);
  }

  if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) === -1) {
    return buildValidationResult(false, 'pickupCountry', `We cannot find the pick up country. Please type correct country name.`);
  }

  if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) === -1) {
    return buildValidationResult(false, 'dropoffCountry', `We cannot find the drop off country. Please type correct country name.`);
  }

  return buildValidationResult(true, null, '');
}

module.exports = function(intentRequest, slots) {
  // if (slots.bookingNumber == null && slots.supplier == null && slots.pickupCountry == null && slots.dropoffCountry == null) {
  //   return Promise.resolve(dialogActions.delegate(intentRequest.sessionAttributes, slots));
  // }
  const validationResult = validateDialog(slots.bookingNumber, slots.supplier, slots.pickupCountry, slots.dropoffCountry);
  if (!validationResult.isValid) {
    slots[`${validationResult.violatedSlot}`] = null;
    return Promise.resolve(
      dialogActions.elicitSlot(
        intentRequest.sessionAttributes,
        intentRequest.currentIntent.name,
        slots,
        validationResult.violatedSlot,
        validationResult.message,
        )
      );
  }
  return Promise.resolve(dialogActions.delegate(intentRequest.sessionAttributes, slots));
};
