/** @license MIT - Test.js 0.0.1 (browser build) - © ericP */
(function (test) {
(function () {

var classes = { };

// function extend(base) {
//   if (!base) base = {};
//   for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
//     for (var name in arg)
//       base[name] = arg[name];
//   return base;
// }

function TestInterface(classParm) {
  if (!(this instanceof TestInterface))
    return new TestInterface(classes);

  if (classParm)
    classes = classParm;
}

var output = [];
function render (files) { // FileList object (or array).
  // files is a FileList of File objects. List some properties.
  // Array.prototype.slice.call(files).forEach(function (f) {
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var fr = new FileReader();
    fr.onload = function (evt) {
      output.push('<li id="'+f.name+'"><strong>', encodeURIComponent(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '<pre class="json">', evt.target.result, '</pre>\n',
                  '</li>');
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }
    fr.readAsText(f);
  // });
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

TestInterface.prototype = {
  // ## Public properties

  // ### `size` how many segments are pending.
  get size() {
    // Return the triple count if if was cached.
    return output.length;
  },

  // ## Private methods

  // ### `_addToIndex` adds a triple to a three-layered index.
  play: function () {
    var writer = ShExWriter();
    writer.addShape({
      "type": "shape",
      "expression": {
        "type": "tripleConstraint",
        "predicate": "http://a.example/p1",
        "value": { "type": "valueClass" }
      },
      "semAct": { "http://a.example/semAct1": " code1 " }
    });
    writer.end(function (error, text, prefixes) {
      if (text)
	console.log(text, '.');
      else
	try {
	  console.dir(error);
	} catch (e) {
	  console.log("error: " + error, prefixes);
	}
    });
  },
  handleFileSelect: function(evt) {
    render(evt.target.files);
  },
  handleDragSelect: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    render(evt.dataTransfer.files);
  },
  handleDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  },
  clearFileSelect: function(evt) {
    output = [];
    render([]); // add nothing
  },
};

// ## Exports

// Export the `TestInterface` class as a whole.

Test.Interface = TestInterface;

})();
})(typeof exports !== "undefined" ? exports : this.Test = {});

