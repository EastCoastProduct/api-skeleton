'use strict';

const _ = require('lodash');
const services = require('../models/services');
const Promise = require('bluebird');

/* eslint-disable no-console */
function _deleteHangingFiles(err, req, res, next) {
  let l = res.locals;
  let deleteFiles = [];
  let deletePromises = [];

  if (!err) l._uploaded = {};
  if (_.isEmpty(l._uploaded) && _.isEmpty(l._delete)) return next(err);

  // Don't wait for files or give error message
  function _handleRemove() {
    Promise.all(deletePromises).catch(error => console.log(error));
    next(err);
  }

  const _makePromises = file => {
    if (file.id) {
      deletePromises.push(services.resource.remove({id: file.id}));
    } else if (file._filename) {
      deletePromises.push(services.s3.remove(file));
    }
  };

  const _addToDelete = o => {
    if (!_.isArray(o)) return deleteFiles.push(o);
    deleteFiles = deleteFiles.concat(o);
  };

  _.mapValues(l._uploaded, _addToDelete);
  _.mapValues(l._delete, _addToDelete);

  _.map(deleteFiles, _makePromises);
  _handleRemove();
}

const deleteHangingFiles = (req, res, next) =>
  _deleteHangingFiles(null, req, res, next);


const deleteErrorHangingFiles = (err, req, res, next) => {
  _deleteHangingFiles(err, req, res, next);
};

module.exports = {
  deleteHangingFiles: deleteHangingFiles,
  deleteErrorHangingFiles: deleteErrorHangingFiles
};
