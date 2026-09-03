# shex.js plugin skeleton

The smallest thing that is a [shex.js](https://github.com/shexSpec/shex.js)
webapp plugin, in about forty lines: `%Hello:{ ... %}` in a schema records
what it matched, and the "hello" button writes the record into the pane the
plugin adds.  A semantic-action extension the schema dispatches, a pane, a
verb: the whole loop.

## Try it

Serve this directory from a host that permits the reader
(`Access-Control-Allow-Origin: *` -- the app fetches a plugin before it
runs it), and open the app with the plugin's URL:

    npx http-server . --cors -p 8080

then `npm run serve` in a checkout of shex.js, and add
`?plugin=http://localhost:8080/hello-plugin.js` to the validator URL it
prints.  The app asks before it runs a plugin from another site; say yes.
(The published app at
<https://shex.io/webapps/packages/shex-webapp/doc/shex-simple.html> is
https, and a browser will not let it load a plugin from an http host.)

Then validate

    PREFIX : <http://a.example/>
    PREFIX Hello: <http://example.org/extensions/Hello/>
    :S { :p . %Hello:{ said it %} }

against

    PREFIX : <http://a.example/>
    :x :p 1 .

with the query map `<http://a.example/x>@<http://a.example/S>`, and press
"hello" (ctl-h): the pane says what the action saw.

## Make it yours

Copy `hello-plugin.js`, change the `id` (the IRI of the one extension it
installs, by convention) and the `label`, and add what yours does.  What a
plugin may declare -- panes, results tabs, toolbar and status-bar items,
keys, methods, a data source, a worker half -- is
[doc/plugins.md](https://github.com/shexSpec/shex.js/blob/main/doc/plugins.md)
in shex.js.
