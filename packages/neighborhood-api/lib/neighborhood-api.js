"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Start = void 0;
exports.claimPane = claimPane;
exports.paramsToCommandLineArgs = paramsToCommandLineArgs;
exports.sparqlOrder = sparqlOrder;
exports.Start = { term: "START" };
/** The module whose claimPaneText answers to this text, and the parameters
 * it read out of it.  The modules are tried in order, so a host lists its
 * catch-all (rdfjs) last. */
function claimPane(modules, text) {
    for (const module of modules) {
        const params = module.claimPaneText ? module.claimPaneText(text) : null;
        if (params !== null)
            return { module, params };
    }
    return null;
}
/** Translate DbParamSpecs into command-line-args option definitions.
 *
 * This function is also the measurement the two vocabularies were compared
 * by.  What survives the round trip: names, descriptions, the four scalar
 * types, arrays (`multiple`), defaults, enums (demoted to a typeLabel).
 * What OpenAPI can say that command-line-args cannot: `format`,
 * `items.contentMediaType` (both demoted to help text), `required` (CLA has
 * no mandatory options -- the host must enforce it), and nested objects
 * (not offered in DbParamSchema for exactly that reason).  What
 * command-line-args can say that OpenAPI cannot: `alias`, `defaultOption`,
 * `lazyMultiple`, `group` -- which is why DbParamSpec carries a `cli` hint
 * rather than pretending OpenAPI covers a command line.
 */
function paramsToCommandLineArgs(specs) {
    return specs.map(spec => {
        var _a, _b, _c, _d, _e;
        const scalar = spec.schema.type === "array" ? (((_a = spec.schema.items) === null || _a === void 0 ? void 0 : _a.type) || "string") : spec.schema.type;
        const def = {
            name: ((_b = spec.cli) === null || _b === void 0 ? void 0 : _b.option) || spec.name,
            type: scalar === "boolean" ? Boolean : scalar === "number" || scalar === "integer" ? Number : String,
        };
        if ((_c = spec.cli) === null || _c === void 0 ? void 0 : _c.alias)
            def.alias = spec.cli.alias;
        if (spec.schema.type === "array")
            def.multiple = true;
        if (spec.schema.default !== undefined)
            def.defaultValue = spec.schema.default;
        if (spec.description)
            def.description = spec.description;
        def.typeLabel = ((_d = spec.cli) === null || _d === void 0 ? void 0 : _d.typeLabel)
            || (spec.schema.enum ? spec.schema.enum.join("|") : undefined)
            || (spec.schema.type === "array" ? (_e = spec.schema.items) === null || _e === void 0 ? void 0 : _e.format : spec.schema.format);
        if (def.typeLabel === undefined)
            delete def.typeLabel;
        return def;
    });
}
/* sparqlOrder - sort triples by subject following SPARQL partial ordering.
 */
function sparqlOrder(l, r) {
    const [lprec, rprec] = [prec(l), prec(r)];
    return lprec === rprec ? l.value.localeCompare(r.value) : lprec - rprec;
}
const termType2Prec = {
    'BlankNode': 1,
    'Literal': 2,
    'NamedNode': 3,
};
function prec(t) {
    let typeLabel = t.termType;
    if (typeLabel === 'Quad' || typeLabel === 'Variable' || typeLabel === 'DefaultGraph')
        throw Error(`no defined SPARQL order for ${typeLabel} ${t.value}`);
    return termType2Prec[typeLabel];
}
