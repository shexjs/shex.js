/**
 * A file with common utility functions used by the extensions.
 */

var _ = require('underscore');

/**
 * Given a variable name, looks up its prefix, and  replacing the shorthand 
 * prefix name in the variable with l name.
 * 
 * @param shortPrefixedVar a short prefixed variable name to expand e.g., dem:id
 * @param prefixes a list of the prefix short name/full name mappings
 *
 * @return the fully expanded name
 */
function applyPrefix(varName, prefixes) {

  // Figure out what variable syntax we have.  It could be <varname> or <prefix:varname>
  var matches = varName.match(/^ *(?:<([^>]*)>|([^:]*):([^ ]*)) *$/);
  if (_.isNull(matches))
    throw Error("variable \"" + varName + "\" didn't match expected pattern!");

  var expandedVarName;
  if (matches[1]) {
    // Got <varname>
    expandedVarName = matches[1];

  } else if (matches[2] in prefixes) {
    // prefixed var e.g., dem:id
    expandedVarName = prefixes[matches[2]] + matches[3];

  } else
    // unknown prefix
    throw Error("Unknown prefix " + matches[2] + " in \"" + varName + "\"!");

  return expandedVarName;
}

/**
 * Expand the variable passed in shortPrefixedVar, and add it to a list of the known 
 * fully expanded variables.  
 * 
 * @param shortPrefixedVar a short prefixed variable name e.g., ?<dem:id>
 * @param expandedVars the list of known variables
 * @param prefixes the prefix hash that maps short prefix name to the full URI prefix
 *
 * @return the fully expanded variable name 
 */
function buildExpandedVars(shortPrefixedVar, expandedVars, prefixes) {

  // shortPrefixedVar will look like this: ?<test:string> - strip off the ?< and > chars
  var v = unescapeMetaChars( shortPrefixedVar.substr(2, shortPrefixedVar.length - 3) );
  var expandedVarName = applyPrefix(v, prefixes);

  if (!_.isUndefined(expandedVars[expandedVarName])) 
    throw Error("unable to process prefixes in " + expandedVarName);

  // Add this new var to the list and return the expanded var name
  expandedVars.push(expandedVarName);
  return expandedVarName;
}

// Unescape the backslash characters in a string (e.g., in a URL)
function unescapeMetaChars(string) {
    return string.replace(/\\([\/^$])/g, "$1");
}

module.exports = {
    applyPrefix: applyPrefix,
    buildExpandedVars: buildExpandedVars,
    collapseSpaces:  function(string) { return string.replace(/  +/g, ' '); },
    unescapeMetaChars: unescapeMetaChars,
}
