'use strict';

const AWS = require('aws-sdk');
const config = require('../../config');
AWS.config.update(config.aws);

function upload(file) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: config.s3Url.bucketName,
    Key: file._filename,
    ContentType: file.contentType,
    Body: file.buffer
  };

  return s3.putObject(params).promise();
}

function remove(file) {
  const s3 = new AWS.S3();
  const params = {
    Bucket: config.s3Url.bucketName,
    Key: file._filename
  };

  return s3.deleteObject(params).promise();
}

module.exports = {
  upload: upload,
  remove: remove
};
