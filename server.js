var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
var apiai = require('apiai');
//var twilio = require('twilio');
var apiapp = apiai("d2aa27c7939543549982acb558ef8796");


/*var accountSid = 'AC67968749065aa4c24a598fb476e3ee1e'; // Your Account SID from www.twilio.com/console
var authToken = 'b1993d51e0dfeff9bf683e82b870f5e8';   // Your Auth Token from www.twilio.com/console


var client = new twilio(accountSid, authToken);

client.messages.create({
    body: 'Hello from Node',
    to: '+34626561876',  // Text this number
    from: '+34960160635' // From a valid Twilio number
})
.then((message) => console.log(message.sid));*/

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function (req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function (err, result) {
                if (err != null || result.rowCount == 0) {
                    conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                        [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                        function (err, result) {
                            done();
                            if (err) {
                                res.status(400).json({
                                    error: err.message
                                });
                            } else {
                                // this will still cause jquery to display 'Record updated!'
                                // eventhough it was inserted
                                res.json(result);
                            }
                        });
                } else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});
app.post("/chatbotJoin", function (req, res) {

    console.log("My request-->" + req.body.firstName);
    var request = apiapp.textRequest(req.body.firstName, {
        sessionId: '123123'
    });
    console.log('Request send-->' + request);
    request.on('response', function (response) {
        console.log(response);
        res.send(response);
    });
    request.on('error', function (error) {
        console.log(error);
        res.send(error);
    });
    request.end();

});
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});