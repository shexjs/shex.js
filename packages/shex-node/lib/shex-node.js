"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** @shexjs/node - extend @shexjs/loader with file: access
 * GET: add access to:
 *   `file:` read from flle system relative to cwd
 *   `-` read from stdin
 * parseJSONLD: add access to:
 *   `file:` read from flle system relative to cwd
 * loadExtensions: added function to dynamically load ShEx Validator extensions
 */
const ShExLoader = require("@shexjs/loader");
const Fs = require('fs');
const Path = require('path');
const Glob = require("glob").glob;
class ResourceError extends Error {
    constructor(resource, error) {
        super(ResourceError.tweakMessage(resource, error));
        this.origError = error; // for stack
    }
    static tweakMessage(resource, error) {
        return error.message + '\n  resource: ' + resource;
    }
}
const FileColonUrlRe = "^file://[^/]*(/.*)$";
/**
 * Extends @shexjs/loader with:
 * - `file:` URL and filesystem path support
 * - stdin (`-`) support
 * - Dynamic loading of ShEx extensions via loadExtensions()
 */
function ShExNodeCjsModule(config = {}) {
    var _a, _b;
    const myLoaderOpts = {
        loadExtensions: LoadExtensions,
    };
    const NodeDocLoader = (_b = (_a = config === null || config === void 0 ? void 0 : config.jsonld) === null || _a === void 0 ? void 0 : _a.documentLoaders) === null || _b === void 0 ? void 0 : _b.node();
    if (NodeDocLoader) {
        const documentLoader = function (url, _options) {
            return __awaiter(this, void 0, void 0, function* () {
                const m = url.match(FileColonUrlRe);
                if (m) {
                    return Fs.promises.access(m[1], Fs.constants.F_OK)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        return {
                            contextUrl: null,
                            document: yield Fs.promises.readFile(m[1], "utf8"),
                            documentUrl: url
                        };
                    }))
                        .catch(() => Error(`Unable to read ${m[1]}`));
                    // console.log("HERE", m)
                }
                else {
                    const ret = yield NodeDocLoader(url);
                    return ret;
                }
            });
        };
        myLoaderOpts.jsonLdOptions = { documentLoader };
    }
    const newLoader = ShExLoader(Object.assign(myLoaderOpts, config));
    const oldGet = newLoader.GET;
    newLoader.GET = function (url, mediaType) {
        return __awaiter(this, void 0, void 0, function* () {
            return url === "-"
                ? new Promise(function (fulfill, reject) {
                    const inputChunks = [];
                    //process.stdin.resume(); is old mode needed?
                    process.stdin.setEncoding("utf8");
                    process.stdin.on("data", function (chunk) {
                        inputChunks.push(chunk);
                    });
                    process.stdin.on("end", function () {
                        fulfill({ text: inputChunks.join(""), url: url });
                    });
                    process.stdin.on("error", function (e) {
                        reject(e);
                    });
                })
                : url.match("^(blob:)?[a-z]+://.") && !url.match(FileColonUrlRe)
                    ? oldGet(url, mediaType)
                    : new Promise(function (fulfill, reject) {
                        let filename = url;
                        const fileURLmatch = filename.match(FileColonUrlRe);
                        if (fileURLmatch)
                            filename = fileURLmatch[1];
                        if (config.cwd !== undefined)
                            filename = Path.join(config.cwd, filename);
                        Fs.readFile(filename, "utf8", function (error, text) {
                            if (error) {
                                reject(new ResourceError(url, error));
                            }
                            else {
                                fulfill({ text: text, url: fileURLmatch ? url : "file://" + Path.resolve(process.cwd(), url) });
                            }
                        });
                    });
        });
    };
    return newLoader;
    function LoadExtensions(globs) {
        return (globs || []).reduce((list, glob) => list.concat(Glob.sync(glob)), []).
            reduce(function (ret, extPath) {
            try {
                const absPath = Path.resolve(extPath);
                const rawModule = require(absPath);
                const t = typeof rawModule === 'function' ? rawModule(Object.assign({ Validator: {} }, config)) : rawModule;
                ret[t.url] = t;
                return ret;
            }
            catch (e) {
                console.warn("ShEx extension \"" + extPath + "\" not loadable: " + e);
                return ret;
            }
        }, {});
    }
}
module.exports = ShExNodeCjsModule;
//# sourceMappingURL=shex-node.js.map