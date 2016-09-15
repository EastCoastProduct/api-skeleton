'use strict';

const _ = require('lodash');
const validator = require('validator');
const errors = require('../utils/errors');

/**
utility for validating filters in the requests
you need to provide filters and set of rules for validation
rules are represented as an object of individual rules
each rule is an object that needs to have one of allowed types
it can also have one of supported optinal properties
e.g.
{
  startDate: {
    type: 'timestamp'
  },
  thanked: {
    type: 'boolean'
  },
  shareType: {
    type: ['twitter', 'email']
  },
  name: {
    type: 'norule',
    // optional
    length: 300
  }
}
optionally you can provide a list of required parameters, as array of keys
['name', 'shareType']
allows the use of a key: typeValue shorthand, e.g.
name: { type: 'norule' } <=> name: 'norule'
rules have to be whitelisted, so if you don't need checks for a filter
param set 'norule' rule that will white list parameter
if there is any parameter that is not whitelisted it will raise an error
for unexpected parameter
supported rules:
    timestamp - only numbers
    numeric - only (nonnegative) numbers allowed
    positive - only positive numbers allowed
    price - only nonnegative numbers with up to two decimal places allowed
    boolean - only boolean values allowed
    stringBoolean - only string boolean allowed 'true', 'false'
    email - only valid email allowed
    array of supported values - for example ['twitter', 'email']
    uuid - only valid uuid allowed
    alphanumericspace - only allow alphanumeric and space
    password - at least one uppercase, number and special character
    norule - no rule at all, just to whitelist parameter
supported optional properties:
    - length - can have max and/or min to set length boundaries
    - nullable - 'null' is supported alongside the designated type
*/
function validate(reqData, rules, required, callback) {

  // required is optional parameter
  if (typeof (required) === 'function') {
    callback = required;
    required = null;
  }
  // array to keep all error messages in
  var msgs = [];
  // global error indicator
  var error;
  // clone received data to work with it
  var data = _.clone(reqData);
  // extract metarules
  var individualKeys = rules._individual;

  // auxiliary validators
  const isAlphanumericspace = (/^[0-9A-Z\s]+$/i);
  const isPrice = (/^(0|[1-9][0-9]*)(\.[0-9]{1,2})*$/);
  const onlyNumbers = (/^[0-9]+$/);
  const containsUppercase = (/[A-Z]/);
  const containsLowecase = (/[a-z]/);
  const specialCharacters = (/[@#$%!?]/);
  const containsNumeric = (/[0-9]/);

  const makeMessage = (key, message) => ({
    path: key,
    message: message
  });

  const addMessage = (key, message) => {
    error = true;
    msgs.push(makeMessage(key, message));
  };

  if (!_.isEmpty(individualKeys)) {
    rules = _.omit(rules, '_individual');
    let individuals = _.chain(reqData).pick(individualKeys).keys().value();
    if (individuals.length > 0 && Object.keys(reqData).length > 1) {
      error = true;
      individuals.forEach( (key) => addMessage(key, 'needs to be alone') );
    }
  }

  function processStringTypes(key, value) {
    switch (rules[key].type) {
    case 'timestamp':
    case 'numeric':
      // timestamp and numeric can only have digits
      if (!onlyNumbers.test(value)) {
        addMessage(key, 'has to be ' + rules[key].type);
      }
      break;

    case 'positive':
      if (!onlyNumbers.test(value) || value <= 0) {
        addMessage(key, 'has to be ' + rules[key].type);
      }
      break;

    case 'price':
      if (!isPrice.test(value)) {
        addMessage(key, 'has to be nonnegative with up to two decimal places');
      }
      break;

    case 'boolean':
      // query parser will transform string to boolean
      if (typeof (value) !== 'boolean') {
        addMessage(key, 'can only be \'true\' or \'false\'');
      }
      break;

    case 'stringBoolean':
      if (value !== 'true' && value !== 'false') {
        addMessage(key, 'can only be string \'true\' or \'false\'');
      }
      break;

    case 'email':
      if (!validator.isEmail(value)) {
        addMessage(key, 'has to be valid email');
      }
      break;

    case 'json':
      if (!validator.isJSON(value)) {
        addMessage(key, 'has to be valid json');
      }
      break;

    case 'date':
      if (!validator.isISO8601(value)) {
        addMessage(key, 'has to be ISO8601 date');
      }
      break;

    case 'hex-color':
      if (!validator.isHexColor(value)) {
        addMessage(key, 'has to be valid HEX color');
      }
      break;

    case 'uuid':
      if (!validator.isUUID(value)) {
        addMessage(key, 'has to be a valid uuid');
      }
      break;

    case 'alphanumericspace':
      if (!isAlphanumericspace.test(value)) {
        addMessage(key, 'has to be alphanumeric');
      }
      break;

    case 'comma_separated_numerics':
      // this is covering both array and comma separated string
      if (!_(value).split(',').every(validator.isNumeric)) {
        addMessage(key, 'has to be comma separated numerics');
      }
      break;

    case 'array-strings':

      if (!_.isArray(value)) {
        addMessage(key, 'has to be array of strings');
      }
      break;

    case 'array-hex-colors':

      if ( !_.isArray(value) || !_.every(value, validator.isHexColor)) {
        addMessage(key, 'has to be array of HEX values only');
      }
      break;

    case 'array-hex-colors-or-empty-strings':

      if (!_.isArray(value)
        || !_(value).without('').every(validator.isHexColor)) {
        addMessage(key, 'has to be array of HEX values and empty strings only');
      }
      break;

    case 'password':
      if (value.length < 8) {
        addMessage(key, 'has to be at least 8 characters long');
      }
      if (!containsUppercase.test(value)) {
        addMessage(key, 'has to contain at least one uppercase letter');
      }
      if (!containsLowecase.test(value)) {
        addMessage(key, 'has to contain at least one lowercase letter');
      }
      if (!specialCharacters.test(value)) {
        addMessage(key, 'has to contain at least one special character');
      }
      if (!containsNumeric.test(value)) {
        addMessage(key, 'has to contain at least one number');
      }
      break;
    case 'mac':
      if (!validator.isMACAddress(value)) {
        addMessage(key, 'has to be a valid MAC address');
      }
      break;
    case 'norule':
      // check additional options for
      break;
    default:
      addMessage(rules[key].type, 'unrecognized rule');
    }
  }

  function processObjectTypes(key, value) {
    if (rules[key].type.indexOf(value) === -1) {
      addMessage(key, `can only have values: ${rules[key].type.toString()}`);
    }
  }

  // removes element from required list
  function removeRequired(toRemove) {
    if (required && required.indexOf(toRemove) !== -1) {
      var index = required.indexOf(toRemove);
      required.splice(index, 1);
    }
  }

  // checks type for every given parameter
  function checkType(key, value) {
    if (rules[key].nullable === true && value === 'null') {
      reqData[key] = null;
    } else if (rules[key].allowEmpty === true && !value && value !== 0) {
      reqData[key] = null;
    } else if (typeof (rules[key].type) === 'string') {
      processStringTypes(key, value);
    } else if (typeof (rules[key].type) === 'object') {
      processObjectTypes(key, value);
    }
    // its processed, remove it from required list
    removeRequired(key);
  }

  // checks length that can be optionally set exactly or have max and min
  function checkLength(key, value) {
    if (rules[key].allowEmpty === true && !value && value !== 0) return;

    var length = rules[key].length;

    if (_.isNumber(length) && length !== value.length) {
      addMessage(key, `has to be exactly ${length} length`);
      return;
    }

    if (length.max && value.length > length.max) {
      addMessage(key, `has to be less than ${length.max} length`);
    }

    if (length.min && value.length < length.min) {
      addMessage(key, `has to be at least ${length.min} length`);
    }
  }

  // main loop that goes through all received parameters
  // and validates each one
  _.forEach(data, (value, key) => {
    // allow key: typeValue shorthand
    if (_.isString(rules[key]) || _.isArray(rules[key])) {
      rules[key] = { type: rules[key] };
    }

    // check if parameter is listed in rules at all
    if (!rules[key]) {
      addMessage(key, 'unrecognized parameter');
      return;
    }

    if (!value && value !== 0 && rules[key].allowEmpty !== true) {
      addMessage(key, 'value not provided');
      return;
    }

    // every rule needs to have type set
    if (!rules[key].type) {
      addMessage(key, 'has to have type set');
      // also remove it from required list to not be listed in it
      removeRequired(key);
      return;
    }

    // check mandatory type and if values are valid by type
    checkType(key, value);

    // check optional rule of length
    if (rules[key].length) {
      checkLength(key, value);
    }

    if (rules[key].max) {
      const max = rules[key].max;
      if (parseInt(value) > max) addMessage(key, `has to be less than ${max}`);
    }

    if (rules[key].min) {
      const min = rules[key].min;
      if (parseInt(value) < min) addMessage(key, `has to be at least ${min}`);
    }

  });

  // check if all requied parameters arrived
  if (required && required.length) {
    _.forEach(required, (value) => addMessage(value, 'required') );
  }

  // call callback with error and messges got from checking
  process.nextTick( () => {
    callback(error, msgs);
  });
}

function validation(field, settings, allowEmpty) {
  return (req, res, next) => {
    if (!allowEmpty && _.isEmpty(req[field])) {
      return next(errors.ParametersError([{
        path: `request.${field}`,
        message: `The request ${field} field must not be empty`
      }]));
    }

    // clone the required data so it can be mutated in the validator
    const rules = settings.rules;
    const required = _.clone(settings.required, true);
    const conditions = settings.conditions;

    validate(req[field], rules, required, (err, msgs) => {

      _.forEach(conditions, (condition) => {
        if (condition.errorCheck(req.body)) {
          msgs.push({
            path: 'conditions',
            message: condition.errorMessage
          });
          err = true;
        }
      });

      if (err) return next(errors.ParametersError(msgs));
      next();
    });
  };
}

module.exports = {
  validate: validate,
  validation: validation
};
