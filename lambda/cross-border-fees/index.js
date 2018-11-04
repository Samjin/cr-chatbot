const intentHandler = require('./look-up/intentHandler');
const utility = require('./utility');

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
    return utility.buildValidationResult(false, 'intentName', `I am sorry. I don't understand your question. Please type 'cross border feees' as starting question.`);

  } catch (err) {
    callback(err);
  }
};
