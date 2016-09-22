'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const config = require('../config');
const Error400 = require('../utils/errors').Error400;
const lang = require('../config/language');
const multer = require('multer');
const path = require('path');
const utils = require('../utils');
const uuid = require('node-uuid');

AWS.config.update(config.aws);
const storage = multer.memoryStorage();
const limits = {
  fieldSize: config.files.size * 1024 * 1024,
  files: config.files.maxNum
};

// construct the file name for upload
function constructFileName(options, filename) {
  let prefix = '';
  let extension = filename.toLowerCase().split('.')[1];

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
const documentFilter = (req, file, cb) => {
  let supportedDocuments = config.supportedDocumentsExtensions;
  let filename = path.extname(file.originalname.toLowerCase());

  if (_.includes(supportedDocuments, filename)) return cb(null, true);
  cb(Error400(lang.unsupportedDocumentExtension));
};

const imageFilter = (req, file, cb) => {
  let supportedImages = config.supportedImageExtensions;
  let filename = path.extname(file.originalname.toLowerCase());

  if (_.includes(supportedImages, filename)) return cb(null, true);
  cb(Error400(lang.unsupportedImageExtension));
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
  Generic S3 upload
*/

function __upload(s3, file) {
  const params = {
    Bucket: config.s3Url.bucketName,
    Key: file._filename,
    ContentType: file.contentType,
    Body: file.buffer
  };

  return s3.putObject(params).promise();
}

const uploadToS3 = options => (req, res, next) => {
  const s3 = new AWS.S3();
  const file = req.file;

  if (!file) return next();
  req.body.file = constructFileName(options, file.originalname);
  file._filename = req.body.file;

  __upload(s3, req.file).then(() => next()).catch(err => next(err));
};

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
  const s3 = new AWS.S3();
  let promises = [];
  req.body.files = [];

  _.mapValues(req.files, file => {
    file._filename = constructFileName(options.field, file.originalname);
    req.body.files.push(file._filename);
    promises.push(__upload(s3, file));
  });
  Promise.all(promises).then(() => next()).catch(err => next(err));
};

function uploadImages(options) {
  options.fileFilter = imageFilter;

  return utils.middleware.chain([
    _uploadMultipleFiles(options),
    _uploadMultipleToS3(options)
  ]);
}

function uploadDocuments(options) {
  options.fileFilter = documentFilter;

  return utils.middleware.chain([
    _uploadMultipleFiles(options),
    _uploadMultipleToS3(options)
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
    uploadToS3('image')
  ]);
}

function uploadDocument(options) {
  options.fileFilter = documentFilter;

  return utils.middleware.chain([
    _uploadSingleFile(options),
    uploadToS3('document')
  ]);
}

module.exports = {
  uploadImage: options => uploadImage({field: options}),
  uploadImages: options => uploadImages({field: options}),
  uploadDocument: options => uploadDocument({field: options}),
  uploadDocuments: options => uploadDocuments({field: options})
};
