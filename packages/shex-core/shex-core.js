var ShExCore = {
  RdfTerm:    require('@shexjs/term'),
  Util:         require('./lib/ShExUtil'),
  Validator:    require('@shexjs/validator'),
  Writer:    require('@shexjs/writer'),
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExCore;

