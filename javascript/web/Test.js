/** @license MIT - Test.js 0.0.1 (browser build) - © ericP */
(function (test) {
(function () {

var element = null;
var classes = { };
var count = 0;

// function extend(base) {
//   if (!base) base = {};
//   for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
//     for (var name in arg)
//       base[name] = arg[name];
//   return base;
// }

function TestInterface(elementParm, classParm) {
  if (!(this instanceof TestInterface))
    return new TestInterface(elementParm, classParm);

  element = elementParm;
  if (classParm)
    classes = classParm;
}

function render (files) { // FileList object (or array).
  // files is a FileList of File objects. List some properties.
  // Array.prototype.slice.call(files).forEach(function (f) {
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var fr = new FileReader();
    fr.onload = function (evt) {
      var src = evt.target.result;
      var append = [];
      function open (name, clss, id) {
        var elem = "<"+name;
        if (clss) elem += " class=\""+clss+"\"";
        if (id) elem += " id=\""+id+"\"";
        elem += ">";
        append.push(elem);
      }
      function close (name) {
        append.push("</"+name+">");
      }

      open("div", classes.itemClass, f.name);
      open("span", classes.titleClass); append.push(encodeURIComponent(f.name)); close("span");
      open("div");
      open("pre", classes.sourceClass, 'source_'+f.name); append.push(src); close("pre");
      var w = "failed to write";
      try {
        var writer = ShExWriter();
        writer.writeSchema(JSON.parse(src), function (error, text, prefixes) {
          if (error) throw error;
          else w = text;
        });
      } catch (e) {
        w = e;
      }
      function escape (s) {
        return s.replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
      open("pre", classes.writerClass, 'writer_'+f.name); append.push(escape(w)); close("pre");
      var g = "failed to parse";
      try {
        debugger;
        var parser = new ShExParser();
        g = JSON.stringify(parser.parse(w));
      } catch (e) {
        try {
          g = e.stack;
        } catch (x) {
          g = ""+e;
        }
      }
      open("pre", classes.genr8dClass, 'genr8d_'+f.name); append.push(escape(g)); close("pre");
      open("div", classes.clearClass); append.push(''); close("div");
      close("div");
      element.innerHTML += append.join('');
      ++count;
    }
    fr.readAsText(f);
  // });
  }
}

TestInterface.prototype = {
  // ## Public properties

  // ### `size` how many segments are pending.
  get size() {
    // Return the triple count if if was cached.
    return count;
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
    element.innerHTML = "";
    count = 0;
  },
};

// ## Exports

// Export the `TestInterface` class as a whole.

Test.Interface = TestInterface;

})();
})(typeof exports !== "undefined" ? exports : this.Test = {});

