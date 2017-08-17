var express = require('express');
var request = require('request');
var router = express.Router();


// for Facebook verification
router.get('/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
      if (event.message && event.message.text) {
        let text = event.message.text
        sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
      }
    }
    res.sendStatus(200)
})


router.get('/setup', function (req, res){
    setupGetStartedButton(res);
    setupPersistentMenu(res);
    setupGreetingText(res);
});

function setupGreetingText(res){
var messageData = {
    "greeting":[
        {
        "locale":"default",
        "text":"Greeting text for default local !"
        }, {
        "locale":"en_US",
        "text":"Greeting text for en_US local !"
        }
    ]};
request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ process.env.PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});

}

function setupPersistentMenu(res){
var messageData = 
    {"persistent_menu":[
        {
        "locale":"default",
        "composer_input_disabled":true,
        "call_to_actions":[
            {
            "title":"How Can I help you?",
            "type":"nested",
            "call_to_actions":[
                {
                "title":"Create a list",
                "type":"postback",
                "payload":"HELP_PAYLOAD"
                },
                {
                "title":"View List",
                "type":"postback",
                "payload":"CONTACT_INFO_PAYLOAD"
                }
            ]
            },
            {
            "type":"web_url",
            "title":"Visit website ",
            "url":"http://www.techiediaries.com",
            "webview_height_ratio":"full"
            }
        ]
        },
        {
        "locale":"zh_CN",
        "composer_input_disabled":false
        }
    ]};  
// Start the request
request({
    url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ process.env.PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});

}


function setupGetStartedButton(res){
var messageData = {
        "get_started":{
            "payload":"getstarted"
        }
};
// Start the request
request({
    url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ process.env.PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});
}

router.post('/', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
   
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);

  }
  
});

function sendGenericMessage(recipientId, event) {

  // To be expanded in later sections
  // 
  // 
  var button = {
    "recipient":{
    "id":recipientId
    },
    "message":{
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"What do you want to do next?",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://petersapparel.parseapp.com",
              "title":"Show Website"
            },
            {
              "type":"web_url",
              "url":"www.naver.com",
              "title":"Start Chatting",
            }
          ]
        }
      }
    }
  }
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: button
  });

}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

function receivedMessage(event) {
  console.log(event);
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID, event);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}


module.exports = router;