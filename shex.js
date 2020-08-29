var ShEx = {
  // Parser:       require('./lib/ShExParser'),
  // ShapeMapParser: require('./lib/ShapeMapParser'),
  // ShapeMap:     require('./lib/ShapeMap'),
  // Util:         require('./lib/ShExUtil'),
  // Validator:    require('./lib/ShExValidator'),
  // Loader:       require('./lib/ShExLoader'),
  // Writer:       require('./lib/ShExWriter'),
  // 'eval-simple-1err':     require('@shexjs/eval-simple-1err'),
  // 'eval-threaded-nerr': require('@shexjs/eval-threaded-nerr'),
  N3:           require('n3'),
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShEx;

