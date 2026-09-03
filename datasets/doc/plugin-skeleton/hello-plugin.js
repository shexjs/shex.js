/**
 * The smallest thing that is a shex.js webapp plugin.
 *
 * Copy this file, change the id and the label, and you have somewhere to
 * put what your plugin actually does.  It is a classic script: a page may
 * load it in a <script> tag, or an app may be told to fetch it --
 *
 *     shex-simple.html?plugin=https://your.example/hello-plugin.js
 *
 * -- from anywhere that permits the reader (see doc/plugins.md, "From
 * another origin").
 *
 * What it does: `%Hello:{ ... %}` in a schema records what it matched, and
 * the "hello" button writes the record into the pane this adds.  Which is
 * the whole loop -- a semantic-action extension the schema dispatches, a
 * pane, a verb -- in about forty lines.
 */

const HELLO = "http://example.org/extensions/Hello/";

const ShExHello = {
  id: HELLO,                       // the one extension this installs names it
  label: "Hello",

  css: "#helloSaid textarea { background-color: #f4f4ff; border-color: #1c56fc }",

  panes: [
    {name: "helloSaid", id: "helloSaid", kind: "json", editor: "json", rows: 8,
     className: "bindings droparea", queryStringParm: "hello"},
  ],

  toolbar: [
    {kind: "button", id: "hello", label: "hello (ctl-h)",
     title: "what the Hello actions matched in the last validation",
     key: {ctrl: true, key: "h"},
     run: app => app.hello()},
  ],

  /** what the actions saw, most recent validation only */
  said: [],

  onStartingValidation () {
    this.said = [];
  },

  /** the semantic-action extension a schema's %Hello:{...%} dispatches on */
  register (validator, api) {
    const ext = this;
    validator.semActHandler.register(HELLO, {
      dispatch (code, ctx) {
        ext.said.push({code: code.trim(), matched: ctx.node || ctx.object || null});
        return [];                 // no failures: an action that only looks
      },
    });
  },

  methods: {
    hello () {
      return this.Caches.helloSaid.set(JSON.stringify(ShExHello.said, null, "  "));
    },
  },
};

ShExPlugins.register(ShExHello);
