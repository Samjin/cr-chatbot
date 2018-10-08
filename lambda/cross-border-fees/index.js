const intentHandler = require('./look-up/intentHandler');

exports.handler = (event, context, callback) => {
  console.log(event, context, callback);
  try {
    if (event.bot.name !== 'CR_chatbot') {
      callback('Invalid Bot Name');
    }

    const intentName = event.currentIntent.name
    if (intentHandler[intentName]) {
      return intentHandler[intentName](event, callback)
    }

    throw new Error(`Intent ${event.currentIntent.name} not supported`);

  } catch (err) {
    callback(err);
  }
};
