var AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
var ses = new AWS.SES()

var RECEIVER = 'cbchatbot@l-a7v9ucfmwj4gvou6qfs9e8ihjxgxmbatdn64a8melg92ku2yy.61-z8h3eac.na34.apex.salesforce.com'
var SENDER = 'critops@expedia.com'

exports.handler = function (event, context) {
  sendEmail(event, function (err, data) {
    context.done(err, null)
  })
}

// 'bezhang@carrentals.com',
function sendEmail (event, done) {
  var params = {
    Destination: {
      ToAddresses: [
        RECEIVER
      ],
      BccAddresses: [
        'bezhang@carrentals.com',
        'sjin@carrentals.com'
      ],
    },
    Message: {
      Body: {
        Text: {
          Data: JSON.stringify(event, null, 2),
          Charset: 'UTF-8'
        }
      },
      Subject: {
        Data: 'Carrentals chatbot: cross border fees',
        Charset: 'UTF-8'
      }
    },
    Source: SENDER
  }
  ses.sendEmail(params, done)
}