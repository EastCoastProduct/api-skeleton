'use strict';

const prependKeyword = msg => keyword => `${keyword} ${msg}`

module.exports = {
  prependKeyword: prependKeyword
};
