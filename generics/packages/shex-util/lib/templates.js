"use strict";
/** Template expansion for the ShExC template strawman (doc/templates.md).
 *
 * A schema may carry `templates` (TemplateDecls) and, inside them,
 * `ParamRef`s; anywhere a shape reference may appear, a `TemplateApp` names
 * a template and its arguments.  Expansion monomorphizes: each distinct
 * (template, arguments) pair becomes one plain ShapeDecl, applications
 * become references to it, and the result is ShEx 2.1 ShExJ that any
 * validator takes unchanged.
 *
 * Recursion terminates the way recursive shapes always have: an
 * instantiation is registered under its label *before* its body is
 * rewritten, so a self-application with the same arguments resolves to the
 * label being built (the equirecursive knot).  A template whose recursion
 * *grows* its arguments (polymorphic recursion) would mint instances
 * forever; `maxInstances` (default 100 per template) turns that into an
 * error carrying the instantiation trace.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateExpansionError = void 0;
exports.expandTemplates = expandTemplates;
class TemplateExpansionError extends Error {
    constructor(message, trace) {
        super(message + (trace.length
            ? "\n  while instantiating\n" + trace.map(t => "    " + t).join("\n")
            : ""));
        this.trace = trace;
    }
}
exports.TemplateExpansionError = TemplateExpansionError;
const HAS = Object.prototype.hasOwnProperty;
function stableStringify(o) {
    if (o === null || typeof o !== "object")
        return JSON.stringify(o);
    if (Array.isArray(o))
        return "[" + o.map(stableStringify).join(",") + "]";
    return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + stableStringify(o[k])).join(",") + "}";
}
function deepCopy(o) {
    return o === null || typeof o !== "object" ? o : JSON.parse(JSON.stringify(o));
}
/** how an argument reads in a memo key, a mangled label or a trace */
function canonArg(arg) {
    return typeof arg === "string" ? "@" + arg : stableStringify(arg);
}
/** deterministic label for an unnamed instantiation: template(arg,arg).
 * encodeURIComponent leaves only IRI-legal characters, so the label is a
 * (strange but well-formed) IRI any implementation derives identically. */
function mangle(templateId, args) {
    return templateId + "(" + args.map(a => encodeURIComponent(canonArg(a))).join(",") + ")";
}
function appTrace(templateId, args) {
    return templateId + "<<" + args.map(canonArg).join(", ") + ">>";
}
function containsParamRef(o) {
    if (o === null || typeof o !== "object")
        return false;
    if (o.type === "ParamRef")
        return true;
    return Object.values(o).some(containsParamRef);
}
/** Expand every template in `schema`, returning a new plain-ShExJ schema.
 * A schema with no `templates` member and no applications is returned as-is.
 */
function expandTemplates(schema, opts = {}) {
    if (!schema)
        return schema;
    const maxInstances = opts.maxInstances || 100;
    // no `templates` member still walks: a stray application or parameter
    // reference should say what's wrong here, not surprise the validator
    const templates = new Map((schema.templates || []).map(t => [t.id, t]));
    const kinds = new Map(); // per template, inferred+declared param kinds
    const instances = new Map(); // canon key -> instance label
    const named = new Map(); // canon key -> decl label (pass 0)
    const counts = new Map(); // template -> #instantiations
    const emitted = [];
    const placed = new Set(); // instance labels already in an output slot
    // ── parameter kinds: declared, else inferred from use positions ──────────
    function kindsOf(tpl, trace) {
        let m = kinds.get(tpl.id);
        if (m)
            return m;
        m = new Map();
        for (const p of tpl.params) {
            if (p.kind === "iri")
                m.set(p.name, "iri");
        }
        const seen = new Map();
        (function scan(o, pos) {
            if (o === null || typeof o !== "object")
                return;
            if (Array.isArray(o)) {
                o.forEach(e => scan(e, pos));
                return;
            }
            if (o.type === "ParamRef") {
                const before = seen.get(o.name);
                if (before && before !== pos)
                    throw new TemplateExpansionError("parameter ?" + o.name + " of " + tpl.id + " is used both as an IRI and as a shape expression; declare its kind", trace);
                seen.set(o.name, pos);
                return;
            }
            if (o.type === "TemplateApp") {
                // a parameter passed whole as an argument takes the kind the applied
                // template gives it; but a use *inside* a structured argument is a
                // use in this body
                for (const a of o.args)
                    if (!(a && a.type === "ParamRef"))
                        scan(a, "shapeExpr");
                return;
            }
            for (const [k, v] of Object.entries(o))
                scan(v, k === "predicate" || k === "extra" ? "iri" : "shapeExpr");
        })(tpl.shapeExpr, "shapeExpr");
        for (const p of tpl.params) {
            const inferred = seen.get(p.name);
            if (!m.has(p.name))
                m.set(p.name, inferred === "iri" ? "iri" : "shapeExpr");
        }
        kinds.set(tpl.id, m);
        return m;
    }
    function argAsIri(arg, paramName, templateId, trace) {
        if (typeof arg === "string")
            return arg;
        if (arg && arg.type === "NodeConstraint" && typeof arg.datatype === "string"
            && Object.keys(arg).length === 2) // a bare IRI written as an argument parses as a datatype constraint
            return arg.datatype;
        throw new TemplateExpansionError("parameter ?" + paramName + " of " + templateId + " wants an IRI; got " + canonArg(arg), trace);
    }
    // nominal bound: the argument names a declaration that (transitively) EXTENDS the bound
    function checkBound(arg, param, tpl, trace) {
        if (!param.extends)
            return;
        if (typeof arg !== "string")
            throw new TemplateExpansionError("parameter ?" + param.name + " of " + tpl.id + " is bounded by EXTENDS <" + param.extends + ">, so its argument must be a shape reference; got " + canonArg(arg), trace);
        const seen = new Set();
        const walk = (label) => {
            if (label === param.extends)
                return true;
            if (seen.has(label))
                return false;
            seen.add(label);
            const decl = (schema.shapes || []).find((d) => d.id === label);
            const ext = decl && decl.shapeExpr && decl.shapeExpr.extends || [];
            return ext.some((e) => typeof e === "string" && walk(e));
        };
        if (!walk(arg))
            throw new TemplateExpansionError("argument @" + arg + " for ?" + param.name + " of " + tpl.id + " does not EXTENDS <" + param.extends + ">", trace);
    }
    function instantiate(templateId, rawArgs, env, trace) {
        const tpl = templates.get(templateId);
        if (!tpl)
            throw new TemplateExpansionError("no template named <" + templateId + ">", trace);
        // a parameter passed whole as an argument passes its value through
        // untouched (whatever its kind); everything else resolves in this scope
        const args = rawArgs.map(a => {
            if (a && a.type === "ParamRef") {
                const bound = env && env.get(a.name);
                if (!bound)
                    throw new TemplateExpansionError("?" + a.name + " is not a parameter here", trace);
                return bound.value;
            }
            return rewrite(a, env, trace, "shapeExpr");
        });
        if (args.length !== tpl.params.length)
            throw new TemplateExpansionError(tpl.id + " takes " + tpl.params.length + " parameter(s) (" + tpl.params.map(p => "?" + p.name).join(", ") + "); got " + args.length, trace);
        const key = templateId + " " + args.map(canonArg).join(" ");
        const known = instances.get(key);
        if (known !== undefined)
            return known;
        const here = trace.concat([appTrace(templateId, args)]);
        const kindMap = kindsOf(tpl, here);
        const newEnv = new Map();
        tpl.params.forEach((p, i) => {
            checkBound(args[i], p, tpl, here);
            newEnv.set(p.name, { param: p, kind: kindMap.get(p.name), value: args[i] });
        });
        const count = (counts.get(templateId) || 0) + 1;
        counts.set(templateId, count);
        if (count > maxInstances)
            throw new TemplateExpansionError(templateId + " exceeded " + maxInstances + " instantiations — does its recursion grow its arguments?", here);
        const label = named.get(key) || mangle(templateId, args);
        instances.set(key, label); // registered before the body, so recursion ties the knot
        const slot = emitted.length;
        emitted.push({ label, decl: null });
        emitted[slot].decl = { id: label, type: "ShapeDecl",
            shapeExpr: rewrite(tpl.shapeExpr, newEnv, here, "shapeExpr") };
        return label;
    }
    function rewrite(o, env, trace, pos) {
        if (o === null || typeof o !== "object")
            return o;
        if (Array.isArray(o))
            return o.map(e => rewrite(e, env, trace, pos));
        if (o.type === "ParamRef") {
            const bound = env && env.get(o.name);
            if (!bound)
                throw new TemplateExpansionError("?" + o.name + " is not a parameter here", trace);
            if (pos === "iri")
                return argAsIri(bound.value, o.name, "this template", trace);
            if (bound.kind === "iri")
                throw new TemplateExpansionError("IRI parameter ?" + o.name + " used as a shape expression", trace);
            return deepCopy(bound.value);
        }
        if (o.type === "TemplateApp")
            return instantiate(o.template, o.args, env, trace);
        const out = {};
        for (const [k, v] of Object.entries(o)) {
            const childPos = k === "predicate" || k === "extra" ? "iri" : "shapeExpr";
            out[k] = rewrite(v, env, trace, childPos);
        }
        return out;
    }
    // ── pass 0: a declaration whose body is a ground application names it ────
    for (const decl of schema.shapes || []) {
        const se = decl.shapeExpr;
        if (se && se.type === "TemplateApp" && !containsParamRef(se.args) && !named.has(canonKeyOf(se)))
            named.set(canonKeyOf(se), decl.id);
    }
    function canonKeyOf(app) {
        return app.template + " " + app.args.map(canonArg).join(" ");
    }
    // ── main pass ────────────────────────────────────────────────────────────
    const outShapes = [];
    for (const decl of schema.shapes || []) {
        const se = decl.shapeExpr;
        if (se && se.type === "TemplateApp") {
            const label = instantiate(se.template, se.args, null, []);
            if (label === decl.id) {
                const inst = emitted.find(e => e.label === label);
                placed.add(label);
                outShapes.push(inst.decl);
            }
            else {
                // this instantiation is owned elsewhere; keep the name as an alias
                outShapes.push({ id: decl.id, type: "ShapeDecl", shapeExpr: label });
            }
        }
        else {
            outShapes.push(Object.assign({}, decl, { shapeExpr: rewrite(decl.shapeExpr, null, [], "shapeExpr") }));
        }
    }
    for (const e of emitted)
        if (!placed.has(e.label)) {
            placed.add(e.label);
            outShapes.push(e.decl);
        }
    const out = {};
    for (const [k, v] of Object.entries(schema)) {
        if (k === "templates" || k[0] === "_")
            continue; // _index & friends describe the unexpanded schema
        if (k === "shapes")
            out.shapes = outShapes;
        else if (k === "start")
            out.start = rewrite(v, null, [], "shapeExpr");
        else
            out[k] = v;
    }
    if (!HAS.call(out, "shapes") && outShapes.length)
        out.shapes = outShapes;
    return out;
}
//# sourceMappingURL=templates.js.map