'use strict';

const _ = require('lodash');
const services = require('../../models/services');
const lang = require('../../config/language');
const Error400 = require('../../utils/errors').Error400;

// map files for db
function _mapFiles(files) {

  const _mapFile = file => ({
    extension: file._filename.split('.')[1],
    mimetype: file.mimetype,
    name: file.originalname,
    path: file._filename
  });

  if (!_.isArray(files)) return _mapFile(files);

  return _.map(files, file => _mapFile(file));
}

function _mapResponse(files) {
  let filesObj = {_uploaded: {files: []}};

  _.forEach(files, file =>
    filesObj._uploaded.files.push({id: file.id, _filename: file.path})
  );
  return filesObj;
}

const mapSingle = isRequired => (req, res, next) => {
  const file = req.file;

  if (!file) {
    let error = isRequired ? Error400(lang.fileNotProvided) : null;
    return next(error);
  }

  services.resource.create(_mapFiles(file))
  .then(resource => {
    res.locals._uploaded.file.id = resource.id;
    req.body.resourceId = resource.id;
    next();
  })
  .catch(err => next(err));
};

const mapMultiple = isRequired => (req, res, next) => {
  const files = req.files;

  if (_.isEmpty(files)) {
    let error = isRequired ? Error400(lang.filesNotProvided) : null;
    return next(error);
  }

  services.resource.bulkCreate(_mapFiles(files)).then(resource => {
    _.merge(res.locals, _mapResponse(resource));
    next();
  })
  .catch(err => next(err));

};

module.exports = {
  mapSingle: (isRequired = false) => mapSingle(isRequired),
  mapMultiple: (isRequired = false) => mapMultiple(isRequired)
};
