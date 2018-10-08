module.export = {
    mapSlots: function (intent) {
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
    availableGroup: function (fees, item) {
        let availableGroup = {
            supplier: [],
            pickup: [],
            dropoff: []
        }
        fees.forEach((item) => {
            availableGroup.supplier.push(item['Pickup Supplier'].toLowerCase());
            availableGroup.pickup.push(item['Pickup Location'].toLowerCase());
            availableGroup.dropoff.push(item['Destination'].toLowerCase());
        });
        return availableGroup;
    }
}