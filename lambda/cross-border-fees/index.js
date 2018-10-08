const intentHandler = require('./look-up/intentHandler');

// Route the incoming request based on intent.
// Request is provided in the event slot.
exports.handler = (event, context, callback) => {
  console.log(event, context, callback);
  try {
    if (!process.env.NOLOG) {
      console.log(JSON.stringify(event));
      console.log(`event.bot.name=${event.bot.name}`);
    }

    if (event.bot.name !== 'CR_chatbot') {
      callback('Invalid Bot Name');
    }

    if (!intentHandler[event.currentIntent.name]) {
      throw new Error(`Intent ${event.currentIntent.name} not supported`);
    }
    intentHandler[event.currentIntent.name](event, callback);

  } catch (err) {
    callback(err);
  }
};
