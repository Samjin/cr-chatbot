const fees = require('../fees');
const countries = require('../countries');
const utility = require('../utility');
const dialogActions = require('./dialogActions');

const availableSupplier = utility.availableGroup(fees).supplier;
const availablePickup = utility.availableGroup(fees).pickup;
const availableDropoff = utility.availableGroup(fees).dropoff;

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
    message: {
      contentType: 'PlainText',
      content: messageContent
    },
  };
}

/*// Wait until booking number api is available
  let invalidNumber = 'This is an invalid booking number. Please type correct number again.';
  if (!utility.hasNumber(bookingNumber)) {
    return buildValidationResult(false, 'bookingNumber', invalidNumber);
  }
  if (bookingNumber.length < 7 || bookingNumber.length > 18) {
    return buildValidationResult(false, 'bookingNumber', `Booking number is either too short or too long. Please type correct number again.`);
  }
  if (bookingNumber.indexOf(' ') > -1) {
    return buildValidationResult(false, 'bookingNumber', `There should be no space in booking numbers. Please type correct number again.`);
  }
}*/

function validateSlots(bookingNumber, supplier, pickupCountry, dropoffCountry) {
  if (bookingNumber && bookingNumber.trim().indexOf(' ') > -1) {
    return buildValidationResult(false, 'bookingNumber', `Booking number should not contain space or special characters. Please type correct number again.`);
  }

  if (supplier && availableSupplier.indexOf(supplier.toLowerCase()) === -1) {
    return buildValidationResult(false, 'supplier', `We cannot find the supplier. Please make sure supplier name is correct.`);
  }

  if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) === -1) {
    if (!utility.findCountryName(countries, pickupCountry)) {
      return buildValidationResult(false, 'pickupCountry', `We cannot find the pick up country. Please make sure country name is correct.`);
    }
    return buildValidationResult(false, 'pickupCountry', `We do not have cross border fee defined for this pick up country.`);
  }

  if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) === -1) {
    if (!utility.findCountryName(countries, dropoffCountry)) {
      return buildValidationResult(false, 'dropoffCountry', `We cannot find the pick up country. Please make sure country name is correct.`);
    }
    return buildValidationResult(false, 'dropoffCountry', `We do not have cross border fee defined for this pick up country.`);
  }

  // Same pickup and dropoff country
  if (pickupCountry && dropoffCountry && dropoffCountry.toLowerCase() === pickupCountry.toLowerCase()) {
    return buildValidationResult(false, 'dropoffCountry', `Your pick up and drop off location are same. Please type a different drop off country name`);
  }
  return buildValidationResult(true, null, null);
}

module.exports = function (intentRequest, slots) {
  // Get original booking number to catch free text instead
  // of validated text from lex.
  let bookingNumberTranscript = null;
  if (slots.bookingNumber && intentRequest.inputTranscript) {
    bookingNumberTranscript = intentRequest.inputTranscript;
  }

  const validationResult = validateSlots(
    bookingNumberTranscript,
    slots.supplier,
    slots.pickupCountry,
    slots.dropoffCountry
  );

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