const fees = require('../fees');
const countries = require('../countries'); // Modified from https://fabian7593.github.io/CountryAPI/
const utility = require('../utility');
const validate = require('./validateDetails');
const dialogActions = require('./dialogActions');
const _intersection = require('lodash/intersection');

const availableCategories = utility.availableCategories(fees);
const availableSuppliers = availableCategories.supplier;
const availablePickup = availableCategories.pickup;
const availableDropoff = availableCategories.dropoff;

function validateSlots(bookingNumber, supplier, pickupCountry, dropoffCountry, slots) {
  // validate.bookingNumber(bookingNumber)
  // validate.supplier(supplier, availableSuppliers)
  // validate.pickupCountry(pickupCountry, availablePickup)
  // validate.dropoffCountry(pickupCountry, dropoffCountry, availableDropoff)

  //check if number contains only 0s. This is to prevent potential bugs
  if (/^0*$/.test(bookingNumber)) { 
    return validate.buildValidationResult(
      false,
      'bookingNumber',
      'Booking number should not be all zeros. Please try again.');
  }

  if (bookingNumber && bookingNumber.trim().indexOf(' ') >= 0) {
    return validate.buildValidationResult(
      false,
      'bookingNumber',
      'Booking number must not contain space or special characters. Please type correct number again.');
  }

  if (bookingNumber && !utility.hasNumber(bookingNumber)) {
    return validate.buildValidationResult(
      false,
      'bookingNumber',
      'Booking number must have numbers in it. Please try again.');
  }

  if (supplier) {
    if (supplier.length < 2) {
      return validate.buildValidationResult(
        false,
        'supplier',
        'We cannot find the supplier. Please make sure supplier name is correct.');
    }
    
    let foundSupplier = false;
    let foundSupplierFullName = availableSuppliers.indexOf(supplier.toLowerCase());

    // Find user's exact input supplier name.
    if (foundSupplierFullName >= 0) {
      slots.supplier = supplier.toLowerCase();
      supplier = supplier.toLowerCase();
      foundSupplier = true;
    } else {
      // Multiple words: convert to full supplier name if any name includes user's input
      availableSuppliers.forEach(supplierName => {
        if (supplierName.indexOf(' ') >= 0) {
          let supplierNameBreakdown = supplierName.split(' ');
          if (supplierNameBreakdown.indexOf(supplier.toLowerCase()) >= 0) {
            slots.supplier = supplierName;
            supplier = supplierName;
            foundSupplier = true;
          }
        }
      })
    }

    if (!foundSupplier) {
      return validate.buildValidationResult(false, 'supplier', `We cannot find the supplier. Please make sure supplier name is correct.`);
    }
  }

  let foundPickupCountrySynonyms = utility.findCountryNameByCode(countries, pickupCountry); //return array or false
  if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) < 0) {
    // Doesn't match any in country list and fee data
    if (foundPickupCountrySynonyms === false) {
      return validate.buildValidationResult(false, 'pickupCountry', `We cannot find the pick up country. Please make sure country name is correct.`);
    }

    // Map synonyms to fees data see if the country matches
    if (foundPickupCountrySynonyms) {
      let foundCommonName = _intersection(foundPickupCountrySynonyms, availablePickup)[0]; //undefined or string
      if (foundCommonName) {
        // Update slots value to match name in fee details for fulfillment
        slots.pickupCountry = foundCommonName;
      } else {
        // Found in country list but not in fees
        return validate.buildValidationResult(false, 'pickupCountry', `We do not have cross border fee defined for this country. Please type another country name.`);
      }
    }
  }

  let foundDropoffCountrySynonyms = utility.findCountryNameByCode(countries, dropoffCountry); //array or false
  if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) < 0) {
    // Doesn't match any in country list and fee data
    if (foundDropoffCountrySynonyms === false) {
      return validate.buildValidationResult(false, 'dropoffCountry', `We cannot find the drop off country. Please make sure country name is correct.`);
    }

    let foundCommonName = _intersection(foundDropoffCountrySynonyms, availableDropoff)[0]; //undefined or string
    if (foundCommonName) {
      // Update slots value to match name in fee details for fulfillment
      slots.dropoffCountry = foundCommonName;
    } else {
      // Found in country list but not in fees
      return validate.buildValidationResult(false, 'dropoffCountry', `We do not have cross border fee defined for this country. Please type another country name.`);
    }
  }

  if (pickupCountry && dropoffCountry && dropoffCountry.toLowerCase() === pickupCountry.toLowerCase()) {
    return validate.buildValidationResult(false, 'dropoffCountry', `Your pick up and drop off location are same. Please type a different drop off country name`);
  }

  return validate.buildValidationResult(true, null, null);
}

module.exports = function (intentRequest, slots) {
  // Get raw booking number free text instead of validated text from AI.
  if (slots.bookingNumber === null && slots.supplier === null && slots.pickupCountry === null && slots.dropoffCountry === null) {
    if (utility.hasNumber(intentRequest.inputTranscript)) {
      slots.bookingNumber = intentRequest.inputTranscript;
    }
  }

  const validationResult = validateSlots(
    slots.bookingNumber,
    slots.supplier,
    slots.pickupCountry,
    slots.dropoffCountry,
    slots
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