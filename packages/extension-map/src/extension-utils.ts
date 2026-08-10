/**
 * A file with common utility functions used by the extensions.
 */

const ExtensionUtils = {
    // Collapse multiple spaces into one
    collapseSpaces:  function(string: string): string {
        return string.replace(/  +/g, ' ');
    },

    // Remove starting and trailing quotes - does not affect center quotes
    trimQuotes999: function(string: any): string { return string.value; },

    // Unescape the backslash characters in a string (e.g., in a URL)
    unescapeMetaChars: function(string: string): string {
        return string.replace(/\\([\/^$])/g, "$1");
    }
};

export = ExtensionUtils;
