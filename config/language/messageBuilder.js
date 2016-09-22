'use strict';

const _constructMessage = (a, b) => `${a} ${b}`;

const appendKeyword = msg => keyword => _constructMessage(msg, keyword);

const prependKeyword = msg => keyword => _constructMessage(keyword, msg);

module.exports = {
  appendKeyword: appendKeyword,
  prependKeyword: prependKeyword
};
