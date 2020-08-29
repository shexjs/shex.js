var ShExCore = {
  RdfTerm:    require('@shexjs/term'),
  Util:         require('./lib/ShExUtil'),
  Validator:    require('@shexjs/validator'),
  Writer:    require('./lib/ShExWriter'),
  // 'eval-simple-1err':     require('@shexjs/eval-simple-1err'),
  // 'eval-threaded-nerr': require('@shexjs/eval-threaded-nerr')
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExCore;

