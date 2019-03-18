var ShEx_Core = {
  OldN3Util:    require('./lib/OldN3Util'),
  Util:         require('./lib/ShExUtil'),
  Validator:    require('./lib/ShExValidator'),
  Writer:    require('./lib/ShExWriter'),
  'nfax-val-1err':     require('./lib/regex/nfax-val-1err'),
  'threaded-val-nerr': require('./lib/regex/threaded-val-nerr')
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShEx_Core;

