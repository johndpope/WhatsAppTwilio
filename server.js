var express = require('express');
var bodyParser = require('body-parser');
var json = require('json');
var pg = require('pg');
var http = require('http');
var twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

var app = express();
var apiai = require('apiai');
var apiapp = apiai("d2aa27c7939543549982acb558ef8796");

var qs = require('qs');
var assert = require('assert');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(bodyParser.json());

var accountSid = 'AC67968749065aa4c24a598fb476e3ee1e'; // Your Account SID from www.twilio.com/console
var authToken = 'b1993d51e0dfeff9bf683e82b870f5e8'; // Your Auth Token from www.twilio.com/console
app.set('port', process.env.PORT || 5000);
const client = require('twilio')(accountSid, authToken);



console.log("Twilio");
client.messages.create({
        from: 'whatsapp:+14155238886',
        body: 'Hello there!',
        to: 'whatsapp:+34689603272'
    })
    .then(message => console.log(message.sid + "  ----> " +message.body));

app.post('/', (req, res) => {
    const twiml = new MessagingResponse();
    twiml.message('Helloo you say: '); 
    console.log("------------------------SEND MESSAGE------------------------");
    console.log("SmsMessageSid: "+req.body.SmsMessageSid);
    console.log("From: " +req.body.From);
    console.log("MessageSid: "+req.body.MessageSid);
    var message = req.body.Body;
    console.log("Message: " + message);
    twiml.message(message);    
    console.log("-------------------------------------------------------------");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});