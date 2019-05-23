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
console.log("Puerto de salida");
const client = require('twilio')(accountSid, authToken);
console.log("Twilio");
client.messages
    .create({
        from: 'whatsapp:+14155238886',
        body: 'Hello there!',
        to: 'whatsapp:+34689603272'
    })
    .then(message => console.log(message.sid + " " +message.body));
/*var client = new twilio(accountSid, authToken);*/

/*client.messages.create({
    body: 'Hello from Node',
    to: '+12345678901',  // Text this number
    from: '+03468960' // From a valid Twilio number
})
.then((message) => console.log(message.sid));*/
app.post('/', (req, res) => {
    const twiml = new MessagingResponse();
    twiml.message('The Robots are coming! Head for the hills!');
    console.log("-----------------------------------------------------------------------------------------------------------------");
    console.log(req.body);
    req.on('end', function() {
        var data = qs.parse(body);
        var jsonString = json.stringify(data);  
        var jsonDataObject = json.parse(jsonString);
    
        // log the received message
        console.log(jsonDataObject.Body);
      });
    console.log("--------------------------------------------------------------------------------------------------------------");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });
  app.post('/message', (req, res) => {
    console.log("$$-----------------------------------------------------------------------------------------------------------$$$");
    console.log(json.stringify(req));
    console.log(req.body.From);
    console.log(req.body.Body);
    console.log("$$$$-------------------------------------------------------------------------------------------------------------$$$");
    res.send(`<Response>
        <Message>
        Hello
        </Message>
        </Response>`)
  });
//app.post('/callback', function(req, res) {
    /*pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});/*
app.post("/chatbotJoin", function(req, res){

    console.log("My request-->"+req.body.firstName);
    var request = apiapp.textRequest(req.body.firstName, {
        sessionId: '123123'
    });
    console.log('Request send-->'+request);
    request.on('response', function(response) {
        console.log(response);
        res.send(response);
    });
    request.on('error', function(error) {
        console.log(error);
        res.send(error);
    });
    request.end();

});*/
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});