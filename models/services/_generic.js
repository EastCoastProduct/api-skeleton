'use strict';

const _ = require('lodash');
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

  const list = function(
    paginate = {},
    optionalArguments = {}
  ) {

    let params = {
      offset: paginate.offset,
      limit: paginate.limit,
      order: ['id']
    };

    _.merge(params, optionalArguments);

    return Model.unscoped().findAndCountAll(params);
  };

  /*
    Service for generic list with pagination, filter and search:

    first argument - req = { query: {}, paginate: {} }:
      req.query object containing:
        req.query.search property for sending search values,
      req.paginate object containing:
        req.paginate.limit to limit paginantion
        req.paginate.offset to define offset of paginantion
    second argument - searchConditionsProperties = []:
      array of search conditions values on which the search will be done upon
    third argument - filterParams = {} : filter argument as object containing
      multiple filter properties as key value pairs
        example: { confirmed: req.query.confirmed }
    fourth argument - optionalArguments = {}:
      optional argument for including (joining) models
        example: { include: { model: Resource, required: false }}


      other list services are derived from this one
        and folow same argument logic
  */

  const listWithSearchAndFilter = function(
    req = { query: {}, paginate: {} },
    searchConditionsProperties = [],
    filterParams = {},
    optionalArguments = {}
  ) {

    if (!req.query) req.query = {};

    if (!_.isEmpty(req.query.search)
      && _.isEmpty(searchConditionsProperties)) {
      return Promise.reject(Error500(
        lang.errors.searchParametersError(keyword)
      ));
    }

    let searchValues = req.query.search
      ? req.query.search.split(',').map( (value) => ({ $iLike: value }))
      : [];

    let searchConditions = req.query.search
      ? searchConditionsProperties.map( (property) => ({
        [property]: { $or: searchValues }}))
      : [];

    let params = {
      where: _({
        $or: searchConditions
      })
      .extend(filterParams)
      .omitBy(_.isEmpty).value(),
      offset: req.paginate.offset,
      limit: req.paginate.limit,
      order: ['id']
    };

    _.merge(params, optionalArguments);

    return Model.findAndCountAll(params);
  };

  const listWithSearch = function(
    req = { query: {}, paginate: {} },
    searchConditionsProperties = [],
    optionalArguments = {}
  ) {

    if (!req.query) req.query = {};

    if (!_.isEmpty(req.query.search)
      && _.isEmpty(searchConditionsProperties)) {
      return Promise.reject(Error500(
        lang.errors.searchParametersError(keyword)
      ));
    }

    let searchValues = req.query.search
      ? req.query.search.split(',').map( (value) => ({ $iLike: value }))
      : [];

    let searchConditions = req.query.search
      ? searchConditionsProperties.map( (property) => ({
        [property]: { $or: searchValues }}))
      : [];

    let params = {
      where: _({
        $or: searchConditions
      }).omitBy(_.isEmpty).value(),
      offset: req.paginate.offset,
      limit: req.paginate.limit,
      order: ['id']
    };

    _.merge(params, optionalArguments);

    return Model.findAndCountAll(params);
  };

  const listWithFilter = function(
    req = { paginate: {} },
    filterParams = {},
    optionalArguments = {}
  ) {

    let params = {
      where: _(
        filterParams
      ).omitBy(_.isEmpty).value(),
      offset: req.paginate.offset,
      limit: req.paginate.limit,
      order: ['id']
    };

    _.merge(params, optionalArguments);

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
