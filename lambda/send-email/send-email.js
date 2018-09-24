//TODO: this needs to e added to Makefile
var AWS = require('aws-sdk')
AWS.config.region = 'us-west-2';
var ses = new AWS.SES()

var RECEIVER = 'sjin@carrentals.com'
var SENDER = 'sjin@carrentals.com'

exports.handler = function (event, context) {
  sendEmail(event, function (err, data) {
    context.done(err, null)
  })
}

function sendEmail (event, done) {
  var params = {
    Destination: {
      ToAddresses: [
        RECEIVER
      ]
    },
    Message: {
      Body: {
        Text: {
          Data: JSON.stringify(event, null, 2),
          Charset: 'UTF-8'
        }
      },
      Subject: {
        Data: 'Youtube AWS Lambda https://www.youtube.com/user/kaihendry',
        Charset: 'UTF-8'
      }
    },
    Source: SENDER
  }
  ses.sendEmail(params, done)
}