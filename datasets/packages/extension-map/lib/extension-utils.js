"use strict";
/**
 * A file with common utility functions used by the extensions.
 */
const ExtensionUtils = {
    // Collapse multiple spaces into one
    collapseSpaces: function (string) {
        return string.replace(/  +/g, ' ');
    },
    // Remove starting and trailing quotes - does not affect center quotes
    trimQuotes999: function (string) { return string.value; },
    // Unescape the backslash characters in a string (e.g., in a URL)
    unescapeMetaChars: function (string) {
        return string.replace(/\\([\/^$])/g, "$1");
    }
};
module.exports = ExtensionUtils;
//# sourceMappingURL=extension-utils.js.map