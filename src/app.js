const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
const config = require('./config/init');

require('./api/models/todoListModel');
require('./api/models/userModel'); //created model loading here

config.initializeDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(config.cors);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(' ')[1],
      process.env.SECRET_KEY,
      function(err, decode) {
        if (err) {
          console.log(err);
          req.user = undefined;
          return res
            .status(401)
            .json({ error: true, message: 'Unauthorized access.' });
        }
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

var routes = require('./api/routes'); //importing route
routes(app); //register the route

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

module.exports = app;
