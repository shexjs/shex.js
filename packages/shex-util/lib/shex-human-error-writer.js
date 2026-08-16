"use strict";
/** ShExHumanErrorWriter - render validation failures as indented
 * human-readable text.
 *
 * The sentences come from ./error-messages.ts, which editor-services uses
 * too; what is left here is the *shape* of a report -- what nests under
 * what, and where the connectives go.  See doc/error-reporting.md.
 */
const error_messages_1 = require("./error-messages");
const XSD = {};
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI", "string"].forEach(p => {
    XSD[p] = XSD._namespace + p;
});
class ShExHumanErrorWriter {
    constructor() {
        this.prefixes = {};
        /** the schema's BASE, so a shape it declares reads as it is written */
        this.base = undefined;
    }
    /** nested errors, each indented under what they explain */
    nest(errors, ctx = {}) {
        return (Array.isArray(errors) ? errors : [errors]).reduce((ret, e) => ret.concat(this.write(e, this.prefixes, ctx).map(s => "  " + s)), []);
    }
    /** a list of errors with a connector between them: AND for things that are
     * all wrong, OR for alternative accounts of one thing */
    joined(errors, connector, ctx = {}) {
        // one thing joined to nothing is just the thing: the indent is there to
        // show what the connector governs, and with no connector it only buries
        // the sentence a level deeper for every wrapper it passes through
        if (errors.length === 1)
            return this.write(errors[0], this.prefixes, ctx);
        return errors.reduce((ret, e) => {
            const nested = this.write(e, this.prefixes, ctx).map(s => "  " + s);
            return ret.length > 0 ? ret.concat([connector]).concat(nested) : nested;
        }, []);
    }
    write(val, prefixes, ctx = {}) {
        if (prefixes !== undefined)
            this.prefixes = prefixes;
        if (ctx.base !== undefined)
            this.base = ctx.base;
        const said = Object.assign({ prefixes: this.prefixes, base: this.base }, ctx);
        if (Array.isArray(val))
            return val.reduce((ret, e) => {
                const nested = this.write(e, this.prefixes, ctx).map(s => "  " + s);
                return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
            }, []);
        // a leaf says what is wrong with one thing; everything below composes
        const leaf = (0, error_messages_1.isLeafError)(val) ? (0, error_messages_1.describeError)(val, said) : null;
        if (leaf !== null && !hasNested(val))
            return [leaf.text];
        switch (val === null || val === undefined ? "" : val.type) {
            case "FailureList":
                return val.errors.reduce((ret, e) => ret.concat(this.write(e, this.prefixes, ctx)), []);
            case "Failure": {
                // everything in a Failure's list is wrong with the node at once; the
                // alternatives live in PossibleErrors below
                // What would make the node conform leads, where the validator worked
                // it out: it is the part of a report a reader can act on.  The errors
                // are the detail under it -- why it doesn't, arc by arc.
                const ways = (0, error_messages_1.repairText)(val.repairs, said);
                const detail = this.joined(errorList(val.errors), "AND", said).map(s => "  " + s);
                return ["validating " + (0, error_messages_1.dataTerm)(val.node, said, "node")
                        + " as " + (0, error_messages_1.schemaIri)(val.shape, said, "shape") + ":"]
                    .concat(ways.length === 0 ? [] : ["  to conform: " + ways.join(", or ")])
                    .concat(detail);
            }
            case "AllOf":
                // one reading's errors, all true at once
                return this.joined(errorList(val.errors), "AND", said);
            case "Alternatives":
            case "PossibleErrors": // its older spelling
                // one entry per way of reading the neighborhood: any one of them, put
                // right, would settle it
                return (val.of || val.errors).reduce((ret, alternative) => {
                    const nested = (Array.isArray(alternative)
                        ? this.joined(alternative, "AND", said)
                        : this.write(alternative, this.prefixes, ctx)).map(s => "  " + s);
                    return ret.length > 0 ? ret.concat(["OR"]).concat(nested) : nested;
                }, []);
            case "TypeMismatch": {
                // the header names the triple and the constraint; a cause that says no
                // more than the header does isn't worth a line of its own
                const header = leaf !== null ? leaf.text
                    : "validating " + (0, error_messages_1.dataTerm)(val.triple.object, said, "object");
                // the causes say only *why*: the header has named the node already
                const causes = this.nest(val.errors, Object.assign({}, said, {
                    constraint: val.constraint || said.constraint, triple: val.triple, terse: true,
                })).filter(line => line.trim() !== "" && !header.endsWith(line.trim()));
                return [header + (causes.length ? ":" : "")].concat(causes);
            }
            case "RestrictionError":
                return ["validating restrictions on " + (0, error_messages_1.dataTerm)(val.focus, said, "node") + ":"].concat(this.nest(val.errors, said));
            case "ShapeAndFailure":
                return this.nest(val.errors, said);
            case "ShapeOrFailure":
                return this.joined(Array.isArray(val.errors) ? val.errors : [val.errors], "OR", said);
            case "ShapeNotFailure":
                return ["Node " + (0, error_messages_1.dataTerm)(val.errors.node, said, "node")
                        + " expected to NOT pass " + (0, error_messages_1.schemaIri)(val.errors.shape, said, "shape")];
            case "SemActFailure":
                return ["rejected by semantic action:"].concat(this.nest(val.errors, said));
            case "ResultReference":
                return ["see " + val.ref];
            default:
                if (leaf !== null)
                    return [leaf.text];
                if (typeof val === "string")
                    return [val];
                throw Error("unknown shapeExpression type \"" + (val && val.type) + "\" in " + JSON.stringify(val));
        }
        /** does this error have causes to nest, or is its own sentence the whole account? */
        function hasNested(e) {
            if (e === null || typeof e !== "object" || !("errors" in e))
                return false;
            if (e.type === "NodeConstraintViolation")
                return false; // its errors are the stringified form of itself
            return Array.isArray(e.errors) ? e.errors.length > 0 : e.errors !== undefined;
        }
        /** unwrap the anonymous {errors: [...]} boxes the validator still nests;
         * an AllOf or an Alternatives says what it is and is left alone */
        function errorList(errors) {
            return (errors || []).reduce(function (acc, e) {
                const attrs = Object.keys(e || {});
                return acc.concat((attrs.length === 1 && attrs[0] === "errors")
                    ? errorList(e.errors)
                    : e);
            }, []);
        }
    }
    nodeConstraintToSimple(nc) {
        const elts = [];
        if ('nodeKind' in nc)
            elts.push(`be a ${nc.nodeKind.toUpperCase()}`);
        if ('datatype' in nc)
            elts.push(`have datatype ${nc.datatype}`);
        if ('length' in nc)
            elts.push(`have length ${nc.length}`);
        if ('minlength' in nc)
            elts.push(`have length at least ${nc.minlength}`);
        if ('maxlength' in nc)
            elts.push(`have length at most ${nc.maxlength}`);
        if ('pattern' in nc)
            elts.push(`match regex /${nc.pattern}/${nc.flags ? nc.flags : ''}`);
        if ('mininclusive' in nc)
            elts.push(`have value at least ${nc.mininclusive}`);
        if ('minexclusive' in nc)
            elts.push(`have value more than ${nc.minexclusive}`);
        if ('maxinclusive' in nc)
            elts.push(`have value at most ${nc.maxinclusive}`);
        if ('maxexclusive' in nc)
            elts.push(`have value less than ${nc.maxexclusive}`);
        if ('totaldigits' in nc)
            elts.push(`have have ${nc.totaldigits} digits`);
        if ('fractiondigits' in nc)
            elts.push(`have have ${nc.fractiondigits} digits after the decimal`);
        if ('values' in nc)
            elts.push(`have a value in [${trim(this.valuesToSimple(nc.values).join(', '), 80, /[, ]^>/)}]`);
        return elts;
    }
    // static
    valuesToSimple(values) {
        return values.map(v => {
            // non stems
            /* IRIREF */ if (typeof v === 'string')
                return `<${v}>`;
            /* ObjectLiteral */ if ('value' in v)
                return this.objectLiteralToSimple(v);
            /* Language */ if (v.type === 'Language')
                return `literal with langauge tag ${v.languageTag}`;
            // stems and stem ranges
            const [, type] = v.type.match(/^(Iri|Literal|Language)Stem(Range)?$/);
            let str = type.toLowerCase();
            if (typeof v.stem !== "object")
                str += ` starting with ${v.stem}`;
            if ("exclusions" in v)
                str += ` excluding ${v.exclusions.map((excl) => typeof excl === "string"
                    ? excl
                    : "anything starting with " + excl.stem).join(' or ')}`;
            return str;
        });
    }
    objectLiteralToSimple(v) {
        return `"${v.value}"` +
            ('type' in v && v.type !== XSD.string ? `^^<${v.type}>` : '') +
            ('language' in v ? `@${v.language}` : '');
    }
}
function trim(str, desired, skip) {
    if (str.length <= desired)
        return str;
    --desired; // leave room for '…'
    while (desired > 0 && str[desired].match(skip))
        --desired;
    return str.slice(0, desired) + '…';
}
function n3ify(ldterm) {
    if (typeof ldterm !== "object")
        return ldterm;
    const ret = "\"" + ldterm.value + "\"";
    if ("language" in ldterm)
        return ret + "@" + ldterm.language;
    if ("type" in ldterm)
        return ret + "^^" + ldterm.type;
    return ret;
}
module.exports = ShExHumanErrorWriter;
//# sourceMappingURL=shex-human-error-writer.js.map