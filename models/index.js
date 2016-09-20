'use strict';
/* eslint-disable no-multi-spaces */
const db        = {};
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
/* istanbul ignore next */
const env       = process.env.NODE_ENV || 'development';
const config    = require('../config/database/' + env + 'DbConfig.json');
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

fs
  .readdirSync(__dirname)
  .filter(function(f) {
    return (f.indexOf('.') !== 0) && (f.indexOf('services') !== 0)
      && (f !== 'index.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

/* istanbul ignore next */
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
