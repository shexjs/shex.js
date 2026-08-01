/** @shexjs/node - extend @shexjs/loader with file: access
 * GET: add access to:
 *   `file:` read from flle system relative to cwd
 *   `-` read from stdin
 * parseJSONLD: add access to:
 *   `file:` read from flle system relative to cwd
 * loadExtensions: added function to dynamically load ShEx Validator extensions
 */
import ShExLoader = require("@shexjs/loader");

const Fs = require('fs')
const Path = require('path')
const Glob = require("glob").glob

class ResourceError extends Error {
  origError: Error;

  constructor (resource: string, error: Error) {
    super(ResourceError.tweakMessage(resource, error));
    this.origError = error; // for stack
  }
  static tweakMessage (resource: string, error: Error): string {
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
function ShExNodeCjsModule (config: ShExNodeCjsModule.Config = {}): ShExLoader.Loader {

  const myLoaderOpts: any = {
    loadExtensions: LoadExtensions,
  }

  const NodeDocLoader = config?.jsonld?.documentLoaders?.node()
  if (NodeDocLoader) {
    const documentLoader = async function (url: string, _options?: any) {
      const m = url.match(FileColonUrlRe);
      if (m) {
        return Fs.promises.access(m[1], Fs.constants.F_OK)
          .then(async () => {
            return {
              contextUrl: null,
              document: await Fs.promises.readFile(m[1], "utf8"),
              documentUrl: url
            }
          })
          .catch(() => Error(`Unable to read ${m![1]}`))
        // console.log("HERE", m)
      } else {
        const ret = await NodeDocLoader(url)
        return ret
      }
    }
    myLoaderOpts.jsonLdOptions = { documentLoader }
  }
  const newLoader = ShExLoader(Object.assign(myLoaderOpts, config))

  const oldGet = newLoader.GET
  newLoader.GET = async function (url: string, mediaType?: string) {
    return url === "-"
      ? new Promise<ShExLoader.LoadedResource>(function (fulfill, reject) {
        const inputChunks: string[] = [];

        //process.stdin.resume(); is old mode needed?
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", function (chunk) {
          inputChunks.push(chunk as unknown as string);
        });

        process.stdin.on("end", function () {
          fulfill({text: inputChunks.join(""), url: url});
        });

        process.stdin.on("error", function (e) {
          reject(e);
        });
      })
      : url.match("^(blob:)?[a-z]+://.") && !url.match(FileColonUrlRe)
      ? oldGet(url, mediaType)
      : new Promise<ShExLoader.LoadedResource>(function (fulfill, reject) {
        let filename = url;
        const fileURLmatch = filename.match(FileColonUrlRe);
        if (fileURLmatch)
          filename = fileURLmatch[1];
        if (config.cwd !== undefined)
          filename = Path.join(config.cwd, filename)
        Fs.readFile(filename, "utf8", function (error: Error | null, text: string) {
          if (error) {
            reject(new ResourceError(url, error));
          } else {
            fulfill({text: text, url: fileURLmatch ? url : "file://" + Path.resolve(process.cwd(), url)});
          }
        })
      })
  }

  return newLoader

  function LoadExtensions (globs: string[]): Record<string, ShExLoader.ShExExtension> {
    return (globs || []).reduce(
      (list: string[], glob) =>
        list.concat(Glob.sync(glob))
      , []).
      reduce(function (ret: Record<string, ShExLoader.ShExExtension>, extPath) {
        try {
	  const absPath = Path.resolve(extPath)
	  const rawModule = require(absPath)
	  const t = typeof rawModule === 'function' ? rawModule(Object.assign({Validator: {}}, config)) : rawModule
	  ret[t.url] = t
	  return ret
        } catch (e) {
	  console.warn("ShEx extension \"" + extPath + "\" not loadable: " + e)
	  return ret
        }
      }, {})
  }
}

namespace ShExNodeCjsModule {
  /** ShExNode config extends ShExLoader.Config with Node.js-specific options. */
  export interface Config extends ShExLoader.Config {
    /** Working directory used to resolve relative file paths. */
    cwd?: string;
  }
}

export = ShExNodeCjsModule;
