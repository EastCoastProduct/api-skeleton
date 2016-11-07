'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING
    })
    .then(function() {
      return queryInterface.sequelize.query(
        `UPDATE users SET name = CONCAT (firstname, ' ', lastname);`
      );
    })
    .then(function() {
      return queryInterface.removeColumn('users', 'firstname');
    })
    .then(function() {
      return queryInterface.removeColumn('users', 'lastname');
    });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'firstname', {
      type: Sequelize.STRING
    })
    .then(function() {
      return queryInterface.addColumn('users', 'lastname', {
        type: Sequelize.STRING
      });
    })
    .then(function() {
      return queryInterface.sequelize.query(
        `UPDATE users SET
          firstname = substring(name, 1, position(' ' IN name) - 1),
          lastname = substring(
            name,
            position(' ' IN name) + 1,
            char_length(name)
          );`
      );
    })
    .then(function() {
      return queryInterface.removeColumn('users', 'name');
    });
  }
};
