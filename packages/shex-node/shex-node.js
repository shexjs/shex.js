// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

const ShExApi = require("@shexjs/api")

const FS = require("fs")
const Path = require("path")

ShExNode = ShExApi(
  {
    fetch: require('node-fetch'),
    jsonld: require('jsonld'),
    rdfjs: require('n3'),
  }
)

const oldGet = ShExNode.GET
ShExNode.GET = async function (url, mediaType) {
  return url === "-"
    ? new Promise(function (fulfill, reject) {
      var inputChunks = [];

      //process.stdin.resume(); is old mode needed?
      process.stdin.setEncoding("utf8");

      process.stdin.on("data", function (chunk) {
        inputChunks.push(chunk);
      });

      process.stdin.on("end", function () {
        fulfill({text: inputChunks.join(""), url: url});
      });

      process.stdin.on("error", function (e) {
        reject(e);
      });
    })
    : url.match("^(blob:)?[a-z]+://.") && !url.match("^file://.")
    ? oldGet(url, mediaType)
    : new Promise(function (fulfill, reject) {
      var filename = url;
      var fileURLmatch = filename.match("^file://[^/]*(/.*)$");
      if (fileURLmatch) {
        filename = fileURLmatch[1];
      }
      FS.readFile(filename, "utf8", function (error, text) {
        if (error) {
          reject(error)
        } else {
          fulfill({text: text, url: fileURLmatch ? url : "file://" + Path.resolve(process.cwd(), url)});
        }
      })
    })
}

// return { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExNode;
