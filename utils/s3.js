'use strict';

const _ = require('lodash');
const config = require('../config');
const s3Prefix = config.s3Url.prefix + config.s3Url.bucketName;

// model.resource - null
// model.resource - object
// model.resource - array

function prependS3(model, name, keepResources = false) {

  function _mapOneImage(img) {
    let obj = model.toJSON();

    if (!keepResources) obj.resource = undefined;
    if (img) obj[name] = s3Prefix + model.resource.path;
    return obj;
  }

  if (!_.isArray(model.resource)) return _mapOneImage(model.resource);

  return _.map(model.resource, _mapOneImage);
}

module.exports = {
  prependS3: prependS3
};
