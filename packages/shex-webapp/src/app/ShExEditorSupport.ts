/**
 * The CodeMirror editors over the app's textareas, and the highlighting
 * between them: live diagnostics, validation-error anchoring in both the
 * schema and data panes, and the constraint <-> triple hovers.
 *
 * This is doc/ShExEditorSupport.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */

/** EditorSupport - optional CodeMirror panes over the app's textareas
 * (?editors=1): live parse diagnostics, validation-error anchoring in both
 * the schema and data panes, and shape-map ↔ shape-declaration highlights.
 * See doc/editor-integration-plan.md in the repository root.
 */
class EditorSupport {
  [key: string]: any;
  constructor (app) {
    this.app = app;
    this.panes = {};
  }

  /** `language` names one of the host's own languages; pass `supplied` for
   * a pane whose language comes from whichever neighborhood module claims
   * its text (see moduleEditorFor).  Without either -- editors off, or a
   * module that describes no language -- the textarea is what stays. */
  addPane (name, cache, language, supplied) {
    const textarea = cache.selection[0];
    if (!textarea)
      return null;
    // makePaneIfDescribed, not makePane: a module that describes no
    // language leaves the textarea exactly as the editors-off app shows it
    return this.panes[name] = ShExWebApp.EditorPanes.makePaneIfDescribed(textarea, {
      language,
      getBase: () => cache.meta && cache.meta.base,
      completions: () => this.completionSets(language || "turtle", cache),
      supplied,
      // completions a module can only make from a live db: wikidata
      // completing entity IRIs from the labels it has loaded
      suppliedContext: () => ({db: cache.parsed}),
      // a query map's two sides resolve against the schema's and the
      // data's prefixes
      shapeMap: language === "shapemap" ? () => this.shapeMapMetas(cache) : undefined,
    });
  }

  /** live autocomplete vocabulary: prefixes from the panes' metas, shape
   * labels and constraint predicates from the relevant schema -- as last
   * parsed for a validation *and* as the pane holds it now, so a label
   * typed since the last validation completes too */
  completionSets (language, cache) {
    const {inputSchema, inputData} = this.app.Caches;
    // a ShExC pane completes from its own schema (e.g. shexmap's
    // outputSchema); the data pane completes from the input schema
    const schemaCache = language === "shexc" ? cache : inputSchema;
    const schemas = [schemaCache.parsed, this.liveSchema(schemaCache)].filter(s => s && typeof s === "object");
    const prefixes = Object.assign({},
                                   inputData.meta && inputData.meta.prefixes,
                                   inputSchema.meta && inputSchema.meta.prefixes,
                                   cache.meta && cache.meta.prefixes,
                                   ...schemas.map(s => s._prefixes || {}));
    const predicates = [...new Set(schemas.flatMap(s => s._exprLocations
      ? [...s._exprLocations.keys()].map(tc => tc.predicate) : []))];
    const shapeLabels = [...new Set(schemas.flatMap(s => s._index ? Object.keys(s._index.shapeExprs) : []))];
    return language === "turtle" ? {prefixes, predicates}
      : language === "shapemap" ? {prefixes, shapeLabels, nodes: this.dataNodes()}
      : {prefixes, predicates, shapeLabels};
  }

  /** the schema pane's text as it parses now (the live linter's parse,
   * memoized by the parser), or null while it doesn't */
  liveSchema (cache) {
    const text = cache.selection && cache.selection.val();
    if (!text)
      return null;
    return ShExWebApp.EditorServices.parseShExC(text, {base: cache.meta && cache.meta.base}).schema;
  }

  /** the data's subjects, for the node side of a query map pair */
  dataNodes () {
    const db = this.app.Caches.inputData.parsed;
    const subjects = db && typeof db.getSubjects === "function" ? db.getSubjects() : [];
    return subjects.slice(0, 500).map(term => term.termType === "BlankNode" ? "_:" + term.value : term.value);
  }

  /** the base and the two metas a query map resolves against.  A pane's
   * meta is filled by a parse; until the schema or the data has been
   * parsed for a validation, what its text declares now stands in. */
  shapeMapMetas (cache) {
    const {inputSchema, inputData} = this.app.Caches;
    return {base: cache.meta && cache.meta.base,
            schemaMeta: this.liveMeta(inputSchema, "shexc"),
            dataMeta: this.liveMeta(inputData, "turtle")};
  }

  liveMeta (cache, language) {
    const meta = cache.meta || {};
    if (meta.prefixes && Object.keys(meta.prefixes).length)
      return meta;
    const text = cache.selection && cache.selection.val();
    if (!text)
      return meta;
    const parsed = language === "shexc"
          ? ShExWebApp.EditorServices.parseShExC(text, {base: meta.base}).schema
          : ShExWebApp.EditorServices.parseTurtle(text, {baseIRI: meta.base});
    return {base: meta.base, prefixes: (parsed && (parsed._prefixes || parsed.prefixes)) || {}};
  }

  /** the schema pane's text, located over the schema as last parsed */
  locateSchema () {
    const {inputSchema} = this.app.Caches;
    if (!inputSchema.parsed || typeof inputSchema.parsed !== "object")
      return null;
    return ShExWebApp.EditorServices.locateInParsed(
      inputSchema.selection.val(), inputSchema.parsed, {base: inputSchema.meta && inputSchema.meta.base});
  }

  /** where the data is written: the source's own locator (an entity page,
   * whatever it reads), else the Turtle parser's */
  locateData (text) {
    const {inputData} = this.app.Caches;
    if (!text)
      return null;
    const db = inputData.parsed;
    return (db && typeof db.locateDocument === "function" && db.locateDocument(text))
      || ShExWebApp.EditorServices.parseTurtle(text, {baseIRI: inputData.meta && inputData.meta.base});
  }

  /** does the fixed shape map expect this entry to be nonconformant
   * (node@!shape)?  Same lookup the results renderer uses for ✓/✗. */
  expectsNonconformant (entry) {
    const shapeString = entry.shape === ShExWebApp.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    return $("#fixedMap .pair" +
             "[data-node='" + entry.node + "']" +
             "[data-shape='" + shapeString + "']")
      .find(".shapeMap-joiner").hasClass("nonconformant");
  }

  /** map validation results onto the schema and data editors.  Error
   * squiggles reflect the EXPECTED outcome: an entry validated as
   * node@!shape that duly fails gets no error marks (its failure pairs stay
   * hoverable in red to show why it failed), while one that unexpectedly
   * conforms gets an error on the shape declaration. */
  reportValidation (entries) {
    const {inputSchema, inputData} = this.app.Caches;
    if (!this.panes.inputSchema || !inputSchema.parsed)
      return;
    try {
      const located = this.locateSchema();
      // ...kept, so a link resolved later can ask it where a shape is
      this.located = located;
      // Where the data was written is the data source's to say (see
      // locateData).  Locating the data is worth doing whether or not it
      // is showing in an editor: the results widget anchors to these
      // ranges too.
      const locate = text => this.locateData(text);
      // A source can hold several documents -- an entity page each, and
      // later a named graph each -- and a validation reaches all of them,
      // so locate them all.  The showing one comes first: its diagnostics
      // are the ones the pane on screen can carry.
      const showing = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
      const documents = this.app.neighborhoods ? this.app.neighborhoods.documents() : [];
      // the showing document is read from the pane, which holds edits the
      // stashed copy hasn't seen yet
      const dataDocuments = [{at: documents.length ? showing : -1,
                              parsed: locate(inputData.selection.val())}].concat(
        documents.map((d, at) => ({at, parsed: at === showing ? null : locate(d.text)})))
            .filter(d => d.parsed);
      // A source can have no document to locate anything in -- an endpoint
      // answers from a store nobody typed -- and the schema-side diagnostics
      // are still worth drawing.  Map against nothing rather than against
      // an empty list, which has no [0] to read.
      if (dataDocuments.length === 0)
        dataDocuments.push({at: -1, parsed: null});
      // data ranges are offsets into one document, so they are kept per
      // document: whichever is showing gets its own (see reaimAtShowingDocument)
      const merged = {schema: [], data: [], pairs: [], dataByDoc: new Map()};
      const dataOf = at => {
        if (!merged.dataByDoc.has(at))
          merged.dataByDoc.set(at, []);
        return merged.dataByDoc.get(at);
      };
      entries.forEach(entry => {
        // one mapping per document; a pair takes the anchors of whichever
        // document turns out to have said its triple
        const perDocument = dataDocuments.map(d => ({
          at: d.at,
          // each document spells the message for itself: the same failure
          // read from the observation says <Patient2> and read from the
          // patient says :gender, because that is what each one says
          mapped: ShExWebApp.EditorServices.mapValidationErrors(
            entry.appinfo, located, d.parsed, {spelling: termSpelling()}),
        }));
        const mapped = perDocument[0].mapped;
        mapped.pairs.forEach((pair, i) => {
          pair.doc = perDocument[0].at;
          if (pair.anchors && pair.anchors.object)
            return;
          const elsewhere = perDocument.slice(1).find(
            d => (d.mapped.pairs[i] || {}).anchors && d.mapped.pairs[i].anchors.object);
          if (elsewhere) {
            pair.anchors = elsewhere.mapped.pairs[i].anchors;
            pair.data = elsewhere.mapped.pairs[i].data;
            pair.doc = elsewhere.at;
          }
        });
        mapped.pairs.forEach(p => { p.id += merged.pairs.length; });
        merged.pairs.push.apply(merged.pairs, mapped.pairs);
        const actualFail = entry.status === "nonconformant";
        if (!this.expectsNonconformant(entry)) {
          merged.schema.push.apply(merged.schema, mapped.schema);
          // Every document, not only the one on screen.  A validation walks
          // wherever the data leads it -- the observation names a patient the
          // next document describes -- and the reader who goes looking for
          // the bad triple is looking in *that* document, where the dot
          // belongs.
          perDocument.forEach(d => dataOf(d.at).push.apply(dataOf(d.at), d.mapped.data));
        } else if (!actualFail) {
          // unexpected conformance: flag the shape declaration and the node
          const message = entry.node + " matched " + entry.shape
                + " though the shape map expected nonconformance";
          const shapeRange = typeof entry.shape === "string" ? located.locate.shape(entry.shape) : null;
          if (shapeRange)
            merged.schema.push(Object.assign({severity: "error", message}, shapeRange));
          perDocument.forEach(d => {
            const anchored = d.mapped.pairs.find(p => p.anchors && p.anchors.subject);
            if (anchored)
              // a bnode subject is a whole [ property list ]; mark where it
              // opens rather than every triple written inside it
              dataOf(d.at).push(Object.assign(
                {severity: "error", message},
                (anchored.anchors.subjectParts || [anchored.anchors.subject])[0]));
          });
        } // else: expected failure -- no error marks
      });
      merged.data = merged.dataByDoc.get(showing) || [];
      this.lastMapped = merged; // introspection for tests/debugging
      this.mappedDoc = showing;  // the document these data ranges are offsets into
      this.panes.inputSchema.setDiagnostics(merged.schema);
      if (this.panes.inputData)
        this.panes.inputData.setDiagnostics(merged.data);
      this.setPairHovers(merged.pairs);
    } catch (e) {
      console.warn("editor diagnostics failed:", e);
    }
  }

  /** Drop what the last validation marked, in both panes.
   *
   * Called when either is edited: a mark is a claim about a validation of
   * one schema against one document, and editing either makes the claim
   * about text that has moved or gone.  The hovers go with them, for the
   * same reason -- they point at ranges in both panes at once. */
  clearValidationMarks () {
    this.lastMapped = null;
    // what a plugin linked was about the validation these marks were about
    this.linkSets = {};
    ["inputSchema", "inputData"].forEach(name => {
      const pane = this.panes[name];
      if (pane && pane.setDiagnostics)
        pane.setDiagnostics([]);
    });
    this.setPairHovers([]);
  }

  /** Another document is showing: the data-side ranges are offsets into one
   * document, so hand the pane the ones belonging to the document it is now
   * holding.  It used to have only the mapping for whichever document the
   * validation ran under, so moving off that one took the marks away and
   * the document that actually contained the bad triple never showed one. */
  reaimAtShowingDocument () {
    if (!this.lastMapped)
      return;
    const showing = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
    const byDoc = this.lastMapped.dataByDoc;
    if (this.panes.inputData)
      this.panes.inputData.setDiagnostics(
        byDoc ? (byDoc.get(showing) || [])
          : showing === this.mappedDoc ? this.lastMapped.data : []);
    this.setPairHovers(this.lastMapped.pairs);
  }

  /** what a validation says is linked, and what each plugin says is */
  allPairs () {
    return Object.keys(this.linkSets || {}).reduce(
      (acc, id) => acc.concat(id === "validation"
                              ? (this.linkSets[id] || [])
                              : (this.linkSets[id] || []).flatMap(l => this.resolveLink(l))), []);
  }

  /**
   * Where a link's subject is written, for a link that says what it is
   * about rather than where.
   *
   * A plugin knows which triple of the validation its value came from; it
   * has no idea where that triple is written, and no business working it
   * out -- this has already anchored every one of them.  So a link may say
   * `triple` (a TestedTriple from the last results) or `node`/`shape`, and
   * gets the schema and data ranges the validation found for it.
   */
  resolveLink (link) {
    if (link.schema || link.anchors)
      return [link];                      // it said where for itself
    const pairs = (this.lastMapped || {}).pairs || [];
    const sameTerm = (l, r) => l === r ||
          (!!l && !!r && (l.value !== undefined ? l.value : l) === (r.value !== undefined ? r.value : r));
    const where = p => ({
      schema: p.schema, schemaParts: p.schemaParts, schemaPath: p.schemaPath,
      anchors: p.anchors, doc: p.doc,
    });
    if (link.triple) {
      const found = pairs.find(p => p.triple === link.triple);
      return [found === undefined ? link : Object.assign({}, link, where(found))];
    }
    if (link.node !== undefined) {
      // A `$` is assigned at a production, with a focus: an action on a
      // shape is about that shape's own text -- what it says before its
      // body and after it, the code among it -- and about the node that
      // was the focus.  That is what this link says, and what hovering it
      // lights up.
      const about = pairs.filter(p => p.triple && p.anchors &&
                                 sameTerm(p.triple.subject, link.node));
      if (about.length === 0)
        return [link];
      const lead = about.find(p => p.anchors.subject) || about[0];
      const parts = this.shapeParts(link.shape, about);
      const primary = Object.assign({}, link, {
        schema: parts ? parts.whole : lead.anchors.shapeLabel,
        schemaParts: parts ? parts.parts : undefined,
        anchors: {subject: lead.anchors.subject, subjectParts: lead.anchors.subjectParts},
        doc: lead.doc,
      });
      // ...and the other way round it reaches further: hovering any of the
      // constraints that shape matched, or any of the triples they matched,
      // lights what the fold made of them.  Those are the same link said
      // again at each of those places -- `secondary`, since they are ways
      // *in* rather than things this link is about.
      return [primary].concat(about.map(
        p => Object.assign({}, link, where(p), {secondary: true})));
    }
    return [link];
  }

  /**
   * A shape's own text: what it says before its body and after it.
   *
   * `<#MidNum> {` and `} %Reduce:{ … %}` -- the shape and the action that
   * ran when it matched -- leaving the constraints between them to light up
   * on their own, the way a constraint with an inline shape does.  The body
   * is where its constraints are, which the pairs for them are carrying.
   */
  shapeParts (label, pairs) {
    const located = this.located;
    const whole = located && label && located.locate ? located.locate.shape(label) : null;
    if (!whole)
      return null;
    const inner = pairs.reduce((acc, p) => {
      const r = p.schema;
      return !r || r.from < whole.from || r.to > whole.to ? acc
        : {from: Math.min(acc ? acc.from : r.from, r.from),
           to: Math.max(acc ? acc.to : r.to, r.to)};
    }, null);
    if (inner === null)
      return {whole, parts: [whole]};
    const text = located.text || "";
    let headTo = inner.from;
    while (headTo > whole.from && /\s/.test(text[headTo - 1]))
      --headTo;
    let tailFrom = inner.to;
    while (tailFrom < whole.to && /\s/.test(text[tailFrom]))
      ++tailFrom;
    const parts = [];
    if (headTo > whole.from)
      parts.push({from: whole.from, to: headTo});
    if (tailFrom < whole.to)
      parts.push({from: tailFrom, to: whole.to});
    return {whole, parts: parts.length ? parts : [whole]};
  }

  /**
   * Links of somebody else's: a plugin saying which ranges of which panes
   * are about each other (app.linkPanes).
   *
   * The same pairs a validation makes, wired the same way, so the two
   * cannot fight over a pane: hovering is wired once, from all of them.  A
   * pair that carries a schema range joins the group of validation pairs
   * sharing it, which is what lets hovering a constraint light both the
   * triple that matched it and what a plugin made of that match.
   */
  setLinks (id, pairs) {
    this.linkSets = this.linkSets || {};
    if (pairs && pairs.length)
      this.linkSets[id] = pairs;
    else
      delete this.linkSets[id];
    this.setPairHovers(this.linkSets.validation || []);
  }

  /** cross-pane hover highlighting for validation matches and failures:
   * hovering a matched/failed TripleConstraint highlights it, its shape's
   * label and the data triple's object; hovering the object highlights the
   * whole data triple and the constraint.  Green for matches, red for
   * failures.
   *
   * A pair may name ranges in panes of its own (`panes: {name: [range…]}`),
   * which is how a plugin's pane joins in: ShExReduce's AST, the action
   * that built each node of it, and the triple that action ran over. */
  setPairHovers (validationPairs) {
    this.linkSets = this.linkSets || {};
    this.linkSets.validation = validationPairs || [];
    const pairs = this.allPairs();
    const schemaPane = this.panes.inputSchema;
    // A source need not have a document to show: a query service answers
    // from a store nobody typed, and a Wikibase reached by entity id has
    // nothing in the pane until a page is opened.  The schema and the
    // results are still there to point at each other, so the data side is
    // what goes missing -- not the whole of the hovering, which is what
    // used to happen and left those sources with no highlighting at all.
    const dataPane = this.panes.inputData;
    if (!schemaPane)
      return;
    const resultPanes = this.app.resultsWidget.resultPanes;
    // the panes the pairs name for themselves, which a hover may paint
    const linkedPanes = new Set<string>();
    pairs.forEach(p => Object.keys(p.panes || {}).forEach(name => {
      if (name !== "inputSchema" && name !== "inputData" && this.panes[name])
        linkedPanes.add(name);
    }));
    const wipe = () => {
      schemaPane.clearHighlights();
      if (dataPane)
        dataPane.clearHighlights();
      linkedPanes.forEach(name => this.panes[name].clearHighlights());
      resultPanes.forEach(({pane}) => pane.clearHighlights());
    };
    // a frozen highlight stays until it is released: leaving it is what a
    // reader does on the way to look at what it is pointing at
    const clearAll = () => {
      if (HighlightMode.frozen())
        return;
      wipe();
    };
    // a constraint with cardinality > 1 yields one pair per matched triple,
    // all sharing a schema range: group them so hovering the constraint
    // highlights every matched triple
    const bySchemaRange = new Map();
    pairs.filter(p => p.schema).forEach(p => {
      const key = p.schema.from + "-" + p.schema.to;
      if (!bySchemaRange.has(key))
        bySchemaRange.set(key, []);
      bySchemaRange.get(key).push(p);
    });
    // a TestedTriple's subject/predicate/object member lines (its full range
    // would also paint any nested solutions)
    // object first: the pane scrolls to the first range it is given, and the
    // object is the answer -- the subject and predicate are what the reader
    // asked with
    const termRanges = (r) => r.fields
          ? ["object", "subject", "predicate"].map(k => r.fields[k]).filter(f => f)
          : [{from: r.from, to: r.to}];
    const showInResults = (group, cls, scroll) => {
      resultPanes.forEach(({pane, ranges}) => {
        const hits = ranges.filter(r => group.some(p => p.triple === r.target));
        if (hits.length)
          pane.highlight(hits.flatMap(termRanges), cls, {scroll});
        else
          pane.clearHighlights();
      });
    };
    // a constraint's highlight is its parts (e.g. ":s {" and "}", skipping
    // an inline-shape body); a bnode subject/object highlights as its
    // [ ] delimiters rather than the whole property list
    const constraintRanges = (p) => p.schemaParts || (p.schema ? [p.schema] : []);
    // a pair whose triple isn't in any showing document has no anchors at all
    const anchorRanges = (p, term) => !p.anchors ? []
          : p.anchors[term + "Parts"] || (p.anchors[term] ? [p.anchors[term]] : []);
    const show = (group, hoveredSide, pinning?) => {
      // the switch says whether the mouse paints at all; a pin says the
      // mouse may no longer change what is painted
      if (!pinning && (!HighlightMode.live() || HighlightMode.frozen()))
        return;
      const lead = group[0];
      const cls = group.some(p => p.status !== "conformant")
            ? "shexjs-highlight-fail" : "shexjs-highlight-match";
      const schemaRanges = group.flatMap(constraintRanges)
            .concat(hoveredSide === "schema"
                    // connect a (possibly nested) constraint back to its
                    // labeled shape: enclosing predicates, then the label
                    ? group.flatMap(p => p.schemaPath || []).concat([lead.anchors && lead.anchors.shapeLabel])
                    : [])
            .filter(r => r);
      // object first, for the same reason: an entity page is thousands of
      // lines and the claim that matched is what the reader came to see
      const dataRanges = group.flatMap(p => [].concat(
        anchorRanges(p, "object"), anchorRanges(p, "subject"), anchorRanges(p, "predicate")));
      // ...and whatever else this group is about, in the panes it named:
      // the app's own two are merged above rather than highlighted twice,
      // since highlighting a pane replaces what it was showing
      const named = new Map();
      const seen = new Set();
      group.forEach(p => Object.keys(p.panes || {}).forEach(name => {
        // a range may say which parts of itself to paint -- a node of a JSON
        // tree is marked at its braces, leaving the inside to the nodes
        // inside it -- and several links may be about the same one
        const ranges = (p.panes[name] || []).filter(r => r).filter(r => {
          const key = name + " " + r.from + "-" + r.to;
          if (seen.has(key))
            return false;
          seen.add(key);
          return true;
        }).flatMap(r => r.parts || [r]);
        if (ranges.length)
          named.set(name, (named.get(name) || []).concat(ranges));
      }));
      const alsoIn = name => named.get(name) || [];
      schemaRanges.push.apply(schemaRanges, alsoIn("inputSchema"));
      dataRanges.push.apply(dataRanges, alsoIn("inputData"));
      named.forEach((ranges, name) => {
        const pane = name === "inputSchema" || name === "inputData"
              ? null : this.panes[name];
        if (!pane)
          return;
        // a highlight in a pane nobody can see is no highlight at all: the
        // panes of a screen's column take turns (schema, overlay), so the
        // one being pointed at comes forward -- as another data document
        // does above, and for the same reason
        if (hoveredSide !== name)
          this.showPaneTab(name);
        pane.highlight(ranges, cls, {scroll: hoveredSide !== name});
      });
      // don't auto-scroll the pane the mouse is in
      schemaPane.highlight(schemaRanges, cls, {scroll: hoveredSide !== "schema"});
      // the data may be in a document that isn't showing -- another entity
      // page, later another named graph -- so bring it forward.  Showing a
      // document can rebuild the pane (a new language), so ask for the pane
      // again rather than highlighting the one that was just destroyed.
      // ...unless the mouse is in the data pane, where switching would pull
      // the document out from under it: a data-side hover is already about
      // the document being pointed at
      const neighborhoods = hoveredSide === "data" ? null : this.app.neighborhoods;
      if (neighborhoods && lead.doc >= 0 && lead.doc !== neighborhoods.showing
          && dataRanges.length) {
        neighborhoods.show(lead.doc);
        const showingPane = this.panes.inputData;
        if (showingPane)
          showingPane.highlight(dataRanges, cls, {scroll: true});
        return showInResults(group, cls, hoveredSide !== "results");
      }
      if (dataPane)
        dataPane.highlight(dataRanges, cls, {scroll: hoveredSide !== "data"});
      showInResults(group, cls, hoveredSide !== "results");
    };
    // ctrl/cmd-click freezes what is under the mouse and scrolls every pane
    // to its counterpart -- the navigation half.  Clicking the frozen thing
    // again releases it.  (ctrl-click is the context menu on a Mac, so the
    // Mac spelling is cmd, which is what every IDE does for the same reason.)
    const freeze = (group, side) => evt => {
      if (!isPinGesture(evt))
        return false;            // an ordinary click: let the editor have it
      if (HighlightMode.frozen() && HighlightMode.pinned === group) {
        HighlightMode.unpin();
        wipe();
        return true;
      }
      HighlightMode.pin(group);
      show(group, side, true);   // scrolls the other panes: this is the travel
      return true;
    };
    this.pairHoverPaint = () => {
      if (HighlightMode.frozen())
        show(HighlightMode.pinned, null, true);
      else
        wipe();
    };
    schemaPane.setHoverRegions(
      [...bySchemaRange.values()].flatMap(group =>
        constraintRanges(group[0]).map(r => ({
          from: r.from, to: r.to,
          enter: () => show(group, "schema"),
          click: freeze(group, "schema"),
          title: () => this.pairTitle(group, "schema"),
        }))),
      clearAll);
    // Both the object and the predicate trigger data-side hovers -- but
    // only for results about the document on screen.  A range is an offset
    // into the document it was located in, so a pair from another document
    // would light up whatever text happens to sit at those offsets here.
    const showingDoc = this.app.neighborhoods ? this.app.neighborhoods.showing : -1;
    const shownHere = (p) => p.doc === undefined || p.doc < 0 || p.doc === showingDoc;
    if (dataPane)
      dataPane.setHoverRegions(
        pairs.filter(shownHere).flatMap(
          p => [].concat(anchorRanges(p, "object"), anchorRanges(p, "predicate"))
            .map(r => ({from: r.from, to: r.to,
                        enter: () => show([p], "data"),
                        click: freeze([p], "data"),
                        title: () => this.pairTitle([p], "data")}))),
        clearAll);
    // A pane a pair named is somewhere to hover from as well as somewhere
    // to light up: the reader may start at the AST and ask what made it.
    linkedPanes.forEach(name => {
      const pane = this.panes[name];
      if (!pane.setHoverRegions)
        return;
      // ...by range, the way the schema side groups by constraint: several
      // links may be about one node of a tree, and hovering it is asking
      // about all of them
      const byRange = new Map();
      pairs.filter(p => !p.secondary).forEach(p => ((p.panes || {})[name] || []).filter(r => r).forEach(r => {
        const key = r.from + "-" + r.to;
        if (!byRange.has(key))
          byRange.set(key, {range: r, group: []});
        byRange.get(key).group.push(p);
      }));
      pane.setHoverRegions(
        [...byRange.values()].map(({range, group}) => ({
          from: range.from, to: range.to,
          enter: () => show(group, name),
          click: freeze(group, name),
          title: () => this.pairTitle(group, name),
        })),
        clearAll);
    });
    // hovering a TestedTriple in an appinfo results pane highlights its
    // constraint in the schema and its triple in the data
    resultPanes.forEach(({pane, ranges}) => {
      if (!pane.setHoverRegions)
        return;
      pane.setHoverRegions(
        ranges.reduce((acc, r) => {
          const pair = pairs.find(p => p.triple === r.target);
          return pair
            ? acc.concat(termRanges(r).map(f => (
                {from: f.from, to: f.to,
                 enter: () => show([pair], "results"),
                 click: freeze([pair], "results"),
                 title: () => this.pairTitle([pair], "results")})))
            : acc;
        }, []),
        clearAll);
    });
    // turning the switch off, or releasing a pin, has to take the paint with
    // it -- the mouse may be nowhere near a region when either happens
    if (!this._repaintWired) {   // setPairHovers runs per validation
      this._repaintWired = true;
      HighlightMode.onChange(() => {
        if (this.pairHoverPaint)
          this.pairHoverPaint();
      });
    }
  }

  /**
   * What a hover has to say for itself, in a tooltip: over a constraint,
   * the triples it matched or failed; over a triple, the constraint it was
   * held to; over a result or a plugin's pane, both.  A failure says why
   * first.  Text is read from the documents the ranges are in, so it is
   * spelled as the reader wrote it.
   */
  pairTitle (group, side) {
    const lines = [];
    const said = new Set();
    const add = (line) => {
      if (line && !said.has(line)) {
        said.add(line);
        lines.push(line);
      }
    };
    const shown = group.slice(0, 6);
    shown.forEach(p => {
      if (p.status === "nonconformant" && p.message)
        add(p.message);
      if (side !== "schema")
        add(this.constraintText(p));
      if (side !== "data")
        add(this.tripleText(p));
    });
    if (group.length > shown.length)
      add("… and " + (group.length - shown.length) + " more");
    return lines.length ? lines.join("\n") : null;
  }

  /** a pair's constraint as written: its parts, where an inline shape's
   * body is left out (":s {" … "}") */
  constraintText (p) {
    const text = this.located ? this.located.text : this.app.Caches.inputSchema.selection.val();
    const parts = p.schemaParts || (p.schema ? [p.schema] : []);
    const said = parts.map(r => text.slice(r.from, r.to).trim()).filter(s => s);
    return said.length ? said.join(" … ") : null;
  }

  /** a pair's triple as written in its document; a nested subject or
   * object ([ … ]) is shown as its delimiters rather than its contents */
  tripleText (p) {
    const anchors = p.anchors;
    if (!anchors || !anchors.subject && !anchors.object)
      return null;
    const text = this.docText(p.doc);
    if (text === null)
      return null;
    const term = (name) => {
      const parts = anchors[name + "Parts"];
      if (parts && parts.length > 1)
        return text.slice(parts[0].from, parts[0].to) + " … " + text.slice(parts[1].from, parts[1].to);
      const r = anchors[name];
      return r ? text.slice(r.from, r.to) : null;
    };
    const said = ["subject", "predicate", "object"].map(term).filter(s => s);
    return said.length ? said.join(" ") : null;
  }

  /** the text of one of the data source's documents: the showing one from
   * the pane, which holds edits the stashed copy hasn't seen */
  docText (doc) {
    const neighborhoods = this.app.neighborhoods;
    const showing = neighborhoods ? neighborhoods.showing : -1;
    if (doc === undefined || doc < 0 || doc === showing)
      return this.app.Caches.inputData.selection.val();
    const documents = neighborhoods ? neighborhoods.documents() : [];
    return documents[doc] ? documents[doc].text : null;
  }

  /** Bring a pane forward where it is one of a set that take turns.
   *
   * A plugin may put two panes in one column with a tab each -- ShExReduce's
   * schema and the overlay hung on it -- and only one of them is showing.
   * Pointing at something in the other one has to say which one. */
  showPaneTab (name) {
    const cache = this.app.Caches[name];
    if (!cache || !cache.selection)
      return;
    const panel = cache.selection.closest("[data-tabset] > *");
    if (panel.length === 0)
      return;
    const set = panel.parent();
    if (!set.data("ui-tabs"))
      return;
    const at = set.children("div").index(panel[0]);
    if (at !== -1 && set.tabs("option", "active") !== at)
      set.tabs("option", "active", at);
  }

  /** highlight a shape's declaration in the schema pane */
  highlightShape (label) {
    const located = this.panes.inputSchema ? this.locateSchema() : null;
    if (!located)
      return;
    const range = located.locate.shape(label);
    this.panes.inputSchema.highlight(range ? [range] : []);
  }

  clearShapeHighlight () {
    if (this.panes.inputSchema)
      this.panes.inputSchema.clearHighlights();
  }

  /** the shape's declaration as written, for a tooltip: its first lines */
  shapeTitle (label) {
    const located = this.locateSchema();
    const range = located ? located.locate.shape(label) : null;
    return range ? firstLines(located.text.slice(range.from, range.to), 8) : null;
  }

  /** where a node is written in the data pane: the first statement it is
   * the subject of (a shape-map parser's term, string or literal object) */
  nodeRange (node) {
    const {inputData} = this.app.Caches;
    const located = this.locateData(inputData.selection.val());
    if (!located)
      return null;
    const ld = typeof node === "string" ? node
          : node && "@value" in node ? {value: node["@value"], type: node["@type"], language: node["@language"]}
          : null;
    return ld === null ? null : ShExWebApp.EditorServices.nodeRange(located, ld);
  }

  highlightNode (node) {
    const pane = this.panes.inputData;
    if (!pane)
      return;
    const range = this.nodeRange(node);
    pane.highlight(range ? [range] : []);
  }

  clearNodeHighlight () {
    if (this.panes.inputData)
      this.panes.inputData.clearHighlights();
  }

  /** the statement a node opens, as written, for a tooltip */
  nodeTitle (node) {
    const range = this.nodeRange(node);
    if (!range)
      return null;
    const text = this.app.Caches.inputData.selection.val();
    return firstLines(text.slice(range.from), 6, /(^|\s)\.\s*$/);
  }

  /**
   * The query map's pairs as hover regions: the shape side lights the
   * shape's declaration in the schema pane, the node side where the node
   * is written in the data pane, and each says what it points at.
   * Re-read whenever the map changes (enableShapeHover).
   */
  wireShapeMapHovers () {
    const pane = this.panes.shapeMap;
    if (!pane || !pane.setHoverRegions)
      return;
    const cache = this.app.Caches.shapeMap;
    const parsed = ShExWebApp.EditorServices.parseShapeMap(cache.selection.val() || "", this.shapeMapMetas(cache));
    const regions = [];
    (parsed.pairs || []).forEach((pair, i) => {
      const shape = parsed.locate.shape(i), node = parsed.locate.node(i);
      if (shape && typeof pair.shape === "string")
        regions.push({from: shape.from, to: shape.to,
                      enter: () => this.highlightShape(pair.shape),
                      title: () => this.shapeTitle(pair.shape)});
      // a term, not a triple pattern or an extension: those name a set
      if (node && (typeof pair.node === "string" || (pair.node && "@value" in pair.node)))
        regions.push({from: node.from, to: node.to,
                      enter: () => this.highlightNode(pair.node),
                      title: () => this.nodeTitle(pair.node)});
    });
    this.shapeMapRegions = regions;     // introspection for tests
    pane.setHoverRegions(regions, () => {
      this.clearShapeHighlight();
      this.clearNodeHighlight();
    });
  }

  /** hovering a shape lexical form (fixed-map inputs, result entries)
   * highlights its declaration */
  enableShapeHover () {
    const lexToLabel = (lex) => {
      try {
        const term = this.app.Caches.inputSchema.meta.lexToTerm(lex.trim());
        return typeof term === "string" ? term : null; // skip Start et al.
      } catch (e) {
        return null;
      }
    };
    $(document).on("mouseenter.shexjsEditors", ".inputShape, .shapeMap .schema", (evt) => {
      const elt = $(evt.currentTarget);
      const label = lexToLabel(elt.is("input") ? elt.val() : elt.text());
      if (label)
        this.highlightShape(label);
    }).on("mouseleave.shexjsEditors", ".inputShape, .shapeMap .schema", () => {
      this.clearShapeHighlight();
    });
    // the query map's own hovers follow its text: a pane raises keyup for
    // every change, the app's writes included
    $(document).on("keyup.shexjsEditors", "#queryMap", () => this.wireShapeMapHovers());
  }

  /** tear down every pane (restoring the textareas) and the hover handlers */
  destroy () {
    $(document).off(".shexjsEditors");
    Object.values(this.panes).forEach((pane: any) => pane && pane.destroy());
    this.panes = {};
  }
}

/** the first `max` lines of a text, for a tooltip; `stopAt` ends it early
 * at the first line matching (a statement's closing " ."), and an ellipsis
 * says when there was more */
function firstLines (text, max, stopAt?) {
  const lines = text.split("\n");
  const out = [];
  for (const line of lines) {
    if (out.length >= max) {
      out.push("…");
      break;
    }
    out.push(line);
    if (stopAt && stopAt.test(line))
      break;
  }
  return out.join("\n");
}
