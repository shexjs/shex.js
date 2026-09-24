#!/usr/bin/env node
// DEBUG ONLY (draft PR): instrument @codemirror/view's gutters to find who
// empties a GutterElement behind CodeMirror's back ("CodeMirror plugin
// crashed: ... reading 'nextSibling'" in GutterElement.setMarkers).
const Fs = require("fs");
const Path = require("path");
for (const which of ["index.js", "index.cjs"]) {
const file = Path.join(__dirname, "../../node_modules/@codemirror/view/dist", which);
let s = Fs.readFileSync(file, "utf8");
if (s.includes("GUTTER-DEBUG")) { console.log("already patched " + which); continue; }
function rep (a, b) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw Error(`expected one ${JSON.stringify(a)}, found ${n}`);
  s = s.replace(a, b);
}
const helper = `
// ---- GUTTER-DEBUG instrumentation ----
Error.stackTraceLimit = 200;
let __gdSeq = 0;
const __gdStack = () => new Error().stack.split("\\n").slice(2, 60).map(l => l.trim().replace(/https?:\\/\\/localhost:\\d+\\/shex.js\\/packages\\//, "")).join(" | ");
const __gdName = m => (m && m.constructor && m.constructor.name || "?") + (m && m.severity ? ":" + m.severity : "") + (m && m.toDOM ? "+dom" : "");
function __gdOwner (node) { return node && node.parentNode && node.parentNode.__gdElt; }
function __gdNote (node, what) {
  const owner = node && node.__gdElt ? node.__gdElt : __gdOwner(node);
  if (owner) (owner.__gdEvents || (owner.__gdEvents = [])).push(what + " @ " + __gdStack());
}
(function wrapDom () {
  const W = typeof window !== "undefined" ? window : globalThis;
  if (!W.Node || W.Node.prototype.__gdWrapped) return;
  const NP = W.Node.prototype, EP = W.Element.prototype;
  NP.__gdWrapped = true;
  const wrap = (proto, name, before) => { const orig = proto[name]; if (!orig) return;
    proto[name] = function (...args) { try { before.call(this, ...args); } catch (e) {} return orig.apply(this, args); }; };
  wrap(NP, "removeChild", function (child) { if (this.__gdElt) __gdNote(child, "removeChild(marker node) on elt#" + this.__gdElt.__gdId); if (child && child.__gdElt) __gdNote(child, "removeChild(elt#" + child.__gdElt.__gdId + " from its gutter)"); });
  wrap(EP, "remove", function () { if (this.__gdElt) __gdNote(this, "remove(elt#" + this.__gdElt.__gdId + ")"); else if (__gdOwner(this)) __gdNote(this, "remove(marker node of elt#" + __gdOwner(this).__gdId + ")"); });
  wrap(NP, "insertBefore", function (node) { if (__gdOwner(node) && node.parentNode !== this) __gdNote(node, "insertBefore MOVED a marker node out of elt#" + __gdOwner(node).__gdId); });
  wrap(NP, "appendChild", function (node) { if (__gdOwner(node) && node.parentNode !== this) __gdNote(node, "appendChild MOVED a marker node out of elt#" + __gdOwner(node).__gdId); });
  wrap(EP, "replaceChildren", function () { if (this.__gdElt) __gdNote(this, "replaceChildren on elt#" + this.__gdElt.__gdId); });
  for (const [proto, prop] of [[NP, "textContent"], [EP, "innerHTML"]]) {
    const d = Object.getOwnPropertyDescriptor(proto, prop); if (!d || !d.set) continue;
    Object.defineProperty(proto, prop, Object.assign({}, d, {set (v) { if (this.__gdElt) __gdNote(this, prop + "= on elt#" + this.__gdElt.__gdId); return d.set.call(this, v); }}));
  }
})();
// ---- end GUTTER-DEBUG ----
`;
// just before GutterElement, which is the first thing to use it
rep("class GutterElement {", helper + "class GutterElement {");

rep(`        this.dom.className = "cm-gutterElement";`,
    `        this.dom.className = "cm-gutterElement";
        this.__gdId = ++__gdSeq; this.dom.__gdElt = this; this.__gdEvents = ["created @ " + __gdStack()];`);
rep(`    setMarkers(view, markers) {
        let cls = "cm-gutterElement", domPos = this.dom.firstChild;`,
    `    setMarkers(view, markers) {
        const __want = this.markers.filter(m => m.toDOM).length;
        if (this.dom.childNodes.length < __want && !this.__gdLogged) {
            this.__gdLogged = true;
            console.error("GUTTER-DEBUG " + JSON.stringify({elt: this.__gdId, children: this.dom.childNodes.length, want: __want,
              parent: this.dom.parentNode ? this.dom.parentNode.className : null, connected: this.dom.isConnected,
              old: this.markers.map(__gdName), new: markers.map(__gdName), destroyed: !!this.__gdDestroyed,
              now: __gdStack(), events: (this.__gdEvents || []).slice(-12)}, null, 1));
        }
        let cls = "cm-gutterElement", domPos = this.dom.firstChild;`);
rep(`                    next.destroy(domPos);`,
    `                    if (!domPos) console.error("GUTTER-DEBUG null domPos in elt#" + this.__gdId);
                    next.destroy(domPos);`);
rep(`        this.setMarkers(null, []); // First argument not used unless creating markers`,
    `        this.__gdDestroyed = true; (this.__gdEvents || (this.__gdEvents = [])).push("destroy() @ " + __gdStack());
        this.setMarkers(null, []); // First argument not used unless creating markers`);
Fs.writeFileSync(file, s);
console.log("patched " + file);
}
