#!/usr/bin/env node
/** A REPL for the ShEx language server.
 *
 * Two things share one screen: a prompt at the bottom, and -- once a manifest
 * is loaded -- a two-pane menu of its schemas and their data above it.  ctrl-↑
 * / cmd-↑ moves focus to the menu, ctrl-↓ / cmd-↓ back to the prompt.
 *
 * You fill four slots -- `schema`, `data`, `node`, `shape` -- then `SEND` to
 * validate the node against the shape.  Picking a manifest entry (Enter in the
 * menu, or `pick <n>` at the prompt) fills all four at once.  The prompt shows
 * what is still empty.
 *
 *   > manifest examples/manifest.yaml   # then ctrl-↑ to browse, Enter to pick
 *   > schema examples/ClinObs.shex      # or fill slots by hand (a path or URL)
 *   > node <Obs1>
 *   > shape START
 *   > SEND
 *   > check schema                      # validate one document's format alone
 *
 * With no TTY it runs headless: it reads commands from stdin, one per line, and
 * prints results -- so a session can live in a piped script.
 */
"use strict";

const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const yaml = require("js-yaml");

const TTY = process.stdin.isTTY;
const SLOTS = ["schema", "data", "node", "shape"];

// ---------------------------------------------------------------- server

const built = path.join(__dirname, "..", "lib", "server.js");
const server = fs.existsSync(built)
  ? cp.spawn(process.execPath, [built, "--stdio"], { stdio: ["pipe", "pipe", "inherit"] })
  : cp.spawn("shex-language-server", ["--stdio"], { stdio: ["pipe", "pipe", "inherit"] });
server.on("error", e => { console.error("could not start the server:", e.message); process.exit(1); });

let rxbuf = Buffer.alloc(0);
const pending = new Map();
const diagnostics = new Map();
let nextId = 1;
server.stdout.on("data", d => {
  rxbuf = Buffer.concat([rxbuf, d]);
  let sep;
  while ((sep = rxbuf.indexOf("\r\n\r\n")) >= 0) {
    const len = +/Content-Length: (\d+)/i.exec(rxbuf.slice(0, sep))[1];
    if (rxbuf.length < sep + 4 + len) break;
    const msg = JSON.parse(rxbuf.slice(sep + 4, sep + 4 + len));
    rxbuf = rxbuf.slice(sep + 4 + len);
    if (msg.id != null && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    else if (msg.method === "textDocument/publishDiagnostics") diagnostics.set(msg.params.uri, msg.params.diagnostics);
  }
});
const rpcWrite = m => { const s = JSON.stringify(m); server.stdin.write(`Content-Length: ${Buffer.byteLength(s)}\r\n\r\n${s}`); };
const request = (method, params) => new Promise(res => { const id = nextId++; pending.set(id, res); rpcWrite({ jsonrpc: "2.0", id, method, params }); });
const notify = (method, params) => rpcWrite({ jsonrpc: "2.0", method, params });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- manifest

/** Read a manifest (the conventional shex.js form: an array of `schemaLabel` /
 * `schema`|`schemaURL` / `dataLabel` / `data`|`dataURL` / `queryMap` / `status`)
 * and resolve each entry to inline strings, splitting a simple `<node>@<shape>`
 * query map. `schemaURL`/`dataURL` are read relative to the manifest. */
function loadManifest (file) {
  const dir = path.dirname(file);
  const raw = yaml.load(fs.readFileSync(file, "utf8"));
  return (Array.isArray(raw) ? raw : []).map(e => {
    const qm = String(e.queryMap || "").trim();
    const m = /^\s*(\S+)\s*@\s*(\S+)\s*$/.exec(qm);
    return {
      schemaLabel: e.schemaLabel, dataLabel: e.dataLabel,
      schema: "schema" in e ? e.schema : readFiles(e.schemaURL, dir),
      data: "data" in e ? e.data : readFiles(e.dataURL, dir),
      queryMap: qm, node: m ? m[1] : null, shape: m ? m[2] : null,
      status: e.status, comment: e.comment, base: e.dataBase, neighborhood: e.neighborhood,
    };
  });
}
const readFiles = (url, dir) => url == null ? undefined
  : (Array.isArray(url) ? url : [url]).map(u => fs.readFileSync(path.resolve(dir, u), "utf8")).join("\n");

/** Resolved entries grouped by schemaLabel (in manifest order), each with its
 * unique dataLabels -- the two menu columns. */
function index (entries) {
  const schemas = [];
  const byLabel = new Map();
  for (const entry of entries) {
    const label = entry.schemaLabel || "(unlabeled schema)";
    if (!byLabel.has(label)) { byLabel.set(label, { label, data: [], seen: new Set() }); schemas.push(byLabel.get(label)); }
    const g = byLabel.get(label);
    const dl = entry.dataLabel || "(unlabeled data)";
    if (g.seen.has(dl)) continue;
    g.seen.add(dl);
    g.data.push({ label: dl, entry });
  }
  return schemas;
}

/** The head of some inline text, skipping PREFIX/BASE, elided to `max`. */
function preview (text, max) {
  if (typeof text !== "string") return null;
  const body = text.split("\n").filter(l => l.trim() && !/^\s*@?(PREFIX|BASE)\b/i.test(l)).join(" ").replace(/\s+/g, " ").trim();
  if (!body) return null;
  return body.length <= max ? body : body.slice(0, max - 1) + "…";
}

/** What the four slots hold now, for the on-screen block. */
function slotsReport (max) {
  return { schema: preview(slots.schema, max), data: preview(slots.data, max), node: slots.node || null, shape: slots.shape || null };
}

// ---------------------------------------------------------------- rendering

const ESC = "\x1b[";
const out = s => process.stdout.write(s);
const DIM = t => `${ESC}2m${t}${ESC}0m`;
const BOLD = t => `${ESC}1m${t}${ESC}0m`;
const HILITE = t => `${ESC}7m${t}${ESC}0m`;
const PICKED = t => `${ESC}1;36m${t}${ESC}0m`;
const OK = t => `${ESC}32m${t}${ESC}0m`;
const ERR = t => `${ESC}31m${t}${ESC}0m`;

const COL1 = 2, TOP = 3, BLOCK = 8, BLANK = 2, PROMPT = "> ";

function layout () {
  const cols = process.stdout.columns || 80, rows = process.stdout.rows || 24;
  const colw = Math.max(10, Math.min(30, Math.floor((cols - COL1 - 6) / 2)));
  const promptRow = rows - 1;
  const blockTop = Math.max(TOP + 2, promptRow - BLANK - BLOCK);
  return { cols, rows, colw, col1: COL1, col2: COL1 + colw + 4, promptRow, blockTop,
           height: Math.max(1, blockTop - 1 - TOP),
           previewMax: Math.max(8, cols - COL1 - 2 - '"schema": "'.length - 2) };
}
function pad (s, w) { const t = s.length > w ? s.slice(0, w - 1) + "…" : s; return t + " ".repeat(w - t.length); }
function moveTo (row, col) { out(`${ESC}${row + 1};${col + 1}H`); }
function windowFor (count, cursor, offset, height) {
  if (count <= height) return 0;
  if (cursor < offset) return cursor;
  if (cursor >= offset + height) return cursor - height + 1;
  return Math.min(offset, count - height);
}

/** ↑/↓ carrying any non-shift modifier: ctrl-arrow, or a terminal's cmd-arrow. */
function isFocusKey (key) {
  if (key.name !== "up" && key.name !== "down") return false;
  if (key.ctrl || key.meta) return true;
  const seq = key.sequence || "";
  if (seq.startsWith("\x1b\x1b")) return true;
  const m = /^\x1b\[1;(\d+)[AB]$/.exec(seq);
  return !!m && +m[1] >= 3;
}

// ---------------------------------------------------------------- state

const slots = { schema: "", data: "", node: "", shape: "" };
const missing = () => SLOTS.filter(s => !slots[s]);

const state = {
  file: null, schemas: [], focus: "prompt", pane: "schema",
  schemaCursor: 0, schemaOffset: 0, dataCursor: 0, dataOffset: 0, picked: null,
  showSlots: false,                       // block shows the slots (vs a message)
  line: "", caret: 0, history: [], histIndex: 0, draft: "", message: null,
  section: null,                          // headless multi-line collection
};
const loaded = () => state.schemas.length > 0;

// ---------------------------------------------------------------- slots

function setManifest (file) {
  const f = fs.existsSync(file) ? file : path.join(__dirname, file);
  const schemas = index(loadManifest(f));
  if (!schemas.length) throw new Error(`${file}: no entries`);
  state.file = f; state.schemas = schemas; state.pane = "schema";
  state.schemaCursor = state.schemaOffset = state.dataCursor = state.dataOffset = 0;
  state.picked = null;
  return schemas;
}
function unloadManifest () {
  state.file = null; state.schemas = []; state.focus = "prompt"; state.pane = "schema"; state.picked = null;
}

/** Fill all four slots from a manifest entry -- the merge with menu.js, which
 * only reported it. */
function applyEntry (entry) {
  slots.schema = entry.schema || ""; slots.data = entry.data || "";
  slots.node = entry.node || ""; slots.shape = entry.shape || "";
  state.message = null; state.showSlots = true; state.section = null;
  const tail = missing().length ? " (" + missing().join(", ") + " still empty)" : "; ready — SEND";
  const note = entry.neighborhood ? [`note: "${entry.dataLabel}" needs a ${entry.neighborhood} source (network); SEND can't run it here.`] : [];
  present([`loaded "${entry.schemaLabel} / ${entry.dataLabel}"${tail}`, ...note]);
}

/** Set a schema/data slot from a path, a URL, or inline text. */
async function fill (slot, arg) {
  if (!arg) {
    if (TTY) return present([`${slot}: give a path or URL, or "pick"/"browse" a manifest`], true);
    state.section = slot; slots[slot] = ""; return;      // headless: collect lines
  }
  state.section = null; state.showSlots = true; state.message = null;
  if (/^https?:\/\//.test(arg)) {
    try { slots[slot] = await (await fetch(arg)).text(); present([`${slot} <- ${arg}`]); }
    catch (e) { present([`could not fetch ${arg}: ${e.message}`], true); }
  } else if (fs.existsSync(arg)) { slots[slot] = fs.readFileSync(arg, "utf8"); present([`${slot} <- ${arg}`]); }
  else { slots[slot] = arg; }                            // a short inline value
}

// ---------------------------------------------------------------- validate

async function send () {
  const gaps = missing();
  if (gaps.length) return present([`still missing: ${gaps.join(", ")}`], true);
  const res = await request("workspace/executeCommand", {
    command: "shex.validate", arguments: [slots.schema, slots.data, `${slots.node}@${slots.shape}`],
  });
  const r = res.result || {};
  if (headless) return void console.log(JSON.stringify(r, null, 2));
  const first = (r.results && r.results[0]) || {};
  const lines = [ (first.status === "conformant" ? OK(BOLD("conformant")) : ERR(BOLD(first.status || "error"))) ];
  if (r.errors) lines.push(...r.errors);
  present(lines);
}

async function check (which) {
  const text = slots[which];
  if (!text) return present([`no ${which} to check`], true);
  const uri = `inmemory://${which}/${nextId}`;
  notify("textDocument/didOpen", { textDocument: { uri, languageId: which === "data" ? "turtle" : "shexc", version: 1, text } });
  for (let i = 0; i < 100 && !diagnostics.has(uri); ++i) await sleep(10);
  const ds = diagnostics.get(uri) || [];
  notify("textDocument/didClose", { textDocument: { uri } });
  if (headless) return void console.log(ds.length ? JSON.stringify(ds, null, 2) : `${which}: ok`);
  present(ds.length ? [ERR(`${which}: ${ds.length} problem(s)`), ...ds.slice(0, BLOCK - 2).map(d => `  ${d.range.start.line + 1}:${d.range.start.character} ${d.message}`)] : [OK(`${which}: ok`)]);
}

// ---------------------------------------------------------------- output

/** In the UI, output is a transient block message; headless, it is stdout. */
function present (lines, error) {
  if (headless) { for (const l of lines) console.log(strip(l)); return; }
  state.message = { lines, error }; state.showSlots = false;
}
const strip = s => s.replace(/\x1b\[[0-9;]*m/g, "");

// ---------------------------------------------------------------- commands

const COMMANDS = [
  { name: "help", usage: "help", blurb: "this text" },
  { name: "manifest", usage: "manifest <path>", blurb: "load a YAML/JSON manifest", arg: "path" },
  { name: "unload", usage: "unload manifest", blurb: "forget the manifest", arg: "manifest" },
  { name: "schema", usage: "schema [path|url]", blurb: "set the schema slot", arg: "path" },
  { name: "data", usage: "data [path|url]", blurb: "set the data slot", arg: "path" },
  { name: "node", usage: "node <iri>", blurb: "set the focus node" },
  { name: "shape", usage: "shape <label|START>", blurb: "set the shape" },
  { name: "map", usage: "map <node>@<shape>", blurb: "set node and shape" },
  { name: "check", usage: "check [schema|data]", blurb: "validate one document's format" },
  { name: "send", usage: "SEND", blurb: "validate node against shape" },
  { name: "list", usage: "list", blurb: "list manifest entries" },
  { name: "pick", usage: "pick <n>", blurb: "load manifest entry n into the slots" },
  { name: "show", usage: "show", blurb: "show the four slots" },
  { name: "reset", usage: "reset", blurb: "clear the four slots" },
  { name: "quit", usage: "quit", blurb: "leave (exit, ctrl-c)" },
  { name: "exit", usage: "exit", blurb: null },
];
const HELP = [
  ...COMMANDS.filter(c => c.blurb).map(c => c.usage.padEnd(22) + c.blurb),
  "tab  complete a command or path · ↑↓  history",
  "ctrl-↑ / cmd-↑ (and ↓)  move focus between the menu and this prompt",
  "in the menu: ↑↓/jk move · ↵/space select · ←/h back · q quit",
];

async function run (input) {
  const text = input.trim();
  if (!text) return;
  if (state.section && !/^(schema|data|node|shape|map|check|send|manifest|unload|list|pick|show|reset|help|quit|exit|browse)\b/i.test(text)) {
    slots[state.section] += (slots[state.section] ? "\n" : "") + input; return;   // headless multi-line
  }
  if (TTY) { state.history.push(text); state.histIndex = state.history.length; }
  const [cmd] = text.split(/\s+/);
  const arg = text.slice(cmd.length).trim();
  switch (cmd.toLowerCase()) {
    case "help": present(HELP); break;
    case "quit": case "exit": return quit();
    case "manifest":
      try { const s = setManifest(arg || "manifest.yaml"); const n = s.reduce((a, x) => a + x.data.length, 0);
            present([`loaded ${s.length} schema(s), ${n} data from ${path.relative(process.cwd(), state.file) || state.file}`, TTY ? "ctrl-↑ to browse" : 'use "list" and "pick <n>"']); }
      catch (e) { present([`manifest: ${e.message}`], true); }
      break;
    case "unload":
      if (!loaded()) return present(["no manifest is loaded"], true);
      present([`unloaded ${path.basename(state.file)}`]); unloadManifest(); break;
    case "list":
      if (!loaded()) return present(['no manifest; "manifest <path>" first'], true);
      present(state.schemas.flatMap((s, si) => s.data.map((d, di) => `  ${lin(si, di)}  ${s.label} / ${d.label}  [${d.entry.status}]`)));
      break;
    case "pick": { const e = entryAt(arg); if (e) applyEntry(e); break; }
    case "schema": await fill("schema", arg); break;
    case "data": await fill("data", arg); break;
    case "node": if (arg) { slots.node = arg; state.showSlots = true; state.section = null; } else if (!TTY) { state.section = "node"; slots.node = ""; } break;
    case "shape": if (arg) { slots.shape = arg; state.showSlots = true; state.section = null; } else if (!TTY) { state.section = "shape"; slots.shape = ""; } break;
    case "map": { const m = /^(\S+)\s*@\s*(\S+)$/.exec(arg); if (m) { slots.node = m[1]; slots.shape = m[2]; state.showSlots = true; state.section = null; } else present(["map wants <node>@<shape>"], true); break; }
    case "check": await check(/data/i.test(arg) ? "data" : "schema"); break;
    case "send": await send(); break;
    case "show": present(SLOTS.map(s => `${s}: ${slots[s] ? preview(slots[s], 60) || slots[s] : "(empty)"}`)); break;
    case "reset": for (const s of SLOTS) slots[s] = ""; state.showSlots = false; state.section = null; present(["cleared"]); break;
    case "browse": if (TTY && loaded()) state.focus = "menu"; else present([TTY ? 'load a manifest first' : "browse needs a terminal"], true); break;
    default: present([`${cmd}: unknown — try "help"`], true);
  }
}

// flat manifest numbering that `list`/`pick` share
function lin (si, di) { let n = 0; for (let i = 0; i < si; ++i) n += state.schemas[i].data.length; return String(n + di).padStart(2); }
function entryAt (arg) {
  if (!loaded()) { present(['no manifest; "manifest <path>" first'], true); return null; }
  let n = +arg;
  for (const s of state.schemas) { if (n < s.data.length) return s.data[n].entry; n -= s.data.length; }
  present([`no entry ${arg}`], true); return null;
}

// ---------------------------------------------------------------- drawing

function draw () {
  if (headless) return;
  const L = layout();
  out(`${ESC}2J${ESC}H`);
  moveTo(0, L.col1);
  out(BOLD(state.file ? path.basename(state.file) : "(no manifest)") + "   " + DIM(SLOTS.map(s => slots[s] ? PICKED("✓" + s) : s).join(" ")));
  moveTo(1, L.col1);
  out(DIM(loaded()
    ? (state.focus === "menu" ? "↑↓ move · ↵/space select · ←back · ctrl-↓ prompt · q" : "ctrl-↑ menu · type help · SEND to validate")
    : 'type "help", or "manifest <path>" to load one'));
  if (loaded()) {
    drawColumn(L, L.col1, "schema", state.schemas.map(s => s.label), state.schemaCursor, state.schemaOffset, state.focus === "menu" && state.pane === "schema", state.picked);
    if (state.picked !== null)
      drawColumn(L, L.col2, "data", state.schemas[state.picked].data.map(d => `${d.label} [${d.entry.status}]`), state.dataCursor, state.dataOffset, state.focus === "menu" && state.pane === "data", null);
  }
  drawBlock(L); drawPrompt(L);
}
function drawColumn (L, col, title, labels, cursor, offset, active, picked) {
  moveTo(TOP - 1, col); out(DIM(pad(title, L.colw)));
  const view = labels.slice(offset, offset + L.height);
  for (let i = 0; i < L.height; i++) {
    const idx = offset + i; moveTo(TOP + i, col);
    if (i >= view.length) { out(" ".repeat(L.colw + 2)); continue; }
    const marker = idx === cursor && active ? "❯ " : "  ";
    let t = pad(view[i], L.colw); if (idx === picked) t = PICKED(t);
    out(marker + (idx === cursor && active ? HILITE(t) : t));
  }
  moveTo(TOP - 1, col + L.colw - 1); out(offset > 0 ? DIM("▴") : " ");
  moveTo(TOP + L.height, col + L.colw + 1); out(offset + L.height < labels.length ? DIM("▾") : " ");
}
function drawBlock (L) {
  let row = L.blockTop; const room = Math.max(8, L.cols - L.col1 - 1);
  const write = (t, n, raw) => { if (n >= BLOCK) return; moveTo(row + n, L.col1); out(raw ? t : (strip(t).length > room ? t.slice(0, room - 1) + "…" : t)); };
  if (state.message) { const paint = state.message.error ? ERR : (t => t); state.message.lines.forEach((l, i) => write(strip(l).length > room && !/\x1b/.test(l) ? paint(l.slice(0, room - 1) + "…") : (state.message.error ? ERR(strip(l)) : l), i, true)); }
  else if (state.showSlots && SLOTS.some(s => slots[s])) { write(BOLD("slots"), 0, true); JSON.stringify(slotsReport(L.previewMax), null, 2).split("\n").forEach((l, i) => write(l, i + 1)); }
}
function drawPrompt (L) {
  moveTo(L.promptRow, 0); out(" ".repeat(Math.max(0, L.cols - 1)));
  moveTo(L.promptRow, L.col1);
  const width = Math.max(8, L.cols - L.col1 - PROMPT.length - 1);
  const start = Math.max(0, state.caret - width + 1);
  out(DIM(PROMPT) + state.line.slice(start, start + width));
  if (state.focus === "prompt") { moveTo(L.promptRow, L.col1 + PROMPT.length + (state.caret - start)); out(`${ESC}?25h`); } else out(`${ESC}?25l`);
}

// ---------------------------------------------------------------- keys

function move (delta) {
  const L = layout();
  if (state.pane === "schema") { const n = state.schemas.length; state.schemaCursor = (state.schemaCursor + delta + n) % n; state.schemaOffset = windowFor(n, state.schemaCursor, state.schemaOffset, L.height); }
  else { const n = state.schemas[state.picked].data.length; state.dataCursor = (state.dataCursor + delta + n) % n; state.dataOffset = windowFor(n, state.dataCursor, state.dataOffset, L.height); }
}
function select () {
  if (state.pane === "schema") { state.picked = state.schemaCursor; state.pane = "data"; state.dataCursor = state.dataOffset = 0; }
  else applyEntry(state.schemas[state.picked].data[state.dataCursor].entry);
}
function back () { if (state.pane === "data") { state.pane = "schema"; state.picked = null; } }

function recall (delta) {
  const next = state.histIndex + delta;
  if (next < 0 || next > state.history.length) return;
  if (state.histIndex === state.history.length) state.draft = state.line;
  state.histIndex = next; state.line = next === state.history.length ? state.draft : state.history[next]; state.caret = state.line.length;
}
function commonPrefix (words) { if (!words.length) return ""; let p = words[0]; for (const w of words.slice(1)) { let i = 0; while (i < p.length && i < w.length && p[i] === w[i]) i++; p = p.slice(0, i); } return p; }
function pathCandidates (frag) {
  const dir = frag.endsWith("/") ? frag : path.dirname(frag);
  const base = frag.endsWith("/") ? "" : path.basename(frag);
  const here = dir === "." && !frag.startsWith("./") ? "" : (dir.endsWith("/") ? dir : dir + "/");
  let names; try { names = fs.readdirSync(dir || "."); } catch { return []; }
  return names.filter(n => n.startsWith(base) && (base.startsWith(".") || !n.startsWith("."))).map(n => { let f = here + n; try { if (fs.statSync(f).isDirectory()) f += "/"; } catch {} return f; }).sort();
}
function complete () {
  const head = state.line.slice(0, state.caret), tail = state.line.slice(state.caret);
  const [, lead, word, gap, rest] = /^(\s*)(\S*)(\s+)?(.*)$/.exec(head);
  let frag, candidates, suffix = "";
  if (!gap) { frag = word; candidates = COMMANDS.map(c => c.name).filter(n => n.startsWith(word)); suffix = " "; }
  else { const c = COMMANDS.find(x => x.name === word); if (!c || !c.arg) return; frag = rest; candidates = c.name === "unload" ? ["manifest"].filter(n => n.startsWith(rest)) : pathCandidates(rest); }
  if (!candidates.length) return;
  const filled = candidates.length === 1 ? candidates[0] + (candidates[0].endsWith("/") ? "" : suffix) : commonPrefix(candidates);
  state.message = candidates.length > 1 ? { lines: [DIM(`${candidates.length} completions`), ...candidates.slice(0, BLOCK - 2)] } : null;
  if (candidates.length > 1) state.showSlots = false;
  if (filled.length >= frag.length) { const before = lead + (gap ? word + gap : ""); state.line = before + filled + tail; state.caret = before.length + filled.length; }
}
async function promptKey (str, key) {
  switch (key.name) {
    case "tab": complete(); return true;
    case "up": recall(-1); return true;
    case "down": recall(1); return true;
    case "left": state.caret = Math.max(0, state.caret - 1); return true;
    case "right": state.caret = Math.min(state.line.length, state.caret + 1); return true;
    case "home": state.caret = 0; return true;
    case "end": state.caret = state.line.length; return true;
    case "backspace": if (state.caret > 0) { state.line = state.line.slice(0, state.caret - 1) + state.line.slice(state.caret); state.caret--; } return true;
    case "delete": state.line = state.line.slice(0, state.caret) + state.line.slice(state.caret + 1); return true;
    case "return": { const line = state.line; state.line = ""; state.caret = 0; await run(line); return true; }
  }
  if (key.ctrl) {
    switch (key.name) {
      case "a": state.caret = 0; return true;
      case "e": state.caret = state.line.length; return true;
      case "u": state.line = state.line.slice(state.caret); state.caret = 0; return true;
      case "k": state.line = state.line.slice(0, state.caret); return true;
      case "w": { const h = state.line.slice(0, state.caret).replace(/\S+\s*$/, ""); state.line = h + state.line.slice(state.caret); state.caret = h.length; return true; }
    }
    return false;
  }
  if (!key.meta && str && str.length === 1 && str >= " " && str !== "\x7f") { state.line = state.line.slice(0, state.caret) + str + state.line.slice(state.caret); state.caret += str.length; state.histIndex = state.history.length; return true; }
  return false;
}

// ---------------------------------------------------------------- go

let headless = !TTY;

function quit (code = 0) {
  if (TTY) { out(`${ESC}?25h`); try { process.stdin.setRawMode(false); } catch {} out("\n"); }
  server.kill();
  process.exit(code);
}

async function main () {
  await request("initialize", { processId: process.pid, rootUri: null, capabilities: {} });
  notify("initialized", {});

  if (headless) {                                        // piped script: line REPL, no UI
    const rl = readline.createInterface({ input: process.stdin, output: null });
    let chain = Promise.resolve();
    rl.on("line", line => { chain = chain.then(() => run(line)); });
    rl.on("close", () => chain.then(() => server.kill()).then(() => process.exit(0)));
    return;
  }

  if (process.argv[2]) { state.line = `manifest ${process.argv[2]}`; state.caret = state.line.length; }
  state.message = { lines: ['no manifest loaded — "manifest <path>" to load one, or "help"'] };
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  draw();
  process.stdout.on("resize", draw);

  let chain = Promise.resolve();
  process.stdin.on("keypress", (str, key) => {
    if (!key) return;
    chain = chain.then(async () => {
      if (key.ctrl && key.name === "c") return quit(130);
      if (isFocusKey(key)) { if (key.name === "up") { if (loaded()) state.focus = "menu"; } else state.focus = "prompt"; return draw(); }
      if (state.focus === "prompt") { if (await promptKey(str, key)) draw(); return; }
      switch (key.name) {
        case "q": case "escape": return quit();
        case "up": case "k": move(-1); break;
        case "down": case "j": move(1); break;
        case "left": case "h": back(); break;
        case "right": case "l": if (state.pane === "schema") select(); break;
        case "return": case "space": select(); break;
        default: return;
      }
      draw();
    });
  });
  process.on("SIGINT", () => quit(130));
}
main();
