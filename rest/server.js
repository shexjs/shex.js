var log     = console.log,
    app     = require('koa')(),
    koaBody = require('koa-body'),
    port    = process.env.PORT || 4290,
    host    = 'http://localhost',
    fs      = require('fs'),
    ShExValidator = require("../lib/ShExValidator"),
    ShExLoader = require("../lib/ShExLoader"),
    N3      = require("n3");


app.
  use(koaBody({
    multipart: true,
    formLimit: 15,
    formidable: {
      uploadDir: __dirname + '/uploads'
    }
  })).
  use(function *(next) {
    console.log(this.originalUrl);
    switch (this.originalUrl) {
    case "/":
      this.body = fs.readFileSync("./index.html", "utf-8");
      break;
    case "/validate":
      var schemaName, schemaFile, start, dataName, dataFile, focus;
      if (this.request.method == 'POST') {
        var body = this.request.body;
        schemaName = this.request.body.files.schema.name;
        schemaFile = this.request.body.files.schema.path;
        start = this.request.body.fields.start;
        dataName = this.request.body.files.data.name;
        dataFile = this.request.body.files.data.path;
        focus = this.request.body.fields.focus;
      } else {
	this.throw(500, "only supports POST now");
      }

      var _this = this;
      var ret = ShExLoader.load([schemaFile], [], [dataFile], []).then(function (loaded) {
        var validator = ShExValidator.construct(loaded.schema, {});
        var result = validator.validate(loaded.data, focus, start);
        if (body.fields.output === "html") {
	  _this.body = fs.readFileSync("./validate.template", "utf-8").
	    replace(/\[schema\]/, schemaName).
	    replace(/\[start\]/, start).
	    replace(/\[data\]/, dataName).
	    replace(/\[focus\]/, focus).
	    replace(/\[result\]/, JSON.stringify(result, null, 2));
        } else {
          _this.body = JSON.stringify(result, null, 2);
        }
        fs.unlink(schemaFile);
        fs.unlink(dataFile);
      });
      console.log(ret);
      yield ret;
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
