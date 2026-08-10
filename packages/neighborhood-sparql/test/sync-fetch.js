"use strict";
/**
 * Synchronous HTTP for node, so that the (synchronous) NeighborhoodDb API can
 * talk to a real SPARQL endpoint over a real socket.
 *
 * A worker thread owns the socket; the calling thread parks in Atomics.wait()
 * until the worker signals, then picks the response off a MessageChannel with
 * receiveMessageOnPort(). Nothing here is test-specific -- `installXhrShim()`
 * just makes `ShExUtil.executeQuery`'s XMLHttpRequest work outside a browser.
 *
 * The endpoint must live in another thread or process: a server sharing this
 * thread's event loop can never answer a request this thread is blocking on.
 */

const {Worker, MessageChannel, receiveMessageOnPort} = require("worker_threads");

const WORKER_SRC = `
const http = require("http");
const https = require("https");
const {parentPort, workerData} = require("worker_threads");
const {port, signal} = workerData;

parentPort.on("message", req => {
  const lib = req.url.startsWith("https:") ? https : http;
  const done = payload => {
    port.postMessage(payload);
    Atomics.store(signal, 0, 1);
    Atomics.notify(signal, 0);
  };
  // Content-Length rather than chunked: some servers (QLever) won't read a
  // chunked request body.
  const headers = Object.assign({}, req.headers);
  const payload = req.body === null || req.body === undefined ? null : Buffer.from(req.body, "utf8");
  if (payload) headers["Content-Length"] = payload.length;
  try {
    const r = lib.request(req.url, {method: req.method, headers}, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => done({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    r.on("error", e => done({status: 0, error: e.message, body: ""}));
    if (payload) r.write(payload);
    r.end();
  } catch (e) {
    done({status: 0, error: e.message, body: ""});
  }
});
`;

let bridge = null;

function getBridge () {
  if (bridge) return bridge;
  const {port1, port2} = new MessageChannel();
  const signal = new Int32Array(new SharedArrayBuffer(4));
  const worker = new Worker(WORKER_SRC, {
    eval: true,
    workerData: {port: port2, signal},
    transferList: [port2],
  });
  worker.unref();
  bridge = {
    worker,
    request (method, url, headers, body) {
      Atomics.store(signal, 0, 0);
      worker.postMessage({method, url, headers, body});
      // A spurious wake (`not-equal`) is possible if the worker won the race.
      while (Atomics.load(signal, 0) === 0)
        Atomics.wait(signal, 0, 0);
      const msg = receiveMessageOnPort(port1);
      if (!msg) throw Error("sync-fetch: worker signalled with no message");
      return msg.message;
    },
    close () {
      bridge = null;
      port1.close();
      return worker.terminate();
    },
  };
  return bridge;
}

/** Blocking HTTP request. Returns {status, headers, body}. */
function syncRequest (method, url, headers = {}, body = null) {
  return getBridge().request(method, url, headers, body);
}

function closeSyncFetch () {
  return bridge ? bridge.close() : Promise.resolve();
}

/** Minimal XMLHttpRequest good enough for ShExUtil.executeQuery. */
class SyncXMLHttpRequest {
  constructor () {
    this._headers = {};
    this.status = 0;
    this.responseText = "";
    this.readyState = 0;
  }
  open (method, url, async) {
    if (async === true)
      throw Error("this XMLHttpRequest shim is synchronous-only (pass async=false)");
    this._method = method;
    this._url = url;
    this.readyState = 1;
  }
  setRequestHeader (k, v) { this._headers[k] = v; }
  send (body) {
    const res = syncRequest(this._method, this._url, this._headers, body || null);
    this.status = res.status;
    this.responseText = res.body;
    this.readyState = 4;
    if (res.error)
      throw Error(`${this._method} ${this._url}: ${res.error}`);
    if (res.status >= 400)
      throw Error(`${this._method} <${decodeURIComponent(this._url)}> returned ${res.status}:\n${res.body}`);
  }
  getAllResponseHeaders () { return ""; }
}

let uninstall = null;

function installXhrShim () {
  if (uninstall) return uninstall;
  const had = "XMLHttpRequest" in globalThis;
  const old = globalThis.XMLHttpRequest;
  globalThis.XMLHttpRequest = SyncXMLHttpRequest;
  uninstall = () => {
    if (had) globalThis.XMLHttpRequest = old;
    else delete globalThis.XMLHttpRequest;
    uninstall = null;
  };
  return uninstall;
}

module.exports = {syncRequest, closeSyncFetch, installXhrShim, SyncXMLHttpRequest};
