module.exports = {
  mapSlots: function(intent) {
    const slots = {};
    let slot;
    // First copy over resolved slot details
    for (slot in intent.slotDetails) {
      if (
        slot && intent.slotDetails[slot] &&
        intent.slotDetails[slot].resolutions &&
        Array.isArray(intent.slotDetails[slot].resolutions) &&
        (intent.slotDetails[slot].resolutions.length > 0) &&
        intent.slotDetails[slot].resolutions[0].value
      ) {
        slots[slot] = intent.slotDetails[slot].resolutions[0].value;
      }
    }
    // Now overlay any slots (if we didn't get slot details)
    for (slot in intent.slots) {
      if (!slots[slot]) {
        slots[slot] = intent.slots[slot];
      }
    }

    return slots;
  },
  availableCategories: function(fees) {
    let availableCategories = {
      supplier: [],
      pickup: [],
      dropoff: []
    }
    fees.forEach((item) => {
      availableCategories.supplier.push(item['Pickup Supplier'].toLowerCase().trim());
      availableCategories.pickup.push(item['Pickup Location'].toLowerCase().trim());
      availableCategories.dropoff.push(item['Destination'].toLowerCase().trim());
    });
    return availableCategories;
  },
  hasNumber: function(string) {
    return /\d/.test(string);
  },
  getResponseCard: function(genericAttachments) {
    //set 1 to make card visible on UI.
    return {
      version: '0',
      contentType: 'application/vnd.amazonaws.card.generic',
      genericAttachments: [genericAttachments],
    };
  },
  findCountryNameByCode: function(countries, name) {
    if (!name) { return false }
    let validCountryNames = false;

    for (var i = 0; i < countries.Response.length; i++) {
      let item = countries.Response[i];
      let synonymsLowercase = [
        item.Name.toLowerCase(),
        item.Alpha2Code.toLowerCase(),
        item.Alpha3Code.toLowerCase(),
      ];
      if (item.CustomCode) {
        synonymsLowercase.push(item.CustomCode.toLowerCase())
      }
      let nameExist = synonymsLowercase.includes(name.toLowerCase().trim());

      if (nameExist) {
        validCountryNames = synonymsLowercase;
        break;
      }
    }

    return validCountryNames;
  },
}