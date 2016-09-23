'use strict';

const _ = require('lodash');
const services = require('../../models/services');
const lang = require('../../config/language');
const Error400 = require('../../utils/errors').Error400;

const mapSingle = isRequired => (req, res, next) => {
  const file = req.file;

  if (!file) {
    let error = isRequired ? Error400(lang.fileNotProvided) : null;
    return next(error);
  }

  services.resource.createOne({
    extension: file._filename.split('.')[1],
    mimetype: file.mimetype,
    name: file.originalname,
    path: file._filename
  })
  .then(resource => {
    let obj = { _uploaded: {file: {id: resource.id, _filename: resource.path}}};
    _.merge(res.locals, obj);
    next();
  })
  .catch(err => next(err));
};

// TODO figure out how to do this properly
// const mapMultiple = isRequired => (req, res, next) => {
//   res.locals = 'not ready yet';
//   next();
// };

module.exports = {
  mapSingle: (isRequired = false) => mapSingle(isRequired)
  // mapMultiple: (isRequired = false) => mapMultiple(isRequired)
};
