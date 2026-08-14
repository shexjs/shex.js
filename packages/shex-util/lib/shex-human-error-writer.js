"use strict";
/** ShExHumanErrorWriter - render validation failures as indented human-readable text.
 */
const XSD = {};
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI", "string"].forEach(p => {
    XSD[p] = XSD._namespace + p;
});
class ShExHumanErrorWriter {
    /** nested errors, each indented under what they explain */
    nest(errors) {
        return (Array.isArray(errors) ? errors : [errors]).reduce((ret, e) => ret.concat((typeof e === "string" ? [e] : this.write(e)).map(s => "  " + s)), []);
    }
    /** a list of errors with a connector between them: AND for things that are
     * all wrong, OR for alternative accounts of one thing */
    joined(errors, connector) {
        return errors.reduce((ret, e) => {
            const nested = (typeof e === "string" ? [e] : this.write(e)).map(s => "  " + s);
            return ret.length > 0 ? ret.concat([connector]).concat(nested) : nested;
        }, []);
    }
    write(val) {
        const _HumanErrorWriter = this;
        if (Array.isArray(val)) {
            return val.reduce((ret, e) => {
                const nested = _HumanErrorWriter.write(e).map(s => "  " + s);
                return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
            }, []);
        }
        if (typeof val === "string")
            return [val];
        switch (val.type) {
            case "FailureList":
                return val.errors.reduce((ret, e) => {
                    return ret.concat(_HumanErrorWriter.write(e));
                }, []);
            case "Failure": {
                // everything in a Failure's list is wrong with the node at once; the
                // alternatives live in PossibleErrors below
                const said = ["validating " + val.node + " as " + val.shape + ":"]
                    .concat(_HumanErrorWriter.joined(errorList(val.errors), "AND").map(s => "  " + s));
                // ...and, where the validator was asked for them, what would make the
                // node conform: the nearest bag of arcs this shape accepts
                const ways = (val.repairs || [])
                    .map((repair) => (repair.arcs || []).map((arc) => (arc.delta > 0 ? "add " : "remove ") + Math.abs(arc.delta)
                    + " " + arc.property).join(" and "))
                    .filter((way) => way !== "");
                return ways.length === 0 ? said
                    : said.concat(["  to conform: " + ways.join(", or ")]);
            }
            case "PossibleErrors":
                // one list per way of reading the neighborhood: any one of them, put
                // right, would settle it
                return val.errors.reduce((ret, alternative) => {
                    const nested = (Array.isArray(alternative)
                        ? _HumanErrorWriter.joined(alternative, "AND")
                        : _HumanErrorWriter.write(alternative)).map(s => "  " + s);
                    return ret.length > 0 ? ret.concat(["OR"]).concat(nested) : nested;
                }, []);
            case "TypeMismatch":
                return ["validating " + n3ify(val.triple.object) + ":"].concat(_HumanErrorWriter.nest(val.errors));
            case "RestrictionError":
                return ["validating restrictions on " + n3ify(val.focus) + ":"]
                    .concat(_HumanErrorWriter.nest(val.errors));
            case "ShapeAndFailure":
                return _HumanErrorWriter.nest(val.errors);
            case "ShapeOrFailure":
                return _HumanErrorWriter.joined(Array.isArray(val.errors) ? val.errors : [val.errors], "OR");
            case "ShapeNotFailure":
                return ["Node " + val.errors.node + " expected to NOT pass " + val.errors.shape];
            case "ExcessTripleViolation":
                return ["validating " + n3ify(val.triple.object) + ": exceeds cardinality"];
            case "ClosedShapeViolation":
                return ["Unexpected triple(s): {"].concat(val.unexpectedTriples.map((t) => {
                    return "  " + t.subject + " " + t.predicate + " " + n3ify(t.object) + " .";
                })).concat(["}"]);
            case "NodeConstraintViolation":
                return ["NodeConstraintError: expected to " + this.nodeConstraintToSimple(val.shapeExpr).join(', ')];
            case "MissingProperty":
                return ["Missing property: " + val.property];
            case "NegatedProperty":
                return ["Unexpected property: " + val.property];
            case "AbstractShapeFailure":
                return ["Abstract Shape: " + val.shape];
            case "SemActFailure":
                return ["rejected by semantic action:"].concat(_HumanErrorWriter.nest(val.errors));
            case "SemActViolation":
                return [val.message];
            case "FeasibilityViolation": {
                // Say what would settle it rather than only that nothing does: a
                // :system inside `( :code . ; :system . ? )?` wants a :code beside it,
                // and the two ways out are worth naming.
                const arc = "Triple " + val.triple.subject + " " + val.triple.predicate + " "
                    + n3ify(val.triple.object);
                // each repair is a set of arcs to add together; the repairs are the
                // alternatives, and removing the triple is always one of them
                const ways = (val.repairs || []).map((r) => (r.arcs || []).map((a) => a.property));
                const every1 = ways.every((arcs) => arcs.length === 1);
                const said = every1
                    ? "add " + ways.map((arcs) => arcs[0]).join(" or ")
                    : ways.map((arcs) => "add " + arcs.join(" and ")).join(", or ");
                return [ways.length === 0
                        ? arc + " fits no triple constraint: remove it."
                        : arc + " fits no triple constraint: either " + said + ", or remove it."];
            }
            case "ResultReference":
                return ["see " + val.ref];
            default:
                debugger; // console.log(val);
                throw Error("unknown shapeExpression type \"" + val.type + "\" in " + JSON.stringify(val));
        }
        function errorList(errors) {
            return errors.reduce(function (acc, e) {
                const attrs = Object.keys(e);
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