/** keys - `%Map:{ id(arg, ...) %}` on a shape-valued output constraint names the node its
 * nested shape is built on.  Arguments are variables, `@node` (the input node the enclosing
 * iteration matched) or IRI templates `<http://a.example/person/{v:mrn}>`, whose
 * placeholders are replaced by the values' lexical forms, IRI-safe (everything but letters,
 * digits and -._~ percent-encoded, as R2RML does).  On the input side id() binds nothing,
 * so one schema serves both directions.
 */
"use strict";

export const NODE_ARGUMENT = "@node";
const CALL = /^\s*([A-Za-z][A-Za-z0-9]*)\s*\((.*)\)\s*$/s;
const VARIABLE = /^ *(?:<([^>]*)>|([^:<>\s]*):(\S*)) *$/;
const PLACEHOLDER = /\{([^{}]*)\}/g;

/** every match of a global regex, in order (String.prototype.matchAll is outside this package's lib) */
export function allMatches (re: RegExp, text: string): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = r.exec(text)) !== null) {
    out.push(m);
    if (m[0].length === 0)
      r.lastIndex++;
  }
  return out;
}

export function isKeyCode (code: string): boolean {
  const m = CALL.exec(code);
  return m !== null && m[1] === "id";
}

export function expandVariable (name: string, prefixes: {[p: string]: string}): string {
  const m = VARIABLE.exec(name);
  if (!m)
    throw Error(`"${name}" is not a ShExMap variable (prefix:name or <iri>)`);
  if (m[1] !== undefined)
    return m[1];
  if (!(m[2] in prefixes))
    throw Error(`Unknown prefix "${m[2]}:" in ShExMap variable "${name}"`);
  return prefixes[m[2]] + m[3];
}

export class Template {
  segments: (string | {variable: string})[] = [];
  text: string;

  constructor (text: string, prefixes: {[p: string]: string}) {
    this.text = text;
    let pos = 0;
    for (const m of allMatches(PLACEHOLDER, text)) {
      if (m.index! > pos)
        this.segments.push(text.slice(pos, m.index));
      this.segments.push({variable: expandVariable(m[1], prefixes)});
      pos = m.index! + m[0].length;
    }
    if (pos < text.length)
      this.segments.push(text.slice(pos));
  }

  variables (): string[] {
    return this.segments.filter(s => typeof s !== "string").map((s: any) => s.variable);
  }

  /** the IRI (as an N3id string), or null when a variable is unbound */
  expand (get: (v: string) => any): string | null {
    let out = "";
    for (const seg of this.segments) {
      if (typeof seg === "string") {
        out += seg;
      } else {
        const value = get(seg.variable);
        if (value === null || value === undefined)
          return null;
        out += iriSafe(lexical(value));
      }
    }
    return out;
  }
}

/** the lexical form of a JSON term (an IRI string, a _:label, or {value, ...}) */
export function lexical (term: any): string {
  return typeof term === "object" && term !== null && "value" in term ? term.value : String(term);
}

function iriSafe (s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/** the arguments of an id() code: variable IRIs, NODE_ARGUMENT, and Templates */
export function keyTerms (code: string, prefixes: {[p: string]: string}): (string | Template)[] {
  const m = CALL.exec(code);
  if (!m || m[1] !== "id")
    throw Error(`${code.trim()} is not an id() code`);
  const parts = m[2].trim() ? m[2].split(",").map(a => a.trim()) : [];
  if (parts.length === 0)
    throw Error(`id() needs at least one variable, template or ${NODE_ARGUMENT}: ${code.trim()}`);
  return parts.map(a => a === NODE_ARGUMENT ? a
                   : a.startsWith("<") && a.endsWith(">") && a.includes("{") ? new Template(a.slice(1, -1), prefixes)
                   : expandVariable(a, prefixes));
}

/** the variables an id() code reads (templates' placeholders included), and NODE_ARGUMENT where it appears */
export function keyArguments (code: string, prefixes: {[p: string]: string}): string[] {
  const out: string[] = [];
  for (const term of keyTerms(code, prefixes))
    if (term instanceof Template)
      out.push(...term.variables());
    else
      out.push(term);
  return out;
}
