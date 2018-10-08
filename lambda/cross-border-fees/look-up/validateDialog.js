const dialogAction = require('../dialogAction');
const utility = require('../utility');

const availableSupplier = utility.availableGroup.supplier;
const availablePickup = utility.availableGroup.pickup;
const availableDropoff = utility.availableGroup.dropoff;

function hasNumber(myString) {
  return /\d/.test(myString);
}

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent === null) {
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
  if (!hasNumber(bookingNumber) && bookingNumber.length > 6) {
    return buildValidationResult(false, 'bookingNumber', `This is an invalid booking number.`);
  }

  if (supplier && availableSupplier.indexOf(supplier.toLowerCase()) === -1) {
    return buildValidationResult(false, 'supplier', `We could not find that supplier. Please type correct supplier name.`);
  }

  if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) === -1) {
    return buildValidationResult(false, 'pickupCountry', `We could not find that country for pick up. Please type correct country name.`);
  }

  if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) === -1) {
    return buildValidationResult(false, 'dropoffCountry', `We could not find that country for pick up. Please type correct country name.`);
  }

  return buildValidationResult(true, null, null);
}

module.exports = function(intentRequest, slots) {
  if (slots.bookingNumber || slots.supplier || slots.pickupCountry || slots.dropoffCountry) {
    const validationResult = validateDialog(slots.bookingNumber, slots.supplier, slots.pickupCountry, slots.dropoffCountry);

    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      return Promise.resolve(
        dialogAction.elicitSlot(
          intentRequest.sessionAttributes,
          intentRequest.currentIntent.name,
          slots,
          validationResult.violatedSlot,
          validationResult.message,
        )
      );
    }

    return Promise.resolve(dialogAction.delegate(intentRequest.sessionAttributes, slots));
  }
};
