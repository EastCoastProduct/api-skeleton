'use strict';

const _ = require('lodash');
const async = require('async');
const should = require('should');

const validator = require('./validator');

describe('validator', () => {
  var rules = {
    startDate: { type: 'timestamp' },
    numeric: { type: 'numeric', max: 100, min: 5},
    positive: { type: 'positive' },
    price: { type: 'price' },
    thanked: { type: 'boolean' },
    stringB: { type: 'stringBoolean' },
    email: { type: 'email' },
    shareType: { type: ['twitter', 'email'] },
    uuid: { type: 'uuid' },
    alphanumericspace: { type: 'alphanumericspace' },
    something: { type: 'norule', length: { min: 4, max: 10 } },
    somethingElse: { type: 'norule', length: 9 },
    color: { type: 'hex-color' },
    password: { type: 'password'},
    commaSeparatedNumerics: { type: 'comma_separated_numerics' },
    arrayOfStrings: { type: 'array-strings' },
    arrayOfHexColors : { type: 'array-hex-colors' },
    arrayOfHexColorsOrEmptyStrings : { type: 'array-hex-colors-or-empty-strings' }
  };

  var filters = {
    startDate: '1408060800',
    numeric: '6',
    positive: 2,
    price: 22.22,
    thanked: true,
    stringB: 'true',
    email: 'ivan@mail.com',
    shareType: 'twitter',
    uuid: 'a1783c40-4506-11e5-8de5-0002a5d5c51b',
    alphanumericspace: 'a1 b2',
    something: 'whatever',
    somethingElse: 'whichever',
    color: '#00ff00',
    password: 'NewPassword1$',
    commaSeparatedNumerics: '1,2,3',
    arrayOfStrings: ['test', 'test2', 'test3'],
    arrayOfHexColors: ['#00ff00', '#ffff00', '#00ffff'],
    arrayOfHexColorsOrEmptyStrings: ['#00ff00', '', '#00ffff']
  };

  var required = ['thanked'];

  // var individual = ['status'];

  var shorthandRules = _.transform(rules, (result, value, key) => {
    result[key] = value.type;
  });

  var settings = { rules: rules, required: required };

  describe('validate', () => {
    it('succesfull validation', done => {
      validator.validate(filters, rules, (err) => {
        should(err).not.be.ok;
        done();
      });
    });

    it('validation should work in shorthand form', done => {
      validator.validate(filters, shorthandRules, (err) => {
        should(err).not.be.ok;
        done();
      });
    });

    it('fails validation missing required', done => {
      validator.validate({}, rules, required, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'thanked',
            message: 'required'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('succesfull validation with required', done => {
      validator.validate(filters, rules, required, (err) => {
        should(err).not.be.ok;
        done();
      });
    });

    it('succesfull validation with required and numeric zero', done => {
      validator.validate({numeric: 7}, rules, ['numeric'], (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    // specific test because either mocha or should lead to unexpected behaviour
    // where sometimes cloning a 'null' string will cast it to a null object
    it('should successfully validate \'null\' when nullable is set to true', done => {
      var nullableRules = { nullable: { type: 'numeric', nullable: true } };
      validator.validate({ nullable: 'null' }, nullableRules, (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    it('should successfully validate empty string when allowEmpty is set to true', done => {
      var allowEmptyRules = { allowEmpty: { type: 'norule', allowEmpty: true } };
      validator.validate({ allowEmpty: '' }, allowEmptyRules, (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    it('should successfully validate null when allowEmpty is set to true', done => {
      var allowEmptyRules = { allowEmpty: { type: 'norule', allowEmpty: true } };
      validator.validate({ allowEmpty: null }, allowEmptyRules, (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    it('should successfully validate \' \' when allowEmpty is set to true', done => {
      var allowEmptyRules = { allowEmpty: { type: 'norule', allowEmpty: true } };
      validator.validate({ allowEmpty: ' ' }, allowEmptyRules, (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    it('should successfully validate individual param', done => {
      var toValidate = { 'status': 'some status' };
      var individualRules = {
        status: { type: 'norule' },
        _individual: ['status']
      };
      validator.validate(toValidate, individualRules, (err, msgs) => {
        should.not.exist(err);
        done();
      });
    });

    it('failed for multiple reasons', done => {
      var temp = _.clone(filters);
      temp.startDate = '1408060800s';
      temp.positive = -1;
      temp.price = 0.222;
      temp.thanked = 2;
      temp.stringB = 'nesto';
      temp.uuid = 'asdfa';
      temp.alphanumericspace = '{}';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'startDate',
            message: 'has to be timestamp'
          },
          {
            path: 'positive',
            message: 'has to be positive'
          },
          {
            path: 'price',
            message: 'has to be nonnegative with up to two decimal places'
          },
          {
            path: 'thanked',
            message: 'can only be \'true\' or \'false\''
          },
          {
            path: 'stringB',
            message: 'can only be string \'true\' or \'false\''
          },
          {
            path: 'uuid',
            message: 'has to be a valid uuid'
          },
          {
            path: 'alphanumericspace',
            message: 'has to be alphanumeric'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('unrecognized parameter', done => {
      var temp = _.clone(filters);
      temp.unrecognized = 'something';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'unrecognized',
            message: 'unrecognized parameter'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('unrecognized rule', done => {
      var temp = _.clone(rules);
      temp.stringB = {type: 'something'};
      validator.validate(filters, temp, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'something',
            message: 'unrecognized rule'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('should fail because the parameter needs to be alone', done => {
      var toValidate = { name: 'something', 'status': 'some status' };
      var individualRules = {
        name: { type: 'norule' },
        status: { type: 'norule' },
        _individual: ['status']
      };
      validator.validate(toValidate, individualRules, (err, msgs) => {
        msgs.should.eql([{
          path: 'status',
          message: 'needs to be alone'
        }]);
        done();
      });
    });

    it('not exact length', done => {
      var temp = _.clone(filters);
      temp.somethingElse = 'wasdfasdfadsfadsf';
      validator.validate(temp, rules, (err, msgs) => {
        var expected = [
          {
            path: 'somethingElse',
            message: 'has to be exactly 9 length'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('more than maximum length', done => {
      var temp = _.clone(filters);
      temp.something = 'wasdfasdfadsfadsf';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'something',
            message: 'has to be less than 10 length'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('less than minimum length', done => {
      var temp = _.clone(filters);
      temp.something = 'wa';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'something',
            message: 'has to be at least 4 length'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('no type for rule', done => {
      var temp = _.clone(rules);
      temp.stringB = {};
      validator.validate(filters, temp, (err, msgs) => {
        should(err).ok;
        var expected = [{
          path: 'stringB',
          message: 'has to have type set'
        }];
        msgs.should.eql(expected);
        done();
      });
    });

    it('no value for parameter', done => {
      var temp = _.clone(filters);
      temp.something = null;
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'something',
            message: 'value not provided'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid comma separated numbers', done => {
      var temp = _.clone(filters);
      temp.commaSeparatedNumerics = 'a,ab,abc';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [{
          path: 'commaSeparatedNumerics',
          message: 'has to be comma separated numerics'
        }];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid comma separated numbers', done => {
      var temp = _.clone(filters);
      temp.commaSeparatedNumerics = '1;2;3';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'commaSeparatedNumerics',
            message: 'has to be comma separated numerics'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid array of strings', done => {
      var temp = _.clone(filters);
      temp.arrayOfStrings = 'test,test1,test2';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'arrayOfStrings',
            message: 'has to be array of strings'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid array of HEX colors', done => {
      var temp = _.clone(filters);
      temp.arrayOfHexColors = '#00ff00,#00ffff,#00ff';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'arrayOfHexColors',
            message: 'has to be array of HEX values only'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid array of HEX colors', done => {
      var temp = _.clone(filters);
      temp.arrayOfHexColors = ['#00ff00', '#00ffff', '#00ff00ff'];
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'arrayOfHexColors',
            message: 'has to be array of HEX values only'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid array of HEX colors or empty strings', done => {
      var temp = _.clone(filters);
      temp.arrayOfHexColorsOrEmptyStrings = '#00ff00,,#00ff00ff';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'arrayOfHexColorsOrEmptyStrings',
            message: 'has to be array of HEX values and empty strings only'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid array of HEX colors or empty strings', done => {
      var temp = _.clone(filters);
      temp.arrayOfHexColorsOrEmptyStrings = ['', '', '#00ff00ff'];
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'arrayOfHexColorsOrEmptyStrings',
            message: 'has to be array of HEX values and empty strings only'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid email', done => {
      var temp = _.clone(filters);
      temp.email = 'notvalidemail';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'email',
            message: 'has to be valid email'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('given value not in supported values', done => {
      var temp = _.clone(filters);
      temp.shareType = 'something';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'shareType',
            message: 'can only have values: twitter,email'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('fail for larger than max', done => {
      validator.validate({numeric: 101}, rules, ['numeric'], (err, msgs) => {
        var expected = [
          {
            path: 'numeric',
            message: 'has to be less than 100'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('fail for less than min', done => {
      validator.validate({numeric: 4}, rules, ['numeric'], (err, msgs) => {
        var expected = [
          {
            path: 'numeric',
            message: 'has to be at least 5'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('fail for not valid password', done => {
      validator.validate({password: 'passwor'}, rules, (err, msgs) => {
        var expected = [
          {
            message: 'has to be at least 8 characters long',
            path: 'password'
          },
          {
            message: 'has to contain at least one uppercase letter',
            path: 'password'
          },
          {
            message: 'has to contain at least one special character',
            path: 'password'
          },
          {
            message: 'has to contain at least one number',
            path: 'password'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('non valid hex color', done => {
      var temp = _.clone(filters);
      temp.color = '#00ff00ff';
      validator.validate(temp, rules, (err, msgs) => {
        should(err).ok;
        var expected = [
          {
            path: 'color',
            message: 'has to be valid HEX color'
          }
        ];
        msgs.should.eql(expected);
        done();
      });
    });

    it('positive price validation', done => {
      const priceRule = { price: { type: 'price' } };

      const positiveValues = [
        { price: '0' },         // single zero
        { price: '1234' },      // no decimals
        { price: '1234.5' },    // single decimal
        { price: '1234.56' }    // two decimals
      ];

      const positiveCheck = (value, cb) => validator.validate(value, priceRule, (err) => {
        should.not.exist(err);
        cb();
      });

      async.each(positiveValues, positiveCheck, done);
    });

    it('negative price validation', done => {
      const priceRule = { price: { type: 'price' } };

      const negativeValues = [
        { price: '00.00' },     // multiple leading zeros
        { price: '1234.567' },  // more than two decimals
        { price: '.5' },        // leading decimal point
        { price: '1234.' }      // trailing decimal point
      ];

      const negativeCheck = (value, cb) => validator.validate(value, priceRule, (err) => {
        should.exist(err);
        cb();
      });

      async.each(negativeValues, negativeCheck, done);
    });
  });

  describe('validation', () => {
    it('should fail for an empty request field', done => {
      var field = 'fieldName';
      var temp = {};

      validator.validation(field, settings)(temp, {}, err => {
        err.message.should.equal('Parameters error');

        var expected = [{
          path: `request.${field}`,
          message: `The request ${field} field must not be empty`
        }];

        err.debugInfo.should.eql(expected);
        done();
      });
    });

    it('should skip empty request field check', done => {
      var field = 'fieldName';
      var temp = {};

      validator.validation(field, { rules: {} }, true)(temp, {}, err => {
        should.not.exist(err);
        done();
      });
    });

    it('should generate and call a successful validate function', done => {
      var field = 'fieldName';
      var temp = {};
      temp[field] = _.clone(filters);

      validator.validation(field, settings)(temp, {}, err => {
        should.not.exist(err);
        done();
      });
    });

    it('should generate and a call an unsuccessful validate function', done => {
      var field = 'fieldName';
      var temp = {};
      temp[field] = _.clone(filters);
      temp[field].numeric = 'notNumeric';

      validator.validation(field, settings)(temp, {}, err => {
        err.message.should.equal('Parameters error');
        done();
      });
    });

    it('should pass a custom condition check', done => {
      var field = 'fieldName';
      var temp = {};
      temp[field] = _.clone(filters);

      var customConditionSettings = _.clone(settings);
      customConditionSettings.conditions = [{
        errorCheck: () => false,
        errorMessage: 'Custom condition check success'
      }];

      validator.validation(field, customConditionSettings)(temp, {}, err => {
        should.not.exist(err);
        done();
      });
    });

    it('should fail a custom condition check', done => {
      var field = 'fieldName';
      var temp = {};
      temp[field] = _.clone(filters);

      var customConditionSettings = _.clone(settings);
      customConditionSettings.conditions = [{
        errorCheck: () => true,
        errorMessage: 'Custom condition check failure'
      }];

      validator.validation(field, customConditionSettings)(temp, {}, err => {
        err.message.should.equal('Parameters error');
        err.debugInfo.should.eql([{
          path: 'conditions',
          message: 'Custom condition check failure'
        }]);
        done();
      });
    });
  });
});
