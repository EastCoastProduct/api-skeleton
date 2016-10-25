'use strict';

const uuid = require('node-uuid');
const populatePresets = require('../migrations').populatePresets;

const preset = () => ({
  path: `images/${uuid.v1()}.jpg`,
  mimetype: 'image/jpeg',
  extension: 'jpg'
});

const resources = [{
  // id 1
  // will be deleted because user updated image
  name: 'ecpImage.jpg'
}, {
  // id: 2
  // will be deleted because user deleted
  name: 'randomImage.jpg'
}, {
  // id: 3
  // will be deleted
  name: 'deleteImage.jpg'
}, {
  // id: 4
  // will be deleted in response middleware
  name: 'deleteImage2.jpg'
}, {
  // id: 5
  // will be deleted in response middleware
  name: 'deleteImage3.jpg'
}, {
  // id: 6
  // will be deleted in response middleware
  name: 'deleteImage4.jpg'
}, {
  // id: 7
  // will be deleted with the user
  name: 'userImage.jpg'
}, {
  // id: 8
  // this resource is used for login to show image
  name: 'userLoginImage.jpg'
}];

module.exports = populatePresets(resources, preset);
