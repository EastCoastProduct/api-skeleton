'use strict';

const app = require('express')();
const responseMiddleware = require('./utils').responseMiddleware;
const bodyParser = require('body-parser');
const config = require('./config');
const errorHandler = require('./middleware/error');
const logger = require('morgan');
const middleware = require('./middleware');
const routes = require('./routes');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false, limit: `${config.files.size}mb`
}));

app.use(middleware.addHeaders);
app.use('/', routes);

app.use(responseMiddleware);
app.use(middleware.catch404);
app.use(errorHandler({env: config.env}));

module.exports = app;
