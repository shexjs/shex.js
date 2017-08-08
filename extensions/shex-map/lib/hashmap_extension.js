/**
 * The hashmap extension expects a hash map directive in JSON format like: 
 *    hashmap(variable, {"D": "Divorced", "M": "Married", "S": "Single", "W": "Widowed"}) 
 * And returns the appropriate map value based on the input.
 */
var HashmapExtension = (function () {
var _ = require('underscore');
var util = require('util');

var extUtils = require('./extension-utils');

/**
 * This function will parse the args string to find the target variable name and 
 * JSON hashmap arguments we'll use for doing the hash mapping.  
 * 
 * @param args a string with the extension arguments
 * 
 * @return an object of format: {var: varname, map: hashmap}
 */
function parseArgs(mapDirective, args) {

    // Do we have anything in args? 
    if (_.isEmpty(args)) throw Error("Hashmap extension requires a variable name and map as arguments, but found none!");

    // get the variable name and hashmap
    var matches = /^[ ]*([\w:<>]+)[ ]*,[ ]*({.*)$/.exec(args);
    if (_.isNull(matches) || matches.length < 3) throw Error("Hashmap extension requires a variable name and map as arguments, but found: " + mapDirective + "!");

    var varName = matches[1]; 
    var hashString = matches[2];

    var map;
    try { 
        map = JSON.parse(hashString);
        if (_.isEmpty(map)) throw Error("Empty hashmap!");
    } catch(e) { 
        throw Error("Hashmap extension unable to parse map in " + mapDirective+"!" + e.message);
    } 

    // Verify that the hash key/value pairs are unique
    var values = _.values(map);
    if (values.length != _.uniq(values).length) throw Error('Hashmap extension requires unique key/value pairs!');

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
function expandedVarName(varName, prefixes) { 
    var varComponents = varName.match(/^([\w]+):(.*)$/);

    if (!_.isNull(varComponents) && varComponents.length == 3) { 
        var prefix = varComponents[1];
        var name = varComponents[2];

        // Verify we've got a good var name, prefix, and prefix value
        if (_.isEmpty(prefix) || _.isEmpty(name)) throw Error("Hashmap extension given invalid target variable name " + varName);
        if (_.isUndefined(prefixes[prefix])) throw Error("Hashmap extension given undefined variable prefix " + prefix);

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
function invert(hash, value) {

   var keys = _.find(_.keys(hash), function(key) { 
       return (value === hash[key]); 
   });

   if (_.isEmpty(keys)) 
       throw Error("Hashmap extension was unable to invert the value " 
                   + value + " with map " + util.inspect(hash, {depth: null}) +"!");
   return keys;
}
 
function lift(mapDirective, input, prefixes, args) {

    // Parse to get the target var name and the hash map
    var mapArgs = parseArgs(mapDirective, args);
    
    // Get the expanded var name if it was prefixed
    var expandedName = expandedVarName(mapArgs.varName, prefixes);

    var key = extUtils.trimQuotes(input);
    if (_.isEmpty(key)) throw Error('Hashmap extension has no input');
    
    var mappedValue = mapArgs.hash[key];
    return { [expandedName]: mappedValue };
}

function lower(mapDirective, bindings, prefixes, args) {
    var mapArgs = parseArgs(mapDirective, args);

    // Get the expanded var name if it was prefixed
    var expandedName = expandedVarName(mapArgs.varName, prefixes);

    var mappedValue = extUtils.trimQuotes( bindings.get(expandedName) );
    if (_.isUndefined(mappedValue)) throw Error('Unable to find mapped value for ' + mapArgs.varName);

    // Now use the mapped Value to find the original value and clean it up if we get something
    var inverseValue = invert(mapArgs.hash, mappedValue);
    if (!_.isEmpty(inverseValue)) { 
        return extUtils.unescapeMetaChars( extUtils.collapseSpaces(inverseValue) );
    }

    return inverseValue; 
}

return {
  lift: lift,
  lower: lower
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = HashmapExtension;
