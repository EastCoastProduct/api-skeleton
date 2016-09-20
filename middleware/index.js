'use strict';

const lang = require('../config/language');

function catch404(req, res, next) {
  var err = new Error(lang.routeNotFound);
  err.status = 404;
  next(err);
}

// add headers to every response
function addHeaders(req, res, next) {
  // add headers to every response to stop cacheing
  res.setHeader('Expires', 'Tue, 03 Jul 2001 06:00:00 GMT');
  res.setHeader('Last-Modified', '{now} GMT');
  var cacheControl = 'max-age=0, no-cache, must-revalidate, proxy-revalidate';
  res.setHeader('Cache-Control', cacheControl);
  next();
}

module.exports = {
  catch404: catch404,
  addHeaders: addHeaders
};
