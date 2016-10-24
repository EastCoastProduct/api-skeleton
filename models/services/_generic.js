'use strict';

const _ = require('lodash');
const config = require('../../config');
const errors = require('../../utils/errors');
const lang = require('../../config/language');
const Error400 = errors.Error400;
const Error404 = errors.Error404;
const Error500 = errors.Error500;

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

  /*
    All services that use sequelize findAndCountAll() method will not work
    correctly with includes that are done on N:M associations.

    Services with findAndCountAll() sequelize method can be used in combination
    with include optional arguments only if models associations is 1:1 or 1:N.
  */

  const list = function() {
    let queryParams = arguments['0'] || {};
    let optionalArguments = arguments['1'] || {};

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

  /*
    Service for generic list with pagination, filter and search:

    first argument - arguments['0']: req.query object containing:
      req.query.search property for sending search values,
      req.query.page and req.query.limit for paginantion
    second argument - arguments['1']: array of search conditions
      values on which the search will be done on
    third argument - arguments['2']: filter argument as object containing
      multiple filter properties as key value pairs
    fourth argument - arguments['3']:
      optional argument for including (joining) models

      other list services are derived from this one
        and folow same argument logic
  */

  const listWithSearchAndFilter = function() {
    let queryParams = arguments['0'] || {};
    let searchConditionsProperties = arguments['1'] || [];
    let filterParams = arguments['2'] || {};
    let optionalArguments = arguments['3'] || {};

    if (!_.isEmpty(queryParams.search)
      && _.isEmpty(searchConditionsProperties)) {
      return Promise.reject(Error500(
        `Search values sent without search conditions in service for ${keyword}`
      ));
    }

    let paginationLimit = queryParams.limit
      ? parseInt(queryParams.limit)
      : config.paginate.limit;

    let pageNumber = queryParams.page ? parseInt(queryParams.page) : 1;

    let searchValues = queryParams.search
      ? queryParams.search.split(',').map( (value) => ({ $iLike: value }))
      : [];

    let searchConditions = queryParams.search && searchConditionsProperties
      ? searchConditionsProperties.map( (property) => ({
        [property]: { $or: searchValues }}))
      : [];

    let params = {
      where: _({
        $or: searchConditions
      })
      .extend(filterParams)
      .omitBy(_.isEmpty).value(),
      offset: (pageNumber - 1) * paginationLimit,
      limit: paginationLimit,
      order: ['id']
    };

    _.mapKeys(optionalArguments, (val, key) => _.merge(params, { [key]: val }));

    return Model.findAndCountAll(params);
  };

  const listWithSearch = function() {
    let queryParams = arguments['0'] || {};
    let searchConditionsProperties = arguments['1'] || [];
    let optionalArguments = arguments['2'] || {};

    if (!_.isEmpty(queryParams.search)
      && _.isEmpty(searchConditionsProperties)) {
      return Promise.reject(Error500(
        `Search values sent without search conditions in service for ${keyword}`
      ));
    }

    let paginationLimit = queryParams.limit
      ? parseInt(queryParams.limit)
      : config.paginate.limit;

    let pageNumber = queryParams.page ? parseInt(queryParams.page) : 1;

    let searchValues = queryParams.search
      ? queryParams.search.split(',').map( (value) => ({ $iLike: value }))
      : [];

    let searchConditions = queryParams.search && searchConditionsProperties
      ? searchConditionsProperties.map( (property) => ({
        [property]: { $or: searchValues }}))
      : [];

    let params = {
      where: _({
        $or: searchConditions
      }).omitBy(_.isEmpty).value(),
      offset: (pageNumber - 1) * paginationLimit,
      limit: paginationLimit,
      order: ['id']
    };

    _.mapKeys(optionalArguments, (val, key) => _.merge(params, { [key]: val }));

    return Model.findAndCountAll(params);
  };

  const listWithFilter = function() {
    let queryParams = arguments['0'] || {};
    let filterParams = arguments['1'] || {};
    let optionalArguments = arguments['2'] || {};

    let paginationLimit = queryParams.limit
      ? parseInt(queryParams.limit)
      : config.paginate.limit;

    let pageNumber = queryParams.page ? parseInt(queryParams.page) : 1;

    let params = {
      where: _(
        filterParams
      ).omitBy(_.isEmpty).value(),
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
    listWithSearchAndFilter: listWithSearchAndFilter,
    listWithSearch: listWithSearch,
    listWithFilter: listWithFilter,
    remove: remove,
    removeById: removeById,
    getById: getById,
    getOne: getOne,
    update: update
  };
};
