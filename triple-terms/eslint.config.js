// ESLint 9 flat config, translated from the former eslintConfig block in
// package.json (see https://eslint.org/docs/latest/use/configure/migration-guide).
"use strict";

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.browser,
        it: "readonly",
        should: "readonly",
        describe: "readonly"
      }
    },
    rules: {
      "indent": [2, 2],
      "quotes": [2, "double"],
      "linebreak-style": [2, "unix"],
      "semi": [2, "always"],
      "strict": [2, "never"],
      "no-multi-spaces": 0,
      "key-spacing": 0,
      // ESLint 9 changed no-unused-vars' caughtErrors default to "all";
      // restore the pre-9 behavior the code was written against.
      "no-unused-vars": [2, {"caughtErrors": "none"}]
    }
  }
];
