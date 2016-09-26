'use strict';

const Resource = require('../').resource;
const lang = require('../../config/language');
const generic = require('./_generic')(Resource, lang.models.resource);

const create = params => generic.create(params);

const bulkCreate = params => generic.bulkCreate(params);

const remove = params =>
  Resource.destroy({where: params, individualHooks: true});


module.exports = {
  create: create,
  bulkCreate: bulkCreate,
  remove: remove
};
