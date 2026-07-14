/** shex-serve - zero-dependency static web server for the ShEx web apps.
 *
 * The shex-simple and shexmap-simple pages reference scripts across
 * `packages/*` with relative paths, so they must be served from the
 * repository root by *some* web server. Apache pointed at the checkout works
 * fine; this is the batteries-included alternative:
 *
 *   npm run serve            # from the repo root, then browse to the URLs it prints
 *   npx shex-serve --port 8880 --root /path/to/serve
 *
 * Serves files read-only with no caching; directories list their contents.
 * Development use only -- it makes no attempt at hardening beyond refusing
 * to escape the served root.
 */

import * as Http from "http";
import * as Fs from "fs";
import * as Path from "path";

const ContentTypes: {[extension: string]: string} = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".jsonld": "application/ld+json",
  ".map": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttl": "text/turtle",
  ".shex": "text/shex",
};

// the pages worth advertising on startup, relative to the served root
const KnownPages = [
  "packages/shex-webapp/doc/shex-simple.html",
  "packages/extension-map/doc/shexmap-simple.html",
];

export interface ServeOptions {
  root?: string;
  port?: number;
  /** send COOP/COEP headers so pages are cross-origin isolated --
   * SharedArrayBuffer (which the validation debugger's worker suspension
   * needs) is only available to isolated pages.  The same-origin pages
   * still work; anything embedding cross-origin resources won't. */
  coi?: boolean;
}

/** repoRoot - nearest enclosing npm-workspaces root, for `npm run serve`
 * anywhere in the monorepo; falls back to the starting directory. */
export function repoRoot (from: string): string {
  for (let dir = Path.resolve(from); ; dir = Path.dirname(dir)) {
    const manifest = Path.join(dir, "package.json");
    try {
      if ("workspaces" in JSON.parse(Fs.readFileSync(manifest, "utf8")))
        return dir;
    } catch (e) { /* no or unparseable package.json here; keep walking */ }
    if (Path.dirname(dir) === dir)
      return Path.resolve(from);
  }
}

/** negotiate - when `filePath` has no extension and doesn't exist, pick an
 * extension sibling (filePath + ".*"), preferring types the Accept header
 * asks for; ties break alphabetically for determinism. */
export function negotiate (filePath: string, accept: string): string | null {
  const dir = Path.dirname(filePath);
  const base = Path.basename(filePath);
  if (base.length === 0 || !Fs.existsSync(dir))
    return null;
  const candidates = Fs.readdirSync(dir)
        .filter(name => name.startsWith(base + ".") &&
                Fs.statSync(Path.join(dir, name)).isFile());
  if (candidates.length === 0)
    return null;
  const rank = (name: string): number => {
    const type = (ContentTypes[Path.extname(name).toLowerCase()] || "application/octet-stream")
          .replace(/;.*$/, "");
    return accept.includes(type) ? 0                                 // text/html
      : accept.includes(type.replace(/\/.*$/, "/*")) ? 1             // text/*
      : accept.includes("*/*") || accept === "" ? 2                  // anything
      : 3;
  };
  candidates.sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1));
  return Path.join(dir, candidates[0]);
}

export function makeServer (root: string, options: ServeOptions = {}): Http.Server {
  const always: Http.OutgoingHttpHeaders = {"Cache-Control": "no-store"};
  if (options.coi) {
    always["Cross-Origin-Opener-Policy"] = "same-origin";
    always["Cross-Origin-Embedder-Policy"] = "require-corp";
  }
  return Http.createServer((req, res) => {
    const reply = (status: number, headers: Http.OutgoingHttpHeaders, body: string | Buffer) => {
      res.writeHead(status, Object.assign({}, always, headers));
      res.end(body);
    };
    try {
      const pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
      const resolved = Path.normalize(Path.join(root, pathname));
      if (resolved !== root && !resolved.startsWith(root + Path.sep))
        return reply(403, {"Content-Type": "text/plain"}, "outside served root\n");
      let filePath = resolved;
      let stat = Fs.existsSync(filePath) ? Fs.statSync(filePath) : null;
      if (!stat) {
        // trivial content negotiation: /doc/shex-simple serves
        // shex-simple.html; among several extension siblings (foo.shex,
        // foo.json, ...) the Accept header picks the winner
        const negotiated = negotiate(filePath, String(req.headers.accept || ""));
        if (negotiated) {
          filePath = negotiated;
          stat = Fs.statSync(filePath);
        }
      }
      if (stat && stat.isDirectory()) {
        const index = Path.join(filePath, "index.html");
        if (Fs.existsSync(index)) {
          filePath = index;
          stat = Fs.statSync(index);
        } else {
          const entries = Fs.readdirSync(filePath, {withFileTypes: true})
                .map(entry => entry.name + (entry.isDirectory() ? "/" : ""))
                .sort();
          const here = pathname.endsWith("/") ? pathname : pathname + "/";
          return reply(200, {"Content-Type": "text/html; charset=utf-8"},
                       `<!DOCTYPE html><title>${here}</title><h1>${here}</h1><ul>` +
                       (here === "/" ? "" : `<li><a href="..">..</a></li>`) +
                       entries.map(name => `<li><a href="${here}${encodeURIComponent(name).replace(/%2F/g, "/")}">${name}</a></li>`).join("") +
                       "</ul>\n");
        }
      }
      if (!stat || !stat.isFile())
        return reply(404, {"Content-Type": "text/plain"}, `${pathname} not found\n`);
      reply(200, {"Content-Type": ContentTypes[Path.extname(filePath).toLowerCase()] || "application/octet-stream",
                  "Content-Length": stat.size},
            Fs.readFileSync(filePath));
    } catch (e) {
      reply(500, {"Content-Type": "text/plain"}, String((e as Error).message) + "\n");
    }
  });
}

export function main (argv: string[] = process.argv.slice(2)): void {
  const opts: ServeOptions = {};
  for (let i = 0; i < argv.length; ++i) {
    if (argv[i] === "--port" || argv[i] === "-p")
      opts.port = parseInt(argv[++i], 10);
    else if (argv[i] === "--root" || argv[i] === "-r")
      opts.root = argv[++i];
    else if (argv[i] === "--coi")
      opts.coi = true;
    else {
      console.error(`usage: shex-serve [--port N] [--root DIR] [--coi]
Serves DIR (default: the enclosing npm-workspaces root, else the current
directory) on http://localhost:N/ (default 8880).
--coi sends COOP/COEP headers (cross-origin isolation, enabling
SharedArrayBuffer, e.g. for debugger worker suspension).`);
      process.exit(argv[i] === "--help" || argv[i] === "-h" ? 0 : 1);
    }
  }
  const root = Path.resolve(opts.root || repoRoot(process.cwd()));
  const port = opts.port || 8880;
  makeServer(root, opts).listen(port, () => {
    console.log(`serving ${root} on http://localhost:${port}/${opts.coi ? " (cross-origin isolated)" : ""}`);
    KnownPages.filter(page => Fs.existsSync(Path.join(root, page))).forEach(page => {
      console.log(`  http://localhost:${port}/${page}`);
      console.log(`  http://localhost:${port}/${page}?editors=1   (language-aware editors)`);
    });
  });
}

if (require.main === module)
  main();
