---
name: shexjs-manifests
description: Work with shex.js manifests and `@shexjs/manifest` (packages/shex-manifest) — the YAML-LD manifest format (the W3C shex-manifest vocabulary, shex.js's own terms in doc/manifest-context.jsonld, `<prefix>:parms` scopes for extensions and neighborhoods), the roll-up of known contexts (tools/rollup-manifest-contexts.js, known-contexts.json), the reader pipeline (upgrade and x/xURL settlement, frame check, plain versus JSON-LD reading, RDF graphs), negotiable schema references, who reads and writes manifests (validate, the web app, tools/manifest-runner.js, gists), and how shex.js reads shexTest's manifest-ld. Use when adding a term or a vocabulary, changing a reader or writer, debugging a manifest that reads wrong, or when Manifest-test's roll-up or TEST_network checks fail.
---

# Manifests and `@shexjs/manifest`

A manifest lists validations: entries with a schema, data and a query map
(or one node and one shape) and the status expected. shex.js's examples
(`packages/*/examples/manifest.yaml`, aggregated into
`doc/tests-manifest.yaml`), the web app's gists and shexTest's conformance
tests are all manifests, and `@shexjs/manifest` reads every form of them
into one flat entry shape for `validate`, the web app and the tools.

## The format

YAML-LD: a YAML text whose parse is JSON-LD, `{"@context": [...], entries: [...]}`.
The `@context` stacks:

1. `https://www.w3.org/ns/shex-manifest.jsonld` — the **ShEx manifest
   vocabulary** (`shexMan:`), shared with the suite and other
   implementations: `entries`, `name`, `schema`/`data`/`queryMap` with
   `...URL` (a reference) and `...Label` spellings, `comment`, and `node`,
   `shape`, `status` from the ShEx vocabulary.
2. the author's own terms. shex.js's are `https://shex.js.org/doc/manifest-context.jsonld`
   (file `doc/manifest-context.jsonld`, namespace that URL + `#`): `pluginURL`,
   `neighborhood`, `manifestContext`, `dataBase`, `slurp`, `explain`,
   `regexpEngine`, `meta`/`metaURL`. The suite's are
   `https://www.w3.org/ns/shex-test.jsonld`. (1) and shex.js's (2) are the
   **core**: what a manifest with no `@context` is read with, and what a
   gist stacks.
3. two lines per scoped vocabulary the manifest uses, the prefix of the
   manifest's choosing:
   ```yaml
   - map: http://shex.io/extensions/Map/#
     map:parms: {"@context": https://shexspec.github.io/extensions/Map/manifest-context.jsonld}
   ```
   An entry then writes `map:parms:` with that vocabulary's names *bare*
   inside, `pluginURL` among them (an outer name stays visible inside a
   scope). A scope file holds only bare names mapped to absolute IRIs, no
   prefix, so vocabularies cannot collide. **Bind the term, not just the
   prefix**: JSON-LD attaches a scoped context to the key as written; a
   prefix line alone gives `map:parms` its IRI and drops its contents.

Scopes today: `packages/neighborhood-{sparql,wikibase}/manifest-context.jsonld`
(`nsp`, `nwb`) and, beside their specs in shexSpec/extensions, Map (`map`),
Reduce (`rdc`, owns `overlay`/`overlayURL`), SHACL-SPARQL (`ssp`, empty) and
Test (`tst`: `prints`, what the suite's probe must print). The file comment
of `doc/manifest-context.jsonld` is the long statement of all this;
`doc/tests-manifest-ld.yaml` and its generated `doc/tests-manifest-ld.ttl`
(`tools/yamlld-to-nested-turtle.js`) are a worked sample. The package
manifests are still written in the classic flat form; the reader upgrades
them.

## The roll-up

`packages/shex-manifest/known-contexts.json` holds every context a manifest
is known to stack — `{core, tops, contexts, paths, vocabularies}` — so no
reader needs the network for a known vocabulary. Rerun after editing or
adding any context, or when a vocabulary's CSV changes:

```sh
node tools/rollup-manifest-contexts.js --ns ../../w3c/ns --extensions ../../shexSpec/extensions
```

Without the options it fetches the published URLs; the W3C and extension
contexts are 404 until their branches are published, so give the checkouts.
To add a vocabulary, add a row to `TOPS` or `SCOPES` in the tool (prefix,
namespace, plugin file for an extension), rerun it, and extend
`Manifest-test`'s expected prefix list. `Manifest-test` fails until the
roll-up agrees with the repository's files and, when sibling checkouts
exist, with w3c/ns's; its `TEST_network` check compares each context with
what the web publishes, skipping a 404 only for the URLs in its `PENDING`
list — add an unpublished context there, remove it when published.

## The reader

`readManifest(text, options)` sniffs YAML, JSON or Turtle. Turtle goes to
`entriesFromGraph(store)` (callers pass a parser or a store with `getQuads`).
YAML and JSON go through `readJson`:

1. **`upgrade`** = `canonicalize` + x/xURL settlement. A document with no
   `@context` is a deployed classic manifest: a bare list (or one entry) is
   wrapped in `entries`, the core contexts set, each flat attribute a known
   scope defines (`outputSchemaURL`, `endpoint`) moved into `<prefix>:parms`
   with the binding added, `plugins` become `pluginURL` in the scope whose
   plugin file matches (else at the entry), a test manifest's `shex` renamed
   `schema`, `title` read as `name`. A document with an `@context` is taken as
   it says. Then, given `options.probe` (does this URL name a resource?),
   each `schema`/`data`/`queryMap` — and each document pair a scope's context
   defines, inside that scope — whose value resolves to a resource is renamed
   `...URL`; without a probe, the whitespace-or-bracket heuristic for schema
   and data only.
2. **`frameCheck`** says whether the plain reading is guaranteed to be the
   JSON-LD reading: only known top-level contexts and known scope bindings in
   `@context`, no keyword in an entry but a string `@id`, no IRI-shaped key
   but a bound `<prefix>:parms`, no value objects. `unknown` lists keys no
   context defines (JSON-LD would drop them).
3. **`entriesFromJson`** (plain: scopes flattened beside the core attributes,
   `pluginURL`s collected into `plugins`, scopes kept under `parms` by
   namespace) when faithful; otherwise **`entriesViaJsonLd`** with
   `options.jsonld` (jsonld.js, loaded lazily in the browser) → RDF →
   `entriesFromGraph`.

A reference without an extension is **negotiable**: `representations(ref)`
lists it as written, then `.shex`, `.json`, `.ttl`, and
`resolveRepresentation(ref, probe, base)` finds the first that is there. The
settlement asks that way for a bare `schema` only; `tools/manifest-runner.js`
(`fileOf`), `validate`'s examples path and the web app
(`ShExCaches.fetchRepresentation`) read a `schemaURL` so. shexTest's
validation tests name their schemas that way (`../schemas/1dot`).

## Who reads and writes

- `validate --yaml-manifest|--json-manifest` (probe `resourceExists`),
  `--turtle-manifest`/`--jsonld-manifest` (a graph with no `mf:action` is an
  examples manifest). It runs entries; it does not compare them with `status`.
- The web app: `ManifestCache.readManifestText` keeps the manifest's own
  text, URL and format; `webpacks/jsonld.min.js` (copied by `postwebpack`,
  gitignored) is fetched only for a manifest that needs the processor.
  Create/Update Gist write the canonical form: both core contexts, a binding
  per vocabulary used, scoped attributes in `<prefix>:parms` with the
  `pluginURL` of the loaded plugin (matched by namespace, else by the file
  the roll-up names), empty inputs left out.
- `tools/manifest-runner.js` (`validateEntry`): the examples runner the
  package tests share; it compares verdicts with `status`, over `queryMap`.
- The gist and manifest-format browser tests:
  `packages/shex-webapp/test/manifest-formats-test.js`, `browser-test.js`, the
  Map and Reduce editor smoke tests.

## shexTest's manifests

shexTest keeps `manifest` (legacy `manifest.ttl`/`manifest.jsonld`) and
`manifest-ld` (`manifest-ld.{yaml,jsonld,ttl}`, this format, with the ShEx
test vocabulary and the Test scope) in each suite directory. shex.js's
suites read `manifest-ld.jsonld` when the corpus has it, through
`packages/shex-cli/test/suiteManifest.js`, which spells the tests the way
`manifest.jsonld` does with the corpus's own
`bin/manifest-ld-to-legacy-jsonld.js`, so the suites are unchanged;
`TEST_original_manifest=true` reads `manifest.jsonld` regardless.
`packages/shex-manifest/test/TestSuiteManifest-test.js` checks what shex.js
makes of the five manifests (same entries from the three representations,
what the suites read, nothing dropped as JSON-LD, the frame check, plain =
JSON-LD reading, the examples runner with the Test extension registered);
that the manifests are internally consistent is the suite's own check,
`bin/manifest-ld-legacy-check.js`. The suite test skips when the sibling
corpus has no `manifest-ld.yaml`, i.e. is not on `manifest-refactor`.

## Gotchas

- Two scopes defining one bare name in one entry make the plain reader
  refuse the manifest; the gist writer scopes only vocabularies in the
  roll-up.
- jsonld 9 takes canonicalization options only under `canonizeOptions`;
  URDNA2015 is O(n²) on a list of blank-node entries (minutes for 1309):
  compare trees, as the suite test did and `manifest-ld.js` does.
- jsonld leaves out an empty language where N3 gives `""`; graphs are sets.
- `doc/tests-manifest-ld.yaml` is a hand-picked sample, not a replacement
  for `doc/tests-manifest.yaml`; the writers (package manifests,
  `tools/aggregate-manifests.js`) still produce the classic form.
- After editing `src/app/*.ts` in the web app, `npm run build` there and
  commit `doc/*.js`; `npm run check-page-scripts` fails otherwise.
- Sibling checkouts the tests and tools expect:
  `../../shexSpec/shexTest` (via `findPath.js`), `../../w3c/ns`,
  `../../shexSpec/extensions`.
