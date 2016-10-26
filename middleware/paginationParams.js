'use strict';

const config = require('../config');

function preparePagination(req, res, next) {
  req.paginate = {};

  let pageNumber = req.query.page ? parseInt(req.query.page) : 1;

  req.paginate.limit = parseInt(req.query.limit) || config.paginate.limit;
  req.paginate.offset = (pageNumber - 1) * req.paginate.limit;

  next();
}

module.exports = preparePagination;
