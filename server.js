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
    twiml.message('Helloo'); 
    console.log("---------------------------------------------------------");
    console.log(req.body);
    req.on('end', function() {
        var data = qs.parse(body);
        var jsonString = json.stringify(data);  
        var jsonDataObject = json.parse(jsonString);
        console.log("SmsMessageSid "+jsonDataObject.Body.SmsMessageSid);
        console.log("From:" +jsonDataObject.Body.From);
        console.log("MessageSid "+jsonDataObject.Body.MessageSid);
        var message = jsonDataObject.Body.body;
        console.log("Message" + message);
        if (message == ":)"){
            twiml.message(':)');    
        }else{
            twiml.message(':(');
        }
      });
    console.log("-----------------------------------------------------------");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});