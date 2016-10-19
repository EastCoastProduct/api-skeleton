'use strict';

module.exports = (Sequelize, modelName) => {
  let Model = Sequelize.sequelize.model(modelName);

  const remove = params =>
    Model.destroy({ where: params, individualHooks: true });

  return {
    remove: remove
  };
};
