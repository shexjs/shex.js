#!/usr/bin/env node
// LanguageTag-version notes
// see https://stackoverflow.com/a/60899733/1243605

// We construct a language tag validator from pieces.
// The `privateUse` group is used more than once so we need to give them unique names.
let privateUseUsed = 0
const privateUse = () => "(?<privateUse" + (privateUseUsed++) + ">x(-[A-Za-z0-9]{1,8})+)"

const grandfathered = "(?<grandfathered>" +
      /* irregular */ (
        "en-GB-oed" +
          "|" + "i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)" +
          "|" + "sgn-(?:BE-FR|BE-NL|CH-DE)"
      ) +
      "|" + /* regular */ (
        "art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang"
      ) +
      ")"

const langtag = "(" +
      "(?<language>" + (
        "([A-Za-z]{2,3}(-" +
          "(?<extlang>[A-Za-z]{3}(-[A-Za-z]{3}){0,2})" +
          ")?)|[A-Za-z]{4,8})"
      ) +
      "(-" + "(?<script>[A-Za-z]{4})" + ")?" +
      "(-" + "(?<region>[A-Za-z]{2}|[0-9]{3})" + ")?" +
      "(-" + "(?<variant>[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3})" + ")*" +
      "(-" + "(?<extension>" + (
        /* singleton */ "[0-9A-WY-Za-wy-z]" +
          "(-[A-Za-z0-9]{2,8})+)"
      ) +
      ")*" +
      "(-" + privateUse() + ")?" +
      ")"

const languageTagReStr = "^(" + grandfathered + "|" + langtag + "|" + privateUse() + ")$";

// Some versions of regexp don't support named capture groups.
function removeNamedCaptureGroups (reStr) {
  const namedCaptureGroup = /\(\?<[a-zA-Z_][a-zA-Z0-9_]*>/g
  return reStr.replace(namedCaptureGroup, '(')
}

// Decide what flavor of regexp is supported. In node, we could look for major versions < 9
//   process.version.match(/^v(\d+)/)[1] < 9
// but that doesn't work in a browser. Instead we can remove them if we throw.
let languageTagRe
try {
  languageTagRe = RegExp(languageTagReStr)
} catch (e) {
  console.warn("with no name capture groups:", removeNamedCaptureGroups(languageTagReStr))
  languageTagRe = RegExp(removeNamedCaptureGroups(languageTagReStr))
}

// a few tests
const tests = [
  { pass: false, str: "" },
  { pass: false, str: "e" },
  { pass:  true, str: "en" },
  { pass:  true, str: "en-gb" },
  { pass:  true, str: "fr-us" }, // my assumed language
  { pass:  true, str: "fr-latn-be" },
  { pass:  true, str: "fr-Latn-be" },
  { pass:  true, str: "fr-x-privuse1" },
  { pass: false, str: "fr-x-privuse1x" },
  { pass: false, str: "fr-be-x" },
  { pass:  true, str: "fr-be-x-a" },
  { pass:  true, str: "fr-be-x-a-x" },
  { pass:  true, str: "fr-be-x-a-x-b" },
  { pass:  true, str: "fr-be-x-privuse" },
  { pass: false, str: "fr-be-x-privuse1x" },
  { pass:  true, str: "fr-bexxxxxx" },
  { pass: false, str: "fr-bexxxxxxx" },
  { pass:  true, str: "en-GB-oed" },
  { pass: false, str: "en-gb-oed" },
  { pass: false, str: "en-GB-oex" },
  { pass:  true, str: "en-gb-re123" },
  { pass:  true, str: "xxabcdef-fr" },
  { pass: false, str: "xxabcdefg-fr" },
]
console.warn(tests.map(
  t => `${languageTagRe.test(t.str) === t.pass ? '✓' : '✗'} ${t.pass ? 'accept' : 'reject'} "${t.str}"`
).join('\n'))

