'use strict';

const Resource = require('../').resource;
const lang = require('../../config/language');
const generic = require('./_generic')(Resource, lang.models.resource);

const createOne = params => generic.create(params);

const remove = params =>
  Resource.destroy({where: params, individualHooks: true});


module.exports = {
  createOne: createOne,
  remove: remove
};
