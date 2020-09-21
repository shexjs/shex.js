// Test shex-simple browser interface.

"use strict";
const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;
const STARTUP_TIMEOUT = 10000
const SCRIPT_CALLBACK_TIMEOUT = 40000
const PROTOCOL = 'http:'
const HOST = 'localhost'
const PORT = 9999
const PATH = '/shex.js/'
const PAGE = 'packages/shex-webapp/doc/shex-simple.html'

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
      let filePath = getRelPath(path)
      let ret = fs.readFileSync(__dirname + '/../' + filePath, 'utf8')
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

describe('no URL parameters', function () { // needs this
  this.timeout(SCRIPT_CALLBACK_TIMEOUT);
  let dom, $
  before(done => {
    dom = setup(done, () => $ = dom.window.$,
                '')
  })

  it("should have empty schema", function () {
    dom.window.$('#inputSchema textarea').val()
  })

  it("should have empty data", function () {
    dom.window.$('#inputData textarea').val()
  })

  let InputData, InputSchema
  let QueryMap, QueryMapEditor, FixedMap
  let ClinObs, WithBDate

  it("should load clinical observation example", async function () {
    ClinObs = $('#manifestDrop').find('button').slice(0, 1)
    expect(ClinObs.text()).to.equal('clinical observation')
    ClinObs.click()

    WithBDate = $('.passes').find('button').slice(0, 1)
    expect(WithBDate.text()).to.equal('with birthdate')
    WithBDate.click()

    QueryMap = $('#textMap')
    QueryMapEditor = $('#editMap')
    FixedMap = $('#fixedMap')
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


  it("set query map - empty", async function () {
    await set("#textMap", "")
    expect($("#editMap .pair").length).to.equal(1)
    expect($("#fixedMap .pair").length).to.equal(0)
    expect(mapToText($("#editMap"))).to.equal("@")
    expect(mapToText($("#fixedMap"))).to.equal("")
  })

  it("set query map - one", async function () {
    await set("#textMap", "{FOCUS :subject _}@START")
    expect($("#editMap .pair").length).to.equal(1)
    expect($("#fixedMap .pair").length).to.equal(1)
    expect(mapToText($("#editMap"))).to.equal("{FOCUS <http://hl7.org/fhir/subject> _}@START")
    expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
  })

  it("set query map - one,", async function () {
    await set("#textMap", "{FOCUS :subject _}@START,")
    expect($("#editMap .pair").length).to.equal(1)
    expect($("#fixedMap .pair").length).to.equal(1)
    expect(mapToText($("#editMap"))).to.equal("{FOCUS <http://hl7.org/fhir/subject> _}@START")
    expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
  })

  it("set query map - two -> one", async function () {
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

  function validationResults (expected) {
    return new Promise((resolve, reject) => {
      $.event.trigger('click', e => {
        const resDiv = $('#results > div')
        expect(resDiv.length).to.equal(1)
        const res = resDiv.find(expected.selector)

        expected.contents.forEach((contents, idx) => {
          const elt = res.get(idx)
          const classList = [...elt.classList]
          contents.classes.forEach(cls => expect(classList).to.include(cls))
          if (contents.shapeMap.constructor === RegExp)
            expect(elt.textContent).to.match(contents.shapeMap)
          else
            expect(elt.textContent).to.include(contents.shapeMap)
        })
        resolve()
      }, dom.window.document.getElementById('validate'))
    })
  }
})

describe('default URL parameters', function () { // needs this
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

}

