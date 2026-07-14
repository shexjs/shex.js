/**
 * Test doubles for HTTP resources, e.g.
 *
 const [[GitRootServer]] = require('../../../tools/testServer')
   .startServer([{ url: 'http://localhost:9999/shex.js/', fromDir: Path.join(__dirname, '../../..') }])
 fetch(GitRootServer.urlFor('getSomethingOrItsA404'))
 *
 * URLs on localhost get a real node:http server, visible to any HTTP stack
 * (including jsdom's undici-based resource loader and spawned child
 * processes).  URLs on other (pretend) hosts are intercepted in-process with
 * nock, which only works for clients built on http.ClientRequest (e.g.
 * node-fetch@2).
 */
const Fs = require('fs')
const Path = require('path')
const Http = require('http')
const Nock = require('nock');

// Uncomment logs to watch HTTP traffic.
function log200 (url, filePath, length) {
  // console.log(200, url, filePath, length)
}
function log404 (url) {
  // console.warn(404, url)
}

const ContentTypes = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.json': 'application/json',
  '.jsonld': 'application/ld+json',
  '.svg': 'image/svg+xml',
}

function contentTypeFor (path) {
  return ContentTypes[Path.extname(path.replace(/\?.*$/, ''))] || 'text/plain'
}

function parseUrl (url) {
  const asUrl = new URL(url);
  const path = asUrl.pathname;
  const server = new URL("/", asUrl).href.replace(/\/$/, '');
  const localhost = asUrl.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].indexOf(asUrl.hostname) !== -1;
  const port = parseInt(asUrl.port || '80', 10);
  return {server, path, localhost, port};
}

// One real server per localhost port, shared by every startServer call.
const RealServers = new Map(); // port -> {server, routes: [{webroot, fromDir}], files: [{path, file}]}

function realServer (port) {
  if (!RealServers.has(port)) {
    const entry = {routes: [], files: []};
    entry.server = Http.createServer((req, res) => {
      const reqPath = req.url.replace(/\?.*$/, '');
      const file = entry.files.find(f => f.path === reqPath);
      if (file) {
        res.writeHead(200, {'Content-Type': contentTypeFor(file.file)});
        res.end(Fs.readFileSync(file.file));
        return;
      }
      const route = entry.routes
            .filter(r => reqPath.startsWith(r.webroot))
            .sort((a, b) => b.webroot.length - a.webroot.length)[0];
      const [status, body, headers] = route
            ? readFromFilesystem(req.url, route.fromDir, route.webroot)
            : [404, `${reqPath} not found`, {}];
      res.writeHead(status, Object.assign({'Content-Type': contentTypeFor(reqPath)}, headers));
      res.end(body);
    });
    entry.server.listen(port);
    entry.server.unref(); // don't hold the test process open
    RealServers.set(port, entry);
  }
  return RealServers.get(port);
}

function startServer (paths, files = []) {
  const pathScopes = paths.map(f => {
    const {server, path: webroot, localhost, port} = parseUrl(f.url);
    const urlFor = page => server + webroot + page;
    if (localhost) {
      realServer(port).routes.push({webroot, fromDir: f.fromDir});
      return {urlFor};
    }
    return {
      scope: Nock(server)
        .get(RegExp(webroot))
        .reply(function(reqP, requestBody) {
          return readFromFilesystem(reqP, f.fromDir, webroot);
        })
        .persist(),
      urlFor
    }
  })

  const fileScopes = files.map(f => {
    const {server, path, localhost, port} = parseUrl(f.url);
    if (localhost) {
      realServer(port).files.push({path, file: f.file});
      return {};
    }
    return {
      scope: Nock(server)
        .get(path)
        .replyWithFile(200, f.file)
        .persist()
    }
  } )

  return [pathScopes, fileScopes]
}

// blindly tries file extensions. should look at request headers.
function readFromFilesystem (reqPath, fromDir, webroot) {
  let filePath = Path.join(fromDir, getRelPath(reqPath, webroot));
  let last
  const extensions = ['', '.shex', '.ttl']
  const ret = extensions.find(
    ext => Fs.existsSync(last = filePath + ext)
  )
  if (ret !== undefined) {
    const ret = Fs.readFileSync(last, 'utf8')
    log200(reqPath, last, ret.length)
    return [200, ret, {}]
  } else {
    log404(reqPath)
    return [404, `${last} not found`, {}]
  }
}

function getRelPath (url, webroot) {
  return url.substr(webroot.length).replace(/\?.*$/, '')
}

module.exports = {startServer}
