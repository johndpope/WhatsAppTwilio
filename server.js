var express = require('express');
var bodyParser = require('body-parser');
var json = require('json');
var pg = require('pg');
var http = require('http');
var twilio = require('twilio');
var intl =require("intl");
const dateFormatterAT = new Intl.DateTimeFormat("es-ES");
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

function intervalFunc() {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        var queryExec='Select SA.sfId, A.Name, SA.Status, SA.SchedStartTime, SA.AppointmentNumber, SA.Description, U.MobilePhone, SA.WhatsApp_Sent__c from  ascendumfieldservice.ServiceAppointment SA ';
        queryExec=queryExec+'left join ascendumfieldservice.Account A ON  A.sfId= SA.AccountId ';
        queryExec=queryExec+'left join ascendumfieldservice.AssignedResource AR ON  SA.sfId= AR.ServiceAppointmentId ';
        queryExec=queryExec+'left join ascendumfieldservice.ServiceResource SR ON AR.ServiceResourceId=SR.sfId ';
        queryExec=queryExec+'left join ascendumfieldservice.User U on SR.RelatedRecordId= U.sfId ';
        queryExec=queryExec+ 'where SA.WhatsApp_Sent__c=false and status= \'Dispatched\' ';

       
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
                   result.rows.forEach(function(appointment){
                       console.log("formateando fecha");
                        var format = dateFormatterAT.format(appointment.SchedStartTime); 
                        console.log("fechaformateada");
                        client.messages.create({
                            from: 'whatsapp:+14155238886',
                            body: 'You have an appointment with '+appointment.name +' on ' + format,
                            to: 'whatsapp:'+appointment.mobilephone
                        })
                        .then(message => console.log(message.sid + "  ----> " +message.body));
                   })
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