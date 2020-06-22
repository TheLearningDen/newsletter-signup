// jshint esversion: 8

/* Copyright (c) 2020 The Learning Den */

// variables
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const https = require('https');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// served initial sign up page
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/signup.html');
});

// handles submission of subscriber's information
app.post('/', function (req, res) {
  // input from form
  const firstName = req.body.inputFirstName;
  const lastName = req.body.inputLastName;
  const email = req.body.inputEmail;

  // structure for delivery to Mailchimp
  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  // flat pack data
  const jsonData = JSON.stringify(data);

  // arguments for method to send data off to Mailchimp
  const list = process.env.MC_LIST;
  const url = `https://us10.api.mailchimp.com/3.0/lists/${list}`;
  const key = process.env.MC_KEY;
  const options = {
    method: 'POST',
    auth: `DGIII:${key}-us10`,
  };

  // method to send data off to Mailchimp
  const request = https.request(url, options, function (response) {

    // if connection to Mailchimp is successful, show success page
    // otherwise, load failure page
    if (response.statusCode === 200) {
      res.sendFile(__dirname + '/success.html');
    } else {
      res.sendFile(__dirname + '/failure.html');
    }

    response.on('data', function (data) {
      console.log(JSON.parse(data));
    });
  });

  // send data to Mailchimp
  request.write(jsonData);
  request.end();

});

// handles redirect when 'try again' button is clicked on failure page
app.post('/failure', function (req, res) {
  res.redirect('/');
});

// app works on Heroku or local port
app.listen(process.env.PORT || 3000, function () {
  console.log('Server is running.');
});
