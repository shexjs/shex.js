/**
 * The hashmap extension expects a hash map directive in JSON format like:
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"})
 * And returns the appropriate map value based on the input.
 */
import extUtils = require('./extension-utils');

interface HashmapArgs { varName: string, hash: { [key: string]: string } }

/**
 * This function will parse the args string to find the target variable name and
 * JSON hashmap arguments we'll use for doing the hash mapping.
 *
 * @param args a string with the extension arguments
 *
 * @return an object of format: {const: varname, map: hashmap}
 */
function parseArgs(mapDirective: string, args: string | undefined): HashmapArgs {

    // Do we have anything in args?
    if (args === undefined || args.length === 0) throw Error("Hashmap extension requires a variable name and map as arguments, but found none!");

    // get the variable name and hashmap
    const matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/s.exec(args);
    if (matches === null || matches.length < 3) throw Error("Hashmap extension requires a variable name and map as arguments, but found: " + mapDirective + "!");

    const varName = matches[1];
    const hashString = matches[2];

    let map;
    try {
        map = JSON.parse(hashString);
        if (Object.keys(map).length === 0) throw Error("Empty hashmap!");
    } catch(e: any) {
        throw Error("Hashmap extension unable to parse map in " + mapDirective+"!" + e.message);
    }

    // Verify that the hash key/value pairs are unique
    const values = Object.values(map);
  if (values.length != [...new Set(values)].length) throw Error('Hashmap extension requires unique key/value pairs!');

    return { varName: varName,
             hash: map };

}

/**
 * If the variable name is a prefixed name (format prefix:name), expand it
 * to the full name; returns the original variable name if not prefixed.
 *
 * @param varName variable name
 * @param prefixes a list of known prefixes in <short name>: <expanded name>
 *
 * @return the variable name, expanded if it had a prefix on it
 */
function expandedVarName(varName: string, prefixes: { [prefix: string]: string }): string {
    const varComponents = varName.match(/^([\w]+):(.*)$/);

    let expandedName;
    if (varComponents !== null && varComponents.length == 3) {
        const prefix = varComponents[1];
        const name = varComponents[2];

        // Verify we've got a good const name, prefix, and prefix value
        if (prefix.length === 0 || name.length === 0) throw Error("Hashmap extension given invalid target variable name " + varName);
        if (!(prefix in prefixes)) throw Error("Hashmap extension given undefined variable prefix " + prefix);

        expandedName = prefixes[prefix] + name;
    } else {
        // Not a prefixed name
        expandedName = varName;
    }

    return expandedName;
}

/**
 * Invert the value by finding the hash key that matches the value
 * This assumes key/value pairs are unique
 *
 * @param hash hash object whose attributes should be traversed.
 * @param value scalar value to look for
 */
function invert(hash: { [key: string]: string }, value: string): string {

   const key = Object.keys(hash).find(key => value === hash[key])

   if (!key)
       throw Error("Hashmap extension was unable to invert the value "
                   + value + " with map " + JSON.stringify(hash, {depth: null} as any) +"!");
   return key;
}

function lift(mapDirective: string, input: any, prefixes: { [prefix: string]: string }, args: string | undefined) {

    // Parse to get the target const name and the hash map
    const mapArgs = parseArgs(mapDirective, args);

    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const key = input.value || input;
    if (key.length === 0) throw Error('Hashmap extension has no input');

    const mappedValue = mapArgs.hash[key];
    return { [expandedName]: mappedValue };
}

function lower(mapDirective: string, bindings: any, prefixes: { [prefix: string]: string }, args: string | undefined) {
    const mapArgs = parseArgs(mapDirective, args);

    // Get the expanded const name if it was prefixed
    const expandedName = expandedVarName(mapArgs.varName, prefixes);

    const mappedValueTerm = bindings.get(expandedName);
  const mappedValue = mappedValueTerm.value || mappedValueTerm;
    if (mappedValue === undefined) throw Error('Unable to find mapped value for ' + mapArgs.varName);

    // Now use the mapped Value to find the original value and clean it up if we get something
    const inverseValue = invert(mapArgs.hash, mappedValue);
    if (inverseValue.length !== 0) {
        return '"' + extUtils.unescapeMetaChars( extUtils.collapseSpaces(inverseValue) ) + '"';
    }

    return inverseValue;
}

export = {
  lift: lift,
  lower: lower
};
