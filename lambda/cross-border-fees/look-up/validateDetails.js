// TODO: move detailed validation logic from validateDialog to here
// const utility = require('./utility');
// const countries = require('./countries.json');
// const _intersection = require('lodash');

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

    // Wait until booking number api is available
    // bookingNumber: function(bookingNumber) {
    //     if (bookingNumber && bookingNumber.trim().indexOf(' ') > -1) {
    //         return this.buildValidationResult(false, 'bookingNumber', `Booking number should not contain space or special characters. Please type correct number again.`);
    //     }

    //     if (bookingNumber && !utility.hasNumber(bookingNumber)) {
    //         return this.buildValidationResult(false, 'bookingNumber', 'Booking number should have numbers in it. Please try again.');
    //     }

    //     if (bookingNumber.length < 7 || bookingNumber.length > 18) {
    //         return this.buildValidationResult(false, 'bookingNumber', `Booking number is either too short or too long. Please type correct number again.`);
    //     }
    //     if (bookingNumber.indexOf(' ') > -1) {
    //         return this.buildValidationResult(false, 'bookingNumber', `There should be no space in booking numbers. Please type correct number again.`);
    //     }
    // },

}
