"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.repoRoot = repoRoot;
exports.qualityOf = qualityOf;
exports.negotiate = negotiate;
exports.makeServer = makeServer;
exports.main = main;
const Http = __importStar(require("http"));
const Fs = __importStar(require("fs"));
const Path = __importStar(require("path"));
const ContentTypes = {
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
/** repoRoot - nearest enclosing npm-workspaces root, for `npm run serve`
 * anywhere in the monorepo; falls back to the starting directory. */
function repoRoot(from) {
    for (let dir = Path.resolve(from);; dir = Path.dirname(dir)) {
        const manifest = Path.join(dir, "package.json");
        try {
            if ("workspaces" in JSON.parse(Fs.readFileSync(manifest, "utf8")))
                return dir;
        }
        catch (e) { /* no or unparseable package.json here; keep walking */ }
        if (Path.dirname(dir) === dir)
            return Path.resolve(from);
    }
}
/**
 * How much an Accept header wants a media type: its q, from the most
 * specific range that matches (`text/shex` over `text/*` over `*\/*`), and
 * 0 for a type nothing in it covers.  An empty header wants everything.
 */
function qualityOf(type, accept) {
    if (accept.trim() === "")
        return 1;
    let best = null;
    for (const range of accept.split(",")) {
        const [media, ...params] = range.trim().split(";");
        const [rType, rSub] = media.trim().toLowerCase().split("/");
        const [type1, sub1] = type.toLowerCase().split("/");
        const specificity = rType === type1 && rSub === sub1 ? 2
            : rType === type1 && rSub === "*" ? 1
                : rType === "*" && (rSub === "*" || rSub === undefined) ? 0
                    : -1;
        if (specificity === -1)
            continue;
        const qParam = params.map(p => p.trim()).find(p => /^q=/i.test(p));
        const q = qParam === undefined ? 1 : Math.max(0, Math.min(1, parseFloat(qParam.slice(2)) || 0));
        if (best === null || specificity > best.specificity)
            best = { specificity, q };
    }
    return best === null ? 0 : best.q;
}
/** negotiate - when `filePath` has no extension and doesn't exist, pick an
 * extension sibling (filePath + ".*"), preferring the type the Accept
 * header wants most (its q-values, RFC 7231 §5.3.2); a sibling the header
 * rules out with q=0 is never picked while another will do, and ties break
 * alphabetically for determinism. */
function negotiate(filePath, accept) {
    const dir = Path.dirname(filePath);
    const base = Path.basename(filePath);
    if (base.length === 0 || !Fs.existsSync(dir))
        return null;
    const candidates = Fs.readdirSync(dir)
        .filter(name => name.startsWith(base + ".") &&
        Fs.statSync(Path.join(dir, name)).isFile());
    if (candidates.length === 0)
        return null;
    const typeOf = (name) => (ContentTypes[Path.extname(name).toLowerCase()] || "application/octet-stream").replace(/;.*$/, "");
    const wanted = candidates.map(name => ({ name, q: qualityOf(typeOf(name), accept) }));
    // ...and if the header rules out every sibling, any of them rather than
    // nothing: a 406 helps nobody who asked for a file by name
    const acceptable = wanted.some(c => c.q > 0) ? wanted.filter(c => c.q > 0) : wanted;
    acceptable.sort((a, b) => b.q - a.q || (a.name < b.name ? -1 : 1));
    return Path.join(dir, acceptable[0].name);
}
function makeServer(root, options = {}) {
    const always = { "Cache-Control": "no-store" };
    if (options.coi) {
        always["Cross-Origin-Opener-Policy"] = "same-origin";
        always["Cross-Origin-Embedder-Policy"] = "require-corp";
    }
    return Http.createServer((req, res) => {
        const reply = (status, headers, body) => {
            res.writeHead(status, Object.assign({}, always, headers));
            res.end(body);
        };
        try {
            const pathname = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
            const resolved = Path.normalize(Path.join(root, pathname));
            if (resolved !== root && !resolved.startsWith(root + Path.sep))
                return reply(403, { "Content-Type": "text/plain" }, "outside served root\n");
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
                }
                else {
                    const entries = Fs.readdirSync(filePath, { withFileTypes: true })
                        .map(entry => entry.name + (entry.isDirectory() ? "/" : ""))
                        .sort();
                    const here = pathname.endsWith("/") ? pathname : pathname + "/";
                    return reply(200, { "Content-Type": "text/html; charset=utf-8" }, `<!DOCTYPE html><title>${here}</title><h1>${here}</h1><ul>` +
                        (here === "/" ? "" : `<li><a href="..">..</a></li>`) +
                        entries.map(name => `<li><a href="${here}${encodeURIComponent(name).replace(/%2F/g, "/")}">${name}</a></li>`).join("") +
                        "</ul>\n");
                }
            }
            if (!stat || !stat.isFile())
                return reply(404, { "Content-Type": "text/plain" }, `${pathname} not found\n`);
            reply(200, { "Content-Type": ContentTypes[Path.extname(filePath).toLowerCase()] || "application/octet-stream",
                "Content-Length": stat.size }, Fs.readFileSync(filePath));
        }
        catch (e) {
            reply(500, { "Content-Type": "text/plain" }, String(e.message) + "\n");
        }
    });
}
function main(argv = process.argv.slice(2)) {
    const opts = {};
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
            console.log(`  http://localhost:${port}/${page}?editors=textarea   (plain textareas)`);
        });
    });
}
if (require.main === module)
    main();
//# sourceMappingURL=shex-serve.js.map