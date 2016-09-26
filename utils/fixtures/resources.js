'use strict';

const uuid = require('node-uuid');
const populateTimestamps = require('../migrations').populateTimestamps;

const resources = [
  {
    // id 1
    // will be deleted because user updated image
    name: 'ecpImage.jpg',
    path: uuid.v1(),
    mimetype: 'image/jpeg',
    extension: 'jpg'
  },
  {
    // id: 2
    // will be deleted because user deleted
    name: 'randomImage.jpg',
    path: uuid.v1(),
    mimetype: 'image/jpeg',
    extension: 'jpg'
  },
  {
    // id: 3
    // will be deleted
    name: 'deleteImage.jpg',
    path: uuid.v1(),
    mimetype: 'image/jpeg',
    extension: 'jpg'
  }
];

module.exports = populateTimestamps(resources);
