// Test shex-simple browser interface.

"use strict";
const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;
const STARTUP_TIMEOUT = 10000
const SCRIPT_CALLBACK_TIMEOUT = 40000
const PROTOCOL = 'http:'
const HOST = 'localhost'
const PORT = 9999
const PATH = '/shex.js/'
const PAGE =
      'packages/shex-webapp/doc/shex-simple.html'
      // 'packages/extension-map/doc/shexmap-simple.html'

let fs = require('fs')
let expect = require("chai").expect
const node_fetch = require("node-fetch")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
let SharedForTests = null

if (true) {
var Server = require('nock')(PROTOCOL + '//' + HOST + ':' + PORT)
    .get(RegExp(PATH))
    .reply(function(path, requestBody) {
      let filePath = __dirname + '/../' + getRelPath(path);
      let ret = fs.readFileSync(filePath, 'utf8')
      logServed(path, filePath, ret.length)
      return [200, ret, {}];
    })
    .persist()
} else if (false) {
  var Server = new (require("mock-http-server"))({ host: HOST, port: PORT });
  
  Server.start(() => {});
  // Server.stop(done);

  Server.on({
    method: 'GET',
    path: '*',
    reply: {
      status:  200,
      // headers: { "content-type": "application/json" },
      body: function (req) {
        let path = req.originalUrl
        let filePath = getRelPath(path)
        let ret = fs.readFileSync(filePath, 'utf8');
        logServed(req.originalUrl, filePath, ret.length)
        return ret
      }
    }
  });
} else {
  const http = require('http')

  const requestHandler = (request, response) => {
    let filePath = getRelPath(request.url)
    let ret = fs.readFileSync(filePath, 'utf8');
    logServed(request.url, filePath, ret.length)
    return response.end(ret)
  }

  const Server = http.createServer(requestHandler)

  Server.listen(PORT, (err) => {
    if (err) {
      return console.log('something bad happened', err)
    }
  })
}

function getRelPath (url) {
  url = url.replace(/^\/shexSpec/, '')
  let filePath = url.substr(PATH.length)
  return filePath.replace(/\?.*$/, '')
}

function logServed (url, filePath, length) {
  // console.log(url, filePath, length)
}

function getDom (searchParms) {
  let url = PROTOCOL + '//' + HOST + ':' + PORT + PATH + PAGE + searchParms
  return new JSDOM(fs.readFileSync(__dirname + '/../' + PAGE, 'utf8'), {
    url: url,
    runScripts: "dangerously",
    resources: "usable"
  })
}

function setup (done, ready, searchParms) {
  // let start = Date.now()
  // stamp('start')
  let timer = setTimeout(() => {
    // stamp('script load timeout')
    done('script load timeout')
  }, SCRIPT_CALLBACK_TIMEOUT)
  let dom = getDom(searchParms)
  // stamp('dom')
  dom.window.fetch = node_fetch
  dom.window._testCallback = parm => {
    if (parm instanceof Error)
      return done(parm)

    // stamp('hear')
    clearTimeout(timer)
    ready(dom)
    SharedForTests = parm
    done()
  }
  return dom

  // function stamp (message) {
  //   let t = Date.now()
  //   console.warn(message, t, t - start)
  //   start = t
  // }
}

if (!TEST_browser) {
  console.warn("Skipping browser-tests; to activate these tests, set environment variable TEST_browser=true");

} else {

  describe('no URL parameters', function () {
    this.timeout(SCRIPT_CALLBACK_TIMEOUT);
    let dom, $
    before(done => {
      dom = setup(done, () => $ = dom.window.$,
                  '')
    })

    describe('validation output', function () {
      it("should have empty schema", function () {
        $('#inputSchema textarea').val()
      })

      it("should have empty data", function () {
        $('#inputData textarea').val()
      })

      it("should load clinical observation example", async function () {
        let ClinObs, WithBDate

        ClinObs = $('#manifestDrop').find('button').slice(0, 1)
        expect(ClinObs.text()).to.equal('clinical observation')
        ClinObs.click()
        await SharedForTests.promise

        WithBDate = $('.passes').find('button').slice(0, 1)
        expect(WithBDate.text()).to.equal('with birthdate')
        WithBDate.click()
        await SharedForTests.promise
      }).timeout(STARTUP_TIMEOUT)

      it("human output", async function () {
        $("#interface").val("human");
        await validationResults({
          name: "human", selector: "> div", contents: [
            { shapeMap: "<Obs1>@START"                  , classes: ["human", "passes"] },
            { shapeMap: "<Patient2>@!<ObservationShape>", classes: ["human", "passes"] },
          ]
        })
      })

      it("minimal output", async function () {
        $("#interface").val("minimal");
        await validationResults({
          name: "minimal", selector: "> pre", contents: [
            { shapeMap: /"node": "[^"]+Obs1"/, classes: ["passes"] },
            { shapeMap: /"node": "[^"]+Patient2"/, classes: ["passes"] },
          ]
        })
      })

      it("matched graph output", async function () {
        $("#interface").val("human");
        $("#success").val("query");
        await validationResults({
          name: "human", selector: "> *", contents: [
            { shapeMap: ":name \"Bob\""                 , classes: ["passes"] },
            { shapeMap: "<Patient2>@!<ObservationShape>", classes: ["human", "passes"] },
          ]
        })
      })
    })

    describe('query map', function () {
      it("empty", async function () {
        await set("#textMap", "")
        expect($("#editMap .pair").length).to.equal(1)
        expect($("#fixedMap .pair").length).to.equal(0)
        expect(mapToText($("#editMap"))).to.equal("@")
        expect(mapToText($("#fixedMap"))).to.equal("")
      })

      it("one", async function () {
        await set("#textMap", "{FOCUS :subject _}@START")
        expect($("#editMap .pair").length).to.equal(1)
        expect($("#fixedMap .pair").length).to.equal(1)
        expect(mapToText($("#editMap"))).to.equal("{FOCUS <http://hl7.org/fhir/subject> _}@START")
        expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
      })

      it("one,", async function () {
        await set("#textMap", "{FOCUS :subject _}@START,")
        expect($("#editMap .pair").length).to.equal(1)
        expect($("#fixedMap .pair").length).to.equal(1)
        expect(mapToText($("#editMap"))).to.equal("{FOCUS <http://hl7.org/fhir/subject> _}@START")
        expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
      })

      it("two -> one", async function () {
        await set("#textMap", "{FOCUS :subject _}@START,{FOCUS :lalala _}@START")
        expect($("#editMap .pair").length).to.equal(2)
        expect($("#fixedMap .pair").length).to.equal(1)
        expect(mapToText($("#editMap"))).to.equal("{FOCUS <http://hl7.org/fhir/subject> _}@START,{FOCUS <http://hl7.org/fhir/lalala> _}@START")
        expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
      })

      async function set (selector, value) {
        $(selector).val(value)
        $(selector).trigger("change")
        await SharedForTests.promise
      }

      async function wait (timeout) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(timeout)
          }, timeout)
        })
      }

      function mapToText (map) {
        return map.find(".pair").map((idx, pair) => fixedMapPairToText(pair)).get().join(',')
      }
      function fixedMapPairToText (pair) {
        return $(pair).find(".focus").val() + $(pair).find(".shapeMap-joiner").text() + $(pair).find(".inputShape").val()
      }
    })

    async function validationResults (expected) {
      $("#validate").trigger('click')
      await SharedForTests.promise
      const resDiv = $('#results > div')
      expect(resDiv.length).to.equal(1)
      const res = resDiv.find(expected.selector)

      expected.contents.forEach((contents, idx) => {
        const elt = res.get(idx)
        expect(elt).not.to.equal(undefined)
        const classList = [...elt.classList]
        contents.classes.forEach(cls => expect(classList).to.include(cls))
        if (contents.shapeMap.constructor === RegExp)
          expect(elt.textContent).to.match(contents.shapeMap)
        else
          expect(elt.textContent).to.include(contents.shapeMap)
      })
    }
  })

  describe('explicit manifest', function () {
    this.timeout(SCRIPT_CALLBACK_TIMEOUT);
    let dom, $
    before(done => { dom = setup(done, () => $ = dom.window.$,
                                 '?manifestURL=../examples/manifest.json') })

    it("should load clinical observation example", function (done) {
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.slice(0, 1).text()).to.equal('clinical observation')
      done()
    }).timeout(STARTUP_TIMEOUT)
  })

  describe('another manifest', function () {
    this.timeout(SCRIPT_CALLBACK_TIMEOUT);
    let dom, $
    before(done => { dom = setup(done, () => $ = dom.window.$,
                                 '?manifestURL=/shex.js/test/browser/manifest-one.json') })

    it("should load clinical observation example", async function () {
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.slice(0, 1).text()).to.equal('1dotOr2dot_pass_p1')
    }).timeout(STARTUP_TIMEOUT)
  })

  describe('no manifest', function () {
    this.timeout(SCRIPT_CALLBACK_TIMEOUT);
    let dom, $
    before(done => { dom = setup(done, () => $ = dom.window.$, '?manifestURL=') })

    it("should load no schemas", async function () {
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.length).to.equal(0)
    }).timeout(STARTUP_TIMEOUT)
  })

  describe('dragon drop', function () {
    this.timeout(SCRIPT_CALLBACK_TIMEOUT);
    let dom, $
    before(done => { dom = setup(done, () => $ = dom.window.$, '?manifestURL=') })

    it("single test manifest", async function () {
      await drop("#manifestDrop", { "application/json": JSON.stringify(testEx1, null, 2) })
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.length).to.equal(1)
      expect(buttons.slice(0, 1).text()).to.equal('1NOTRefOR1dot.shex')
    })

    it("test manifest array of one", async function () {
      await drop("#manifestDrop", { "application/json": JSON.stringify([testEx1], null, 2) })
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.length).to.equal(1)
      expect(buttons.slice(0, 1).text()).to.equal('1NOTRefOR1dot.shex')
    })

    it("test manifest array of two", async function () {
      await drop("#manifestDrop", { "application/json": JSON.stringify([testEx1, testEx2], null, 2) })
      let buttons = $('#manifestDrop').find('button')
      expect(buttons.length).to.equal(2)
      expect(buttons.slice(0, 1).text()).to.equal('1NOTRefOR1dot.shex')
      expect(buttons.slice(1, 2).text()).to.equal('1dot-relative.shex')
    })

    async function drop (selector, data) {
      const $elt = $(selector)
      const offset = $elt.offset()
      const type = "drop";
      const options = Object.assign({}, {
	bubbles: true,
	cancelable: (type !== "mousemove"),
	view: dom.window,
	detail: 0,
	screenX: 0,
	screenY: 0,
	clientX: 1,
	clientY: 1,
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false,
	button: 0,
	relatedTarget: undefined
      }, {
        dx: offset.left,
        dy: offset.top
      });
      const event = dom.window.document.createEvent("MouseEvents");
      event.initMouseEvent( type, options.bubbles, options.cancelable,
			    options.view, options.detail,
			    options.screenX, options.screenY, options.clientX, options.clientY,
			    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
			    options.button, options.relatedTarget || dom.window.document.body.parentNode );
      event.dataTransfer = {
        data: data,
        setData: function(type, val) {
          this.data[type] = val
        },
        getData: function(type) {
          return this.data[type]
        },
	dropEffect: 'none',
	effectAllowed: 'all',
        files: [],
 	items: {},
	types: [],
      }
      // const dataTransfer = new DataTransfer;
      // dataTransfer.setData("data", data);
      // const event = new DragEvent('drop', { dataTransfer: dataTransfer });
      const elem = $elt.get(0);
      elem.dispatchEvent( event );
      await SharedForTests.promise;
    }
  })

  let testExample1 = {
    "@id": "#3circRefS1-IS2-IS3-IS3",
    "@type": "sht:ValidationTest",
    "action": {
      "schema": "https://shex.io/shexTest/master/schemas/3circRefS1-IS2-IS3-IS3.shex",
      "shape": "http://a.example/S1",
      "data": "https://shex.io/shexTest/master/validation/3circRefPlus1_pass-open.ttl",
      "focus": "http://a.example/n1"
    },
    "extensionResults": [],
    "name": "3circRefS1-IS2-IS3-IS3",
    "trait": [
      "Import"
    ],
    "comment": "I2 I3 <S1> { <p1> ., <p2> @<S2>? } | I3 <S2> { <p3> @<S3> } | <S3> { <p4> @<S1> } on { <n1> <p1> \"X\" ; <p2> <n2> . <n2> <p3> <n3> . <n3> <p4> <n5> . <n5> <p1> \"X\" }",
    "status": "mf:proposed",
    "result": "3circRefPlus1_pass-open.val"
  }

  const testEx1 = {
    "@id": "#1NOTRefOR1dot_pass-inOR",
    "@type": "sht:ValidationTest",
    "action": {
      "schema": "http://localhost/checkouts/shexSpec/shexTest/schemas/1NOTRefOR1dot.shex",
      "shape": "http://a.example/S1",
      "data": "http://localhost/checkouts/shexSpec/shexTest/validation/In1_Ip1_In2.In2_Ip2_LX.ttl",
      "focus": "http://a.example/n1"
    },
    "extensionResults": [],
    "name": "1NOTRefOR1dot_pass-inOR",
    "comment": "<S1> { <p1> NOT @<S2> OR { <p2> . } } <S2> { <p3> . } in { <n1> <p1> <n2> . <n2> <p2> \"X\" }",
    "status": "mf:Proposed"
  }

  const testEx2 = {
    "@id": "#1dot-relative_pass-short-shape",
    "@type": "sht:ValidationTest",
    "action": {
      "schema": "http://localhost/checkouts/shexSpec/shexTest/validation/1dot-relative.shex",
      "shape": "S1",
      "data": "http://localhost/checkouts/shexSpec/shexTest/validation/Is1_Ip1_Io1-relative.ttl",
      "focus": "s1"
    },
    "extensionResults": [],
    "name": "1dot-relative_pass-short-shape",
    "trait": [
      "relativeIRI"
    ],
    "comment": "<S1> { <p1> [<o1>] } on <S1> in { <s1> <p1> <o1> }",
    "status": "mf:Approved"
  }

  const both = [ testEx1, testEx2 ]
}

