var ShEx = {
  // Parser:       require('./lib/ShExParser'),
  // ShapeMapParser: require('./lib/ShapeMapParser'),
  // ShapeMap:     require('./lib/ShapeMap'),
  // Util:         require('./lib/ShExUtil'),
  // Validator:    require('./lib/ShExValidator'),
  // Loader:       require('./lib/ShExLoader'),
  // Writer:       require('./lib/ShExWriter'),
  // 'nfax-val-1err':     require('./lib/regex/nfax-val-1err'),
  // 'threaded-val-nerr': require('./lib/regex/threaded-val-nerr'),
  N3:           require('n3'),
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShEx;

