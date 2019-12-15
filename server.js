const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

require('./api/models/todoListModel');
require('./api/models/userModel'); //created model loading here

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
