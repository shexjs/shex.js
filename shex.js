module.exports = {
  Parser:       require('./lib/ShExParser'),
  Util:         require('./lib/ShExUtil'),
  Validator:    require('./lib/ShExValidator'),
  Loader:       require('./lib/ShExLoader'),
  Writer:       require('./lib/ShExWriter'),
  'nfax-val-1err':     require('./lib/regex/nfax-val-1err'),
  'threaded-val-nerr': require('./lib/regex/threaded-val-nerr'),
  Mapper:       require('./extensions/shex-map/module'),
  N3:           require('n3'),
};
