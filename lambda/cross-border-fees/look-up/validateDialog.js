const fees = require('../fees');
const utility = require('../utility');
const dialogActions = require('./dialogActions');

const availableSupplier = utility.availableGroup(fees).supplier;
const availablePickup = utility.availableGroup(fees).pickup;
const availableDropoff = utility.availableGroup(fees).dropoff;

/*// Wait until booking number api is available
  let invalidNumber = 'This is an invalid booking number. Please type correct number again.';
  if (!utility.hasNumber(bookingNumber)) {
    return utility.buildValidationResult(false, 'bookingNumber', invalidNumber);
  }
  if (bookingNumber.length < 7 || bookingNumber.length > 18) {
    return utility.buildValidationResult(false, 'bookingNumber', `Booking number is either too short or too long. Please type correct number again.`);
  }
  if (bookingNumber.indexOf(' ') > -1) {
    return utility.buildValidationResult(false, 'bookingNumber', `There should be no space in booking numbers. Please type correct number again.`);
  }
}*/

function validate(bookingNumber, supplier, pickupCountry, dropoffCountry) {
  if (supplier && availableSupplier.indexOf(supplier.toLowerCase()) === -1) {
    return utility.buildValidationResult(false, 'supplier', `We cannot find the supplier. Please make sure supplier name is correct.`);
  }
  if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) === -1) {
    return utility.buildValidationResult(false, 'pickupCountry', `We cannot find the pick up country. Please make sure country name is correct.`);
  }
  if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) === -1) {
    return utility.buildValidationResult(false, 'dropoffCountry', `We cannot find the drop off country. Please make sure country name is correct.`);
  }
  return utility.buildValidationResult(true, null, null);
}

module.exports = function(intentRequest, slots) {
  const validationResult = validate(slots.bookingNumber, slots.supplier, slots.pickupCountry, slots.dropoffCountry);
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
