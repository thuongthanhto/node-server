const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('./api/models/todoListModel'); //created model loading here

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes'); //importing route
routes(app); //register the route

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
