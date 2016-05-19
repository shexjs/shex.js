var log     = console.log,
    app     = require('koa')(),
    koaBody = require('koa-body'),
    port    = process.env.PORT || 4290,
    host    = 'http://localhost',
    fs      = require('fs'),
    ShExValidator = require("../lib/ShExValidator"),
    ShExLoader = require("../lib/ShExLoader"),
    N3      = require("n3"),
    NotSupplied = "-- not supplied --",
    RDF_TYPE= "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";


function resolveRelativeIRI (baseIri, relativeIri) {
  if (!N3.Util.isIRI(relativeIri))
    return relativeIri; // not really an IRI
  var p = N3.Parser({ documentIRI: baseIri });
  p._readSubject({type: "IRI", value: relativeIri});
  return p._subject;
}

function parsePassedNode (passedValue, baseIri, deflt) {
  if (passedValue.length === 0)
    return deflt ? deflt(baseIri) : NotSupplied;
  if (passedValue[0] === "<" && passedValue[passedValue.length-1] === ">")
    passedValue = passedValue.substr(1, passedValue.length-2);
  return resolveRelativeIRI(baseIri, passedValue);
}

app.
  use(koaBody({
    multipart: true,
    formLimit: 15,
    formidable: {
      uploadDir: __dirname + '/uploads'
    }
  })).
  use(function *(next) {
    switch (this.originalUrl) {
    case "/":
      this.body = fs.readFileSync("./index.html", "utf-8");
      break;
    case "/validate":
      var parms = {
        schemaName:null, schemaFile:null, start:null,
        dataName:null,   dataFile:null,   focus:null, focusType:null
      };
      if (this.request.method == 'POST') {
        var body = this.request.body;
        parms.schemaName = body.files.schema.name;
        parms.schemaFile = body.files.schema.path;
        parms.start      = body.fields.start;
        parms.dataName   = body.files.data.name;
        parms.dataFile   = body.files.data.path;
        parms.focus      = body.fields.focus;
        parms.focusType  = body.fields.focusType;
      } else {
        this.throw(500, "only supports POST now");
      }

      var _this = this;
      yield ShExLoader
        .load([parms.schemaFile], [], [parms.dataFile], [])
        .then(function (loaded) {
          function someShape (baseIri) {
            var rel = resolveRelativeIRI(baseIri, "");
            if (rel in loaded.schema.shapes)
              return rel;
            return Object.keys(loaded.schema.shapes)[0];
          }
          function someIRInode (baseIri) {
            var triples = loaded.data.find(null, null, null)
            for (var i = 0; i < triples.length; ++i)
              if (N3.Util.isIRI(triples[i].subject))
                return triples[i].subject;
            return triples.length > 0 ? triples[0].subject : NotSupplied;
          };
          function someNodeWithType (type) {
            var triples = loaded.data.find(null, RDF_TYPE, type)
            return triples.length > 0 ? triples[0].subject : NotSupplied;
          };
          parms.start = parsePassedNode(parms.start, loaded.schemaSources[0].url, someShape);
          parms.focus = parms.focusType ?
            someNodeWithType(parsePassedNode(parms.focusType, loaded.dataSources[0].url, null)) :
            parsePassedNode(parms.focus, loaded.dataSources[0].url, someIRInode);
          var validator = ShExValidator.construct(loaded.schema, {});
          var result = parms.focus === NotSupplied ? {} : validator.validate(loaded.data, parms.focus, parms.start);
          if (body.fields.output === "html") {
            _this.body = Object.keys(parms).reduce((r, p) => {
              return r.replace("["+p+"]", parms[p]);
            }, fs.readFileSync("./validate.template", "utf-8")).
              replace(/\[result\]/, JSON.stringify(result, null, 2));
          } else {
            _this.body = JSON.stringify(result, null, 2);
          }
          fs.unlink(parms.schemaFile);
          fs.unlink(parms.dataFile);
          return next;
        });
      break;
    default:
      this.throw(404, "whazzat?");
    }
  }).
  listen(port);


log('Visit %s:%s/ in browser.', host, port);
log();
log('Test with executing this commands:');
log('curl -i %s:%s/validate -F "schema=@../test/cli/1dotOr2dot.shex" -F "start=http://a.example/S1" -F "data=@../test/cli/p2p3.ttl" -F "focus=http://a.example/x"', host, port);
log();
log('Press CTRL+C to stop...');
