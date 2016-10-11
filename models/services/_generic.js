'use strict';

const _ = require('lodash');
const config = require('../../config');
const errors = require('../../utils/errors');
const lang = require('../../config/language');
const Error400 = errors.Error400;
const Error404 = errors.Error404;

module.exports = (Model, keyword) => {

  const bulkCreate = params => Model.bulkCreate(params, {returning: true})
    .then(r => r);

  const create = params => Model.create(params).then(r => r);

  const _exists = (params, shouldNotExist) =>
    Model.count(params).then(r => {

      if (r && shouldNotExist) throw Error400(lang.alreadyExists(keyword));
      if (!r && !shouldNotExist) throw Error400(lang.doesNotExist(keyword));

      return r;
    });

  const doesNotExist = params => _exists(params, true);

  const exists = params => _exists(params);

  // TODO merge with listWithPagination (similar to exist and not exists)
  const list = function() {
    let params = {
      order: ['id']
    };

    _.mapKeys(arguments, val => _.merge(params, val));

    return Model.findAndCountAll(params).then(response => response);
  };

  const remove = params =>
    Model.destroy({where: params, individualHooks: true})
      .then(response => {
        if (!response) throw Error404(lang.notFound(keyword));
        return response;
      });

  const removeById = id =>
    Model.destroy({where: {id: id}, individualHooks: true}).then(r => {
      if (!r) throw Error404(lang.notFound(keyword));
      return r;
    });

  const getById = (id, options) =>
    Model.findById(id, options).then(r => {
      if (!r) throw Error404(lang.notFound(keyword));
      return r;
    });

  const getOne = params =>
    Model.findOne({where: params})
      .then(response => {
        if (!response) throw Error404(lang.notFound(keyword));
        return response;
      });

  const update = (body, params) =>
    Model.update(body, {where: params, returning: true, individualHooks: true})
      .then(result => {
        if (!result[0]) throw Error404(lang.notFound(keyword));

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

    _.mapKeys(optionalArguments, val => _.merge(params, val));

    return Model.findAndCountAll(params).then(response => response);
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

/*
  {
    where: {},
    order: {}
  }
*/
