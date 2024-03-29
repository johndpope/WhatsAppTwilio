var express = require('express');
var bodyParser = require('body-parser');
var json = require('json');
var pg = require('pg');
var http = require('http');
var twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var intl = require("intl");
var EventEmitter = require('events');
var apiai = require('apiai');
var qs = require('qs');
var assert = require('assert');
var EventEmitter = require('events');
var accountSid = process.env.Twilio_accountSid; // Your Account SID from www.twilio.com/console
var authToken = process.env.Twilio_authToken; // Your Auth Token from www.twilio.com/console

const client = require('twilio')(accountSid, authToken);

const dateFormatterAT = new Intl.DateTimeFormat("es-ES");


var app = express();

var apiapp = apiai(process.env.apiai_Token);





app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));
app.use(bodyParser.json());




//pg.on('notice', (msg) => console.warn('notice:', msg))
 



var ee = new EventEmitter()
ee.on('message', function (text) {
        console.log(text)
    });

    var ee = new EventEmitter()
ee.on('Account, Interval poll found 1 changes', function (text) {
    console.log('Que narices hag0-->' + text)
})

console.log("Twilionn"); 

function intervalFunc() {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        var queryExec = 'Select SA.sfId, A.Name, C.FirstName, C.LastName, C.Salutation, C.mobilephone, ASS.Model__c, ASS.SerialNumber, ASS.Name as AssetName, SA.Status, SA.SchedStartTime,'
        queryExec = queryExec + 'SA.AppointmentNumber, SA.Description, U.MobilePhone as ServiceResourceMobile, SA.WhatsApp_Sent__c, SR.Name as Technician ';
        queryExec = queryExec + ' from  ascendumfieldservice.ServiceAppointment SA ';
        queryExec = queryExec + 'left join ascendumfieldservice.Contact C ON  C.sfId= SA.ContactId ';
        queryExec = queryExec + 'left join ascendumfieldservice.Account A ON  A.sfId= SA.AccountId ';
        queryExec = queryExec + 'left join ascendumfieldservice.Asset ASS ON  ASS.sfId= SA.Asset__c ';
        queryExec = queryExec + 'left join ascendumfieldservice.AssignedResource AR ON  SA.sfId= AR.ServiceAppointmentId ';
        queryExec = queryExec + 'left join ascendumfieldservice.ServiceResource SR ON AR.ServiceResourceId=SR.sfId ';
        queryExec = queryExec + 'left join ascendumfieldservice.User U on SR.RelatedRecordId= U.sfId ';
        queryExec = queryExec + 'where SA.WhatsApp_Sent__c=false and status= \'Dispatched\' ';


        conn.query(
            // 'Select SA.Subject, U.MobilePhone from   left join ascendumfieldservice.User U on SR.RelatedRecordId= U.Id',
            //'Select id from ascendumfieldservice.user',
            queryExec,

            function (err, result) {
                console.log("query executed");

                if (err != null) {
                    console.log("Error query-->" + err);
                } else if (result.rowCount == 0) {
                    console.log("No WhatsApp To be sent");
                } else {
                    console.log("Returned record-->" + result.rowCount);
                    result.rows.forEach(function (appointment) {
                        console.log('appointment-->' + JSON.stringify(appointment));
                        var visitDate = dateFormatterAT.format(appointment.SchedStartTime);
                        var textMessage = appointment.salutation + ' ' + appointment.firstname + ' ' + appointment.lastname + ' our Technician ' + appointment.technician;
                        textMessage = textMessage + ' will go to solve your issue in the asset ' + appointment.assetname; //+' Model '+appointment.Model__c;
                        textMessage = textMessage + ' with Serial Number ' + appointment.SerialNumber + ' the next ' + visitDate + '. His mobile phone to contact with him is ' + appointment.serviceresourcemobile;
                        console.log(textMessage);
                        client.messages.create({
                                from: 'whatsapp:+14155238886',
                                body: textMessage,
                                to: 'whatsapp:' + appointment.mobilephone
                            })
                            .then(message => console.log(message.sid + "  ----> " + message.body));
                        var updatExcec = 'UPDATE ascendumfieldservice.ServiceAppointment SET WhatsApp_Sent__c = true Where sfId=\'' + appointment.sfid + '\'';
                        console.log(updatExcec);
                        conn.query(updatExcec,
                            function (err, result) {
                                if (err != null) {
                                    console.log("Error Update-->" + err);
                                } else if (result.rowCount == 0) {
                                    console.log("No updated records");
                                } else {
                                    console.log("Records Updated");
                                }
                            }
                        );
                    })

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
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        var queryExec = 'Select A.sfId AccountId, c.sfId ContactId'
        queryExec = queryExec + ' from  ascendumfieldservice.Account A ';
        queryExec = queryExec + 'left join ascendumfieldservice.Contact C ON  A.sfId= C.AccountId ';
        queryExec = queryExec + 'where C.MobilePhone = \'' + req.body.From.replace("whatsapp:", "") + '\'';
        console.log(queryExec);
        conn.query(
            // 'Select SA.Subject, U.MobilePhone from   left join ascendumfieldservice.User U on SR.RelatedRecordId= U.Id',
            //'Select id from ascendumfieldservice.user',
            queryExec,
            function (err, result) {
                if (err != null) {
                    console.log("Error query Select account Contact-->" + err);
                } else if (result.rowCount == 0) {
                    console.log("No WhatsApp To be sent");
                    const twiml = new MessagingResponse();
                    twiml.message('It\'s impossible to register a new case. You aren\'t register in our system');
                    res.writeHead(200, {
                        'Content-Type': 'text/xml'
                    });
                    res.end(twiml.toString());
                } else {
                    result.rows.forEach(function (accountContact) {
                        console.log(accountContact.accountid);
                        console.log(accountContact.contactid);
                        conn.query('INSERT INTO ascendumfieldservice.Case (RecordTypeId,AccountId, ContactId, Subject, Origin, Priority, Description, Status, Reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                            ['0123E000000oa6LQAQ', accountContact.accountid, accountContact.contactid, 'Inquiry on Invoice', 'Whatsapp', 'Medium', req.body.Body, 'New', 'Inquiry on Invoice'],
                            function (err, result) {
                                // done();
                                if (err) {
                                    console.log(err);
                                    const twiml = new MessagingResponse();
                                    twiml.message('It\'s impossible to register a new case');
                                    res.writeHead(200, {
                                        'Content-Type': 'text/xml'
                                    });
                                    res.end(twiml.toString());
                                } else {
                                    var queryExec = 'Select CaseNumber'
                                    queryExec = queryExec + ' from  ascendumfieldservice.Case ';
                                    queryExec = queryExec + 'where LastChange=\'Inserted\'';
                                    /*conn.query(
                                        // 'Select SA.Subject, U.MobilePhone from   left join ascendumfieldservice.User U on SR.RelatedRecordId= U.Id',
                                         //'Select id from ascendumfieldservice.user',
                                         queryExec, function(err, result) {
                                            if (err != null ) {
                                                console.log("Error query Select Case-->"+err);
                                            }else if (result.rowCount == 0){
                                             }else {

                                             }

                                    })*/
                                    console.log(JSON.stringify(result));
                                    console.log(JSON.stringify(result.rows[0]));
                                    const twiml = new MessagingResponse();
                                    twiml.message('Case created');
                                    res.writeHead(200, {
                                        'Content-Type': 'text/xml'
                                    });
                                    res.end(twiml.toString());
                                }
                            })
                    });
                }

            });
    });
});
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
app.listen(5432, function(){
    console.log('Express server listening on port ' + app.get('port'));

})