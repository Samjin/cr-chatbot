const utility = require('./utility');
const countries = require('./countries.json');
const intersection = require('lodash');

module.exports = {
    buildValidationResult: function(isValid, violatedSlot, messageContent) {
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
    },

    bookingNumber: function(bookingNumber) {
        if (bookingNumber && bookingNumber.trim().indexOf(' ') > -1) {
            return this.buildValidationResult(false, 'bookingNumber', `Booking number should not contain space or special characters. Please type correct number again.`)
        }
    },

    supplier: function(supplier, availableSupplier) {
        if (supplier && availableSupplier.indexOf(supplier.toLowerCase()) < 0) {
            return this.buildValidationResult(false, 'supplier', `We cannot find the supplier. Please make sure supplier name is correct.`)
        }
    },

    pickupCountry: function(pickupCountry, availablePickup) {
        let foundPickupCountrySynonyms = utility.findCountryNameSynonyms(countries, pickupCountry); //return array or false
        if (pickupCountry && availablePickup.indexOf(pickupCountry.toLowerCase()) < 0) {
            if (!foundPickupCountrySynonyms) {
                return this.buildValidationResult(false, 'pickupCountry', `We cannot find the pick up country. Please make sure country name is correct.`)
            }

            // Map synonyms to available data see if the country exist
            if (foundPickupCountrySynonyms) {
                let foundCommonName = intersection(foundPickupCountrySynonyms, availablePickup)[0]; //undefined or string
                pickupCountry = foundCommonName || pickupCountry;
                return this.buildValidationResult(false, 'pickupCountry', `We do not have cross border fee defined for this country. Please type another country name.`)
            }
        }
    },

    dropoffCountry: function(pickupCountry, dropoffCountry, availableDropoff) {
        if (pickupCountry && dropoffCountry && dropoffCountry.toLowerCase() === pickupCountry.toLowerCase()) {
            return this.buildValidationResult(false, 'dropoffCountry', `Your pick up and drop off location are same. Please type a different drop off country name`)
        }

        if (dropoffCountry && availableDropoff.indexOf(dropoffCountry.toLowerCase()) < 0) {
            if (!utility.findCountryNameSynonyms(countries, dropoffCountry)) {
                return this.buildValidationResult(false, 'dropoffCountry', `We cannot find the pick up country. Please make sure country name is correct.`)
            }
            return this.buildValidationResult(false, 'dropoffCountry', `The pick up country name is correct, but we do not have cross border fee defined for it. Please type another pick up country name`)
        }
    },
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