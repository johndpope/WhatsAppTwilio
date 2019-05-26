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

const client = require('twilio')(accountSid, authToken);



console.log("Twilionn");
console.log(process.env.DATABASE_URL);

function intervalFunc() {
    console.log(process.env.DATABASE_URL);
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
       /* var queryExec='Select SA.AppointmentNumber, SA.Description, U.MobilePhone from  ascendumfieldservice.ServiceAppointment SA ';
        queryExec=queryExec+'left join ascendumfieldservice.AssignedResource AR ON  CAST(SA.Id AS CHARACTER)= AR.ServiceAppointmentId ';
        queryExec=queryExec+'left join ascendumfieldservice.ServiceResource SR ON AR.ServiceResourceId=CAST(SR.Id AS CHARACTER) ';
        queryExec=queryExec+'left join ascendumfieldservice.User U on SR.RelatedRecordId= CAST(U.Id AS CHARACTER) ';
        queryExec=queryExec+ 'where SA.WhatsApp_Sent__c=false '*/
        var queryExec='Select SR.Name,U.MobilePhone from ascendumfieldservice.ServiceResource SR left join ascendumfieldservice.User U on SR.RelatedRecordId= CAST(U.Id AS CHARACTER)'

       
        conn.query(
           // 'Select SA.Subject, U.MobilePhone from   left join ascendumfieldservice.User U on SR.RelatedRecordId= U.Id',
            //'Select id from ascendumfieldservice.user',
            queryExec,

            function(err, result) {
                console.log("query executed");
               
                if (err != null || result.rowCount == 0) {
                    console.log("Error query"+err);
                }
                else {
                   
                    console.log(result.rows);
                   /* client.messages.create({
                        from: 'whatsapp:+14155238886',
                        body: 'Hello there!',
                        to: 'whatsapp:+34626561876'
                    })
                    .then(message => console.log(message.sid + "  ----> " +message.body));*/
                }
            }
        );
    });
}
    
 setInterval(intervalFunc, 15000);
app.set('port', process.env.PORT || 5000);
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