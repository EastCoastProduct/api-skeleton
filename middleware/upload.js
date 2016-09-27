'use strict';

const _ = require('lodash');
const config = require('../config');
const Error400 = require('../utils/errors').Error400;
const lang = require('../config/language');
const multer = require('multer');
const Promise = require('bluebird');
const path = require('path');
const services = require('../models/services');
const utils = require('../utils');
const uuid = require('node-uuid');

const storage = multer.memoryStorage();
const limits = {
  fieldSize: config.files.size * 1024 * 1024,
  files: config.files.maxNum
};

// construct the file name for upload
function constructFileName(options, filename) {
  let prefix = '';
  let extension = filename.toLowerCase().split('.');
  extension = extension[extension.length - 1];

  switch (options) {
  case 'image':
    prefix = 'images'; break;
  case 'document':
    prefix = 'documents'; break;
  }

  return [prefix, '/', uuid.v1(), '.', extension].join('');
}

/*
  Filter functionality
*/
const documentFilter = (req, file, callback) => {
  let supportedDocuments = config.supportedDocumentsExtensions;
  let filename = path.extname(file.originalname.toLowerCase());

  if (_.includes(supportedDocuments, filename)) return callback(null, true);
  callback(Error400(lang.unsupportedDocumentExtension));
};

const imageFilter = (req, file, callback) => {
  let supportedImages = config.supportedImageExtensions;
  let filename = path.extname(file.originalname.toLowerCase());

  if (_.includes(supportedImages, filename)) return callback(null, true);
  callback(Error400(lang.unsupportedImageExtension));
};

/*
  Custom handle multer errors
*/
function multerErrorHandler(err, next) {
  if (!err) return next();
  let error;

  switch (err.code) {
  case 'LIMIT_UNEXPECTED_FILE':
    error = Error400(lang.unrecognizedFileField(err.field)); break;

  case 'LIMIT_FILE_COUNT':
    error = Error400(lang.tooManyFiles(config.files.maxNum)); break;

  default:
    error = err;
  }

  next(error);
}

/*
  Upload to s3
*/

const uploadToS3 = options => (req, res, next) => {
  const file = req.file;

  if (!file) return next();
  file._filename = constructFileName(options, file.originalname);

  services.s3.upload(req.file).then(() => next()).catch(err => next(err));
};

function _mapResponseLocals(req, res, next) {
  res.locals = {
    _uploaded: {file: {}, files: []},
    _delete: {file: {}, files: []}
  };
  let _uploaded = res.locals._uploaded;
  const file = req.file;
  const files = req.files;

  if (file) _uploaded.file = {_filename: file.originalname};
  if (!_.isEmpty(files)) {
    _uploaded.files = _.map(files, f => ({_filename: f.originalname}));
  }

  next();
}

/*
  Functionality for multiple uploads
*/

const _uploadMultipleFiles = options => (req, res, next) =>
  multer({
    storage: storage,
    limits: limits,
    fileFilter: options.fileFilter
  })
  .array(
    options.field,
    config.files.maxNum
  )(req, res, err => multerErrorHandler(err, next));

const _uploadMultipleToS3 = options => (req, res, next) => {
  let promises = [];

  _.mapValues(req.files, file => {
    file._filename = constructFileName(options.field, file.originalname);
    promises.push(services.s3.upload(file));
  });
  Promise.all(promises).then(() => next()).catch(err => next(err));
};

function uploadImages(options) {
  options.fileFilter = imageFilter;

  return utils.middleware.chain([
    _uploadMultipleFiles(options),
    _uploadMultipleToS3(options),
    _mapResponseLocals
  ]);
}

function uploadDocuments(options) {
  options.fileFilter = documentFilter;

  return utils.middleware.chain([
    _uploadMultipleFiles(options),
    _uploadMultipleToS3(options),
    _mapResponseLocals
  ]);
}

/*
  Functionality for single upload
*/

const _uploadSingleFile = options => (req, res, next) =>
  multer({
    storage: storage,
    limits: limits,
    fileFilter: options.fileFilter
  })
  .single(options.field)(req, res, err => multerErrorHandler(err, next));

function uploadImage(options) {
  options.fileFilter = imageFilter;

  return utils.middleware.chain([
    _uploadSingleFile(options),
    uploadToS3('image'),
    _mapResponseLocals
  ]);
}

function uploadDocument(options) {
  options.fileFilter = documentFilter;

  return utils.middleware.chain([
    _uploadSingleFile(options),
    uploadToS3('document'),
    _mapResponseLocals
  ]);
}

module.exports = {
  uploadImage: options => uploadImage({field: options}),
  uploadImages: options => uploadImages({field: options}),
  uploadDocument: options => uploadDocument({field: options}),
  uploadDocuments: options => uploadDocuments({field: options})
};
