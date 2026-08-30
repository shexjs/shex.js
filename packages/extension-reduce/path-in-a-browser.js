/**
 * What node's `path` is worth in a bundle: enough to join.
 *
 * shape-path-core decides at load time whether it is under node -- by
 * looking for `window`, which a Web Worker hasn't got -- and, deciding it
 * is, computes the path of a script it never runs here.  With nothing to
 * resolve `path` to that throws, and takes the whole bundle with it before
 * anything of ShExReduce is registered.  With this it gets a string, which
 * it doesn't use.  (In a page the question never arises: there is a
 * `window`, and it takes the other branch.)
 */
const join = (...parts) =>
      parts.filter(part => part !== undefined && part !== null && part !== "").join("/");

module.exports = {
  join,
  resolve: join,
  dirname: p => String(p).replace(/\/[^/]*$/, ""),
  basename: p => String(p).replace(/^.*\//, ""),
  extname: p => (String(p).match(/\.[^./]*$/) || [""])[0],
  sep: "/",
};
