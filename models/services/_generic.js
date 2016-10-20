'use strict';

const _ = require('lodash');
const config = require('../../config');
const errors = require('../../utils/errors');
const lang = require('../../config/language');
const Error400 = errors.Error400;
const Error404 = errors.Error404;

module.exports = (Model, keyword) => {

  const bulkCreate = params => Model.bulkCreate(params, { returning: true });

  const create = params => Model.create(params);

  const _exists = (params, shouldNotExist) =>
    Model.count(params)
    .then(result => {
      if (result && shouldNotExist) {
        throw Error400(lang.errors.alreadyExists(keyword));
      }

      if (!result && !shouldNotExist) {
        throw Error400(lang.errors.doesNotExist(keyword));
      }

      return result;
    });

  const doesNotExist = params => _exists(params, true);

  const exists = params => _exists(params);

  // TODO merge with listWithPagination (similar to exist and not exists)
  const list = function() {
    let params = {
      order: ['id']
    };

    _.mapKeys(arguments, val => _.merge(params, val));

    return Model.findAndCountAll(params);
  };

  const remove = params =>
    Model.destroy({ where: params, individualHooks: true })
    .then( result => {
      if (!result) throw Error404(lang.errors.notFound(keyword));

      return result;
    });

  const removeById = id =>
    Model.destroy({ where: { id: id }, individualHooks: true })
    .then( result => {
      if (!result) throw Error404(lang.errors.notFound(keyword));

      return result;
    });

  const getById = (id, options) =>
    Model.findById(id, options)
    .then( result => {
      if (!result) throw Error404(lang.errors.notFound(keyword));

      return result;
    });

  const getOne = params =>
    Model.findOne({ where: params })
    .then( result => {
      if (!result) throw Error404(lang.errors.notFound(keyword));

      return result;
    });

  const update = (body, params) =>
    Model.update(body, {
      where: params,
      returning: true,
      individualHooks: true
    })
    .then( result => {
      if (!result[0]) throw Error404(lang.errors.notFound(keyword));

      return result[1][0];
    });

  const listWithPagination = function() {
    let queryParams = arguments['0'];
    let optionalArguments = arguments['1'];

    let paginationLimit = queryParams.limit
      ? parseInt(queryParams.limit)
      : config.paginate.limit;
    let pageNumber = queryParams.page ? parseInt(queryParams.page) : 1;

    let params = {
      offset: (pageNumber - 1) * paginationLimit,
      limit: paginationLimit,
      order: ['id']
    };

    _.mapKeys(optionalArguments, (val, key) => _.merge(params, { [key]: val }));

    return Model.findAndCountAll(params);
  };

  return {
    bulkCreate: bulkCreate,
    create: create,
    doesNotExist: doesNotExist,
    exists: exists,
    list: list,
    listWithPagination: listWithPagination,
    remove: remove,
    removeById: removeById,
    getById: getById,
    getOne: getOne,
    update: update
  };
};
