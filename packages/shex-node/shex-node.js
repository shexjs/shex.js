// **ShExLoader** return promise to load ShExC, ShExJ and N3 (Turtle) files.

const ShExNodeCjsModule = function (config = {}) {
  const Glob = require("glob").glob;
  const ShExApi = require("@shexjs/api")

  const newApi = ShExApi(Object.assign(
    {},
    {
      fetch: require('node-fetch'),
      jsonld: require('jsonld'),
      loadExtensions: LoadExtensions,
    },
    config
  ))

  const oldGet = newApi.GET
  newApi.GET = async function (url, mediaType) {
    const FS = require("fs")
    const Path = require("path")

    return url === "-"
      ? new Promise(function (fulfill, reject) {
        const inputChunks = [];

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
        let filename = url;
        const fileURLmatch = filename.match("^file://[^/]*(/.*)$");
        if (fileURLmatch)
          filename = fileURLmatch[1];
        if ("cwd" in config)
          filename = Path.join(config.cwd, filename)
        FS.readFile(filename, "utf8", function (error, text) {
          if (error) {
            reject(error)
          } else {
            fulfill({text: text, url: fileURLmatch ? url : "file://" + Path.resolve(process.cwd(), url)});
          }
        })
      })
  }

  return newApi

  function LoadExtensions (globs) {
    return globs.reduce(
      (list, glob) =>
        list.concat(Glob.sync(glob))
      , []).
      reduce(function (ret, path) {
        try {
	  const t = require(path)
	  ret[t.url] = t
	  return ret
        } catch (e) {
	  console.warn("ShEx extension \"" + moduleDir + "\" not loadable: " + e)
	  return ret
        }
      }, {})
  }
}

// return { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExNodeCjsModule;
