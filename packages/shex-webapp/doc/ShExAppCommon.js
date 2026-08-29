/**
 * What the rest of the app's files share: its constants, the helpers that
 * read and write terms, the highlight-mode switch, the parsers the caches
 * use, the in-page validator driver, and the two classes that render a
 * validation's results.  The pages load the app as a sequence of classic
 * scripts, this one first; a top-level declaration here is in scope for
 * every script after it.
 *
 * This is doc/ShExAppCommon.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */
/** Methods for a class, from a file of their own.  Defined the way a class
 * body defines them (non-enumerable, writable), so a method reads the same
 * to the app and to a plugin whichever file it is in. */
function mixin(cls, methods) {
    Object.getOwnPropertyNames(methods).forEach(name => Object.defineProperty(cls.prototype, name, { value: methods[name], writable: true, configurable: true, enumerable: false }));
}
const START_SHAPE_LABEL = "START";
const INPUTAREA_TIMEOUT = 250;
const VALIDATE_LABEL = "validate (ctl-enter)";
const NO_MANIFEST_LOADED = "no manifest loaded";
const START_SHAPE_INDEX_ENTRY = "- start -";
// flip by hand for a per-step trace: makeConsoleTracker on this thread,
// track messages from the worker.  Not dead code; a debug tap.
const LOG_PROGRESS = false;
const SPARQL_get_items_limit = 50;
// heads the focus-node menu over a query map: take every node the query
// named, as a row each.  The query's materialize -- as a view is
// materialized -- and nothing to do with ShExMap's, which builds a graph.
const MENU_ITEM_materialize = "- materialize -";
const GIST_TOKEN_KEY = "githubGistToken";
const GIST_INLINE_LINES = 15;
const GIST_CREATED_KEY = "shexjsCreatedGist";
const DefaultBase = location.origin + location.pathname;
// this app's own results, once a plugin's results sit beside them
const APP_RESULTS_TAB = "validationResults";
let SharedForTests = null;
/** what is registered, or nothing where a page loaded no register */
function pluginDescriptors() {
    return typeof ShExPlugins === "undefined" ? [] : ShExPlugins.all();
}
/** every registered plugin's worker half, absolute: a worker resolves a
 * relative importScripts against its own script, not against the page */
function pluginWorkerUrls() {
    return pluginDescriptors().filter(ext => ext.worker)
        .map(ext => new URL(ext.worker, ext.baseUrl || DefaultBase).href);
}
function ldToTurtle(ld, termToLex) {
    return typeof ld === "object"
        ? lit(ld)
        : termToLex(ld.startsWith("_:")
            ? RdfJs.DataFactory.blankNode(ld.substr(2))
            : RdfJs.DataFactory.namedNode(ld));
    function lit(o) {
        let ret = "\"" + o["@value"].replace(/["\r\n\t]/g, (c) => {
            return { '"': "\\\"", "\r": "\\r", "\n": "\\n", "\t": "\\t" }[c];
        }) + "\"";
        if ("@type" in o)
            ret += "^^<" + o["@type"] + ">";
        if ("@language" in o)
            ret += "@" + o["@language"];
        return ret;
    }
}
/** Which spelling the messages use: see the `spelling` control. */
function termSpelling() {
    return $("#spelling").val() === "explicit" ? "explicit" : "document";
}
/**
 * How to spell a term in a report that isn't tied to a document range: the
 * human interface's indented tree, which is a block of text about a result
 * rather than a mark on a line.
 *
 * The editors do better than this -- they have the range the term was
 * written in, so they can quote it (see mapValidationErrors) -- but a block
 * of text has only the document's prefixes and base to go on, which is what
 * a data cache's meta is.  Shapes are named by the schema and left to it.
 */
function termLexerFor(dataCache) {
    if (termSpelling() !== "document")
        return undefined;
    const meta = dataCache && dataCache.meta;
    if (!meta || typeof meta.termToLex !== "function")
        return undefined;
    return (term, role) => {
        if (role === "shape")
            return null;
        try {
            const said = meta.termToLex(typeof term === "string"
                ? (term.startsWith("_:")
                    ? RdfJs.DataFactory.blankNode(term.substr(2))
                    : RdfJs.DataFactory.namedNode(term))
                : term);
            return typeof said === "string" && said !== "" ? said : null;
        }
        catch (e) {
            return null; // a term this document has no better name for
        }
    };
}
/**
 * The highlight switch: whether hovering a constraint, a triple or a binding
 * lights up its counterparts in the other panes.
 *
 * Three resting positions and a momentary override, which is AutoCAD's ortho
 * (F8 locks, Shift inverts) and Raskin's quasimode: a state your finger is
 * holding open is a state you cannot forget you are in.
 *
 *   on    highlight follows the mouse; holding Shift *suspends* it, so you
 *         can cross the panes to read a frozen highlight without disturbing it
 *   hold  quiet until you hold Shift, then live -- the accelerator position
 *   off   never, for readers who find it noisy
 *
 * Freezing is separate and stronger: a click pins what is showing, and the
 * mouse stops changing it until it is released (Escape, or a click on
 * something else).  That is the answer to the standing problem with linked
 * highlighting -- you cannot travel to the thing being pointed at without
 * losing the pointer.  Pinning also scrolls every pane to its counterpart,
 * which is the navigation half.
 */
/** The pin gesture, per platform.
 *
 * ctrl-click on a Mac is the context menu, so the Mac spelling is cmd --
 * which is what every IDE does, and for this reason.  Taking *both*
 * everywhere would mean Mac users raising a menu every time they pinned.
 */
const PIN_WITH_META = /Mac|iPhone|iPad|iPod/.test((typeof navigator === "undefined" ? "" : (navigator.platform || navigator.userAgent)));
function isPinGesture(evt) {
    const meta = !!(evt && evt.metaKey), ctrl = !!(evt && evt.ctrlKey);
    return PIN_WITH_META ? (meta && !ctrl) : (ctrl && !meta);
}
const HighlightMode = {
    ORDER: ["on", "hold", "off"],
    state: "on", // discoverable by default; see the note above
    held: false, // the momentary key is down
    pinned: null, // a frozen group, or null
    listeners: [],
    /** does a hover paint right now? */
    live() {
        if (this.state === "off")
            return false;
        return this.state === "hold" ? this.held : !this.held;
    },
    /** ...and is what is painted allowed to change? */
    frozen() { return this.pinned !== null; },
    set(state) {
        if (this.ORDER.indexOf(state) === -1 || state === this.state)
            return;
        this.state = state;
        this.changed();
    },
    cycle() {
        this.set(this.ORDER[(this.ORDER.indexOf(this.state) + 1) % this.ORDER.length]);
    },
    setHeld(held) {
        if (held === this.held)
            return;
        this.held = held;
        this.changed();
    },
    pin(group) { this.pinned = group || null; this.changed(); },
    unpin() { if (this.pinned !== null) {
        this.pinned = null;
        this.changed();
    } },
    onChange(fn) { this.listeners.push(fn); },
    changed() {
        this.render();
        this.listeners.forEach(fn => { try {
            fn(this);
        }
        catch (e) {
            console.warn(e);
        } });
    },
    /** the chip: what the switch is set to, and whether anything is frozen */
    render() {
        const chip = $("#highlightMode");
        if (chip.length === 0)
            return;
        const live = this.live();
        const says = { on: "highlight: on", hold: "highlight: hold ⇧", off: "highlight: off" }[this.state];
        chip.text(says + (this.frozen() ? " · frozen" : ""))
            .attr("data-state", this.state)
            .attr("data-live", live ? "yes" : "no")
            .attr("data-frozen", this.frozen() ? "yes" : "no")
            .attr("aria-pressed", live ? "true" : "false")
            .attr("title", "hovering a constraint, triple or binding lights up its counterparts"
            + "\n\non — follows the mouse (hold ⇧ to suspend)"
            + "\nhold — only while ⇧ is held"
            + "\noff — never"
            + "\n\nclick to cycle, or ctrl-alt-h"
            + "\n" + (PIN_WITH_META ? "⌘" : "ctrl")
            + "-click a highlight to freeze it and go there; Escape releases");
    },
    /** the chip, the keystroke, and the momentary key */
    wire() {
        $("#highlightMode").off("click").on("click", () => this.cycle());
        $(document).on("keydown.highlightMode", evt => {
            if (evt.key === "Shift")
                this.setHeld(true);
            // ctrl-alt-h: rare in browsers, and the app already speaks ctrl-<key>
            if ((evt.ctrlKey || evt.metaKey) && evt.altKey && (evt.key === "h" || evt.key === "H")) {
                evt.preventDefault();
                this.cycle();
            }
            if (evt.key === "Escape" && this.frozen())
                this.unpin();
        });
        $(document).on("keyup.highlightMode", evt => {
            if (evt.key === "Shift")
                this.setHeld(false);
        });
        // a modifier released while the window was away never reaches us
        $(window).on("blur.highlightMode", () => this.setHeld(false));
        this.render();
    },
};
/** attempt to disable scrolling if not at bottom of target.
 * tried both selectionState and scrollTop.
 */
function noScrollAppend(target, toAdd) {
    var e = target.get(0);
    // var oldLen = target.val().length
    // var oldSel = target.prop("selectionStart");
    // var oldScrollTop = e.scrollTop;
    // var oldScrollHeight = e.scrollHeight;
    target.val((i, text) => {
        return text + toAdd;
    });
    // console.log(oldScrollTop, oldScrollHeight);
    // if (oldScrollTop === oldScrollHeight) {
    e.scrollTop = e.scrollHeight;
    //   target.prop("selectionStart", target.val().length);
    // } else {
    //   target.prop("selectionStart", oldScrollTop);
    // }
    // if (oldSel === oldLen) {
    //   e.scrollTop = e.scrollHeight;
    //   target.prop("selectionStart", target.val().length);
    // } else {
    //   target.prop("selectionStart", oldSel);
    // }
}
/** mark an exception as caused by user input (ShExC/Turtle/ShapeMap text):
 * it renders in the results widget and editor diagnostics but stays off
 * console.error, which is reserved for programming errors. */
function asInputError(e) {
    e.inputError = true;
    return e;
}
class ShExCParser {
    constructor() {
        this.shexParserOptions = { index: true, duplicateShape: "abort" };
        this.shexParser = ShExWebApp.Parser.construct(DefaultBase, null, this.shexParserOptions);
    }
    parseString(text, meta, base) {
        this.shexParserOptions.duplicateShape = $("#duplicateShape").val();
        this.shexParser._setBase(base);
        let ret;
        try {
            ret = this.shexParser.parse(text);
        }
        catch (e) {
            throw asInputError(e);
        }
        // ret = ShExWebApp.Util.canonicalize(ret, DefaultBase);
        meta.base = ret._base; // base set above.
        meta.prefixes = ret._prefixes || {}; // @@ revisit after separating shexj from meta and indexes
        return ret;
    }
}
class TurtleParser {
    constructor() {
        this.blankNodeId;
        // Re-use BNode IDs for good(-enough) user experience. Recipe from:
        // https://github.com/rdfjs/N3.js/blob/520054a9fb45ef48b5b58851449942493c57dace/test/N3Parser-test.js#L6-L11
        RdfJs.Parser.prototype._blankNode = name => RdfJs.DataFactory.blankNode(name || `b${this.blankNodeId++}`);
    }
    parseString(text, meta, base) {
        const ret = new RdfJs.Store();
        this.blankNodeId = 0;
        RdfJs.Parser._resetBlankNodePrefix();
        const parser = new RdfJs.Parser({
            baseIRI: base,
            format: "text/turtle",
            blankNodePrefix: ""
        });
        let quads;
        try {
            quads = parser.parse(text);
        }
        catch (e) {
            throw asInputError(e);
        }
        if (quads !== undefined)
            ret.addQuads(quads);
        meta.base = parser._base;
        meta.prefixes = parser._prefixes;
        return ret;
    }
    /** Several documents, one graph.  A source may hold more than one -- a
     * patient here, an observation about them there -- and they still make a
     * single store to validate against.  Each parses on its own, though:
     * prefixes belong to the document that declares them, and so do blank
     * nodes, which two documents may both call _:x without meaning the same
     * node.  So later documents' blank nodes are renamed apart.
     */
    parseDocuments(texts, meta, base) {
        if (texts.length <= 1)
            return this.parseString(texts[0] || "", meta, base);
        const ret = new RdfJs.Store();
        const prefixes = {};
        texts.forEach((text, index) => {
            const one = {};
            const store = this.parseString(text, one, base);
            const scope = (term) => term.termType !== "BlankNode" ? term
                : RdfJs.DataFactory.blankNode("d" + index + "_" + term.value);
            ret.addQuads(store.getQuads().map(q => index === 0 ? q : RdfJs.DataFactory.quad(scope(q.subject), q.predicate, scope(q.object), q.graph)));
            // the first declaration of a prefix wins, as it would in one document
            for (const [prefix, iri] of Object.entries(one.prefixes || {}))
                if (!(prefix in prefixes))
                    prefixes[prefix] = iri;
            if (index === 0)
                meta.base = one.base;
        });
        meta.prefixes = prefixes;
        return ret;
    }
    termToLd(lex, resolver) {
        let nz;
        try {
            nz = new RdfJs.Lexer().tokenize(lex + " ");
        }
        catch (e) {
            throw asInputError(e);
        }
        switch (nz[0].type) {
            case "IRI": return resolver._resolveAbsoluteIRI(nz[0]);
            case "prefixed": return expand(nz[0]);
            case "blank": return "_:" + nz[0].value;
            case "literal": {
                const ret = { value: nz[0].value };
                switch (nz[1].type) {
                    case "typeIRI":
                        ret.type = resolver._resolveAbsoluteIRI(nz[1]);
                        break;
                    case "type":
                        ret.type = expand(nz[1]);
                        break;
                    case "langcode":
                        ret.language = nz[1].value;
                        break;
                    default: throw Error(`unknow N3Lexer literal term type ${nz[1].type}`);
                }
                return ret;
            }
            default: throw Error(`unknow N3Lexer term type ${nz[0].type}`);
        }
        function expand(token) {
            if (!(token.prefix in resolver.meta.prefixes))
                throw Error(`unknown prefix ${token.prefix} in ${lex}`);
            return resolver.meta.prefixes[token.prefix] + token.value;
        }
    }
}
class DirectShExValidator {
    constructor(loaded, inputData, renderer) {
        this.validator = new ShExWebApp.Validator(loaded.schema, inputData, {
            results: "api",
            regexModule: ShExWebApp[$("#regexpEngine").val()],
            ignoreClosed: $("#ignoreClosed").is(":checked"),
            // what would make a failing node conform, said as arcs to add and
            // arcs to drop (doc/error-normalization.md §4).  The editors pin
            // each on the constraint it is about; the results say it in words.
            repairs: true,
        });
        // each: the element is the argument, and an arrow function's `this`
        // is this constructor's -- so this read `undefined.register` for as
        // long as anyone has been able to load one
        $(".pluginControl:checked").each((i, elt) => {
            $(elt).data("code").register(this.validator, ShExWebApp);
        });
        // ...and a plugin that is on the page rather than in the menu says the
        // same thing in its descriptor.  One or the other: a handler-only
        // module gets a menu control, a descriptor gets this.
        pluginDescriptors().forEach(ext => {
            if (typeof ext.register !== "function")
                return;
            try {
                ext.register(this.validator, ShExWebApp);
            }
            catch (e) {
                console.error(e); // a handler that won't register is not a validation error
            }
        });
        this.renderer = renderer;
    }
    async invoke(fixedMap, validationTracker, time, _done, _currentAction) {
        // ...async: a db that fetches answers with a promise, and the search
        // stops at the fetch rather than blocking on it.  Given a db that
        // doesn't, this is one traversal and one await, so it is right either
        // way and the caller doesn't have to know which it has.
        const ret = await this.validator.validateShapeMapAsync(fixedMap, validationTracker);
        time = Date.now() - time;
        $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms");
        $("#results > .status").text("rendering results...").show();
        await Promise.all(ret.map(entry => this.renderer.entry(entry)));
        this.renderer.finish();
        return { validationResults: ret }; // for tester or whoever is awaiting this promise
    }
}
// Root error class to signal to ResultsWidget that is an expected error.
class FlowControlError extends Error {
}
// Control results area content.
let LastFailTime = 0;
class ResultsWidget {
    constructor(target = "#results > div") {
        this.setTarget(target);
        // appinfo renderings: [{pane, ranges}] linking TestedTriple objects (by
        // identity) to their {from, to} in the rendered results JSON
        this.resultPanes = [];
    }
    /** Where results are written.  An app with two kinds of results -- a
     * validation and a materialization of it -- gives each its own panel and
     * points the widget at whichever it is filling. */
    setTarget(target) {
        this.resultsSel = $(target);
        this.resultsElt = this.resultsSel.get(0);
        return this;
    }
    /** A result pane used to reach for the bottom of the window, so that the
     * inputs and the results stayed visible together.  The page is divided
     * for that now -- panes above, results below, the reader dragging the
     * line between them -- and a results tab is what scrolls, so a pane
     * measured against the window overshoots the box it is in. */
    fitPaneToWindow(paneDom) {
        paneDom.style.height = "";
    }
    /** Bring the result an anchor names into view, when the results share an
     * editor.  Returns false if nothing here knows that anchor, leaving the
     * browser to scroll to an element with that id -- which is how results
     * that are each their own element have always worked. */
    scrollToResult(anchor) {
        // a browser may hand back the fragment as it was written or percent-
        // decoded, and these anchors are node@shape with both encoded
        const spellings = [anchor];
        try {
            spellings.push(decodeURIComponent(anchor));
        }
        catch (e) { /* not valid percent-encoding: the one spelling, then */ }
        for (const { pane, offsets } of this.resultPanes)
            for (const spelling of spellings)
                if (offsets && spelling in offsets) {
                    pane.scrollTo(offsets[spelling]);
                    return true;
                }
        return false;
    }
    /** Every result pane was built before it was in the document and has just
     * been given a height, so none of them has measured anything real yet.
     * Left alone they draw a gutter for a viewport that never existed. */
    remeasurePanes() {
        this.resultPanes.forEach(({ pane }) => pane.requestMeasure && pane.requestMeasure());
    }
    replace(text) {
        return this.resultsSel.text(text);
    }
    append(text) {
        return this.resultsSel.append(text);
    }
    clear() {
        this.resultPanes = [];
        this.resultsSel.removeClass("passes fails error");
        $("#results > .status").text("").hide();
        $("#shapeMap-tabs").removeAttr("title");
        return this.resultsSel.text("");
    }
    start() {
        this.resultsSel.removeClass("passes fails error");
        $("#results").addClass("running");
    }
    finish() {
        $("#results").removeClass("running");
        const height = this.resultsSel.height();
        this.resultsSel.height(1);
        // ...and give the height back to the stylesheet when it lands: the
        // results fill their tab, and an animated pixel height would pin them
        this.resultsSel.animate({ height: height }, 100, () => this.resultsSel.css("height", ""));
    }
    text() {
        // CodeMirror virtualizes long documents, so read appinfo panes' raw text
        return $(this.resultsElt).children().map((_, el) => $(el).data("rawText") !== undefined ? $(el).data("rawText") : el.textContent).get().join("\n");
    }
    failMessage(e, action, text) {
        if (e instanceof FlowControlError)
            return;
        if (e.inputError) // user-input (ShExC/Turtle/ShapeMap) problems render in
            console.debug("input error " + action + ":", e.message); // the UI; only
        else // programming errors deserve the console error channel
            console.error(e);
        $("#results > .status").empty().text("Errors encountered:").show();
        const div = $("<div/>").addClass("error");
        div.append($("<h3/>").text("error " + action + ":\n"));
        div.append($("<pre/>").text(e.message));
        if (text)
            div.append($("<pre/>").text(text));
        this.append(div);
        LastFailTime = new Date().getTime();
    }
}
class ShExResultsRenderer {
    constructor(resultsWidget, caches) {
        this.resultsWidget = resultsWidget;
        this.caches = caches;
        this.entries = []; // collected for editor diagnostics (EditorSupport)
        this.appinfo = []; // results held back to share one editor
    }
    async entry(entry) {
        this.entries.push(entry);
        const fails = entry.status === "nonconformant";
        // locate FixedMap entry
        const shapeString = entry.shape === ShExWebApp.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
        const fixedMapEntry = $("#fixedMap .pair" +
            "[data-node='" + entry.node + "']" +
            "[data-shape='" + shapeString + "']");
        const klass = (fails !== fixedMapEntry.find(".shapeMap-joiner").hasClass("nonconformant")) ? "fails" : "passes";
        const resultStr = fails ? "✗" : "✓";
        let elt = null;
        if (!fails) {
            if ($("#success").val() === "query" || $("#success").val() === "remainder") {
                const proofStore = new RdfJs.Store();
                ShExWebApp.Util.getProofGraph(entry.appinfo, proofStore, RdfJs.DataFactory);
                entry.graph = proofStore.getQuads();
            }
            if ($("#success").val() === "remainder") {
                const remainder = new RdfJs.Store();
                remainder.addQuads((await this.caches.inputData.refresh()).getQuads());
                entry.graph.forEach(q => remainder.removeQuad(q));
                entry.graph = remainder.getQuads();
            }
        }
        if (entry.graph) {
            const wr = new RdfJs.Writer(this.caches.inputData.meta);
            wr.addQuads(entry.graph);
            wr.end((error, results) => {
                if (error)
                    throw error;
                entry.turtle = ""
                    + "# node: " + entry.node + "\n"
                    + "# shape: " + entry.shape + "\n"
                    + results.trim();
                elt = $("<pre/>").text(entry.turtle).addClass(klass);
            });
            delete entry.graph;
        }
        else {
            let renderMe = entry;
            switch ($("#interface").val()) {
                case "human":
                    elt = $("<div class='human'/>").append($("<span/>").text(resultStr), $("<span/>").text(`${ldToTurtle(entry.node, this.caches.inputData.meta.termToLex)}@${fails ? "!" : ""}${this.caches.inputSchema.meta.termToLex(entry.shape)}`)).addClass(klass);
                    if (fails)
                        elt.append($("<pre>").text(ShExWebApp.Util.errsToSimple(entry.appinfo, this.caches.inputSchema.meta.prefixes, { lex: termLexerFor(this.caches.inputData),
                            base: this.caches.inputSchema.meta.base }).join("\n")));
                    break;
                case "minimal":
                    if (fails)
                        entry.reason = ShExWebApp.Util.errsToSimple(entry.appinfo, this.caches.inputSchema.meta.prefixes, { lex: termLexerFor(this.caches.inputData),
                            base: this.caches.inputSchema.meta.base }).join("\n");
                    renderMe = Object.keys(entry).reduce((acc, key) => {
                        if (key !== "appinfo")
                            acc[key] = entry[key];
                        return acc;
                    }, {});
                    elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
                    break;
                default: // appinfo: the whole JSON, in an editor if there is one
                    if (this.editorsOn()) {
                        // held back: all the results go into one editor at finish(), the
                        // way they read as one array
                        this.appinfo.push({ renderMe, klass, entry });
                        elt = null;
                    }
                    else {
                        elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
                    }
            }
        }
        if (elt)
            this.resultsWidget.append(elt);
        // update the FixedMap.  Its check mark links to this result: an element
        // id where each result is an element, an offset into the editor where
        // they share one (see renderAppinfo).
        fixedMapEntry.addClass(klass).find("a").text(resultStr);
        const nodeLex = fixedMapEntry.find("input.focus").val();
        const shapeLex = fixedMapEntry.find("input.inputShape").val();
        const anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
        if (elt)
            elt.attr("id", anchor);
        else
            this.appinfo[this.appinfo.length - 1].anchor = anchor;
        fixedMapEntry.find("a").attr("href", "#" + anchor);
        fixedMapEntry.attr("title", entry.elapsed + " ms");
    }
    /** are the language-aware editors on?  They are what the app is unless
     * the reader asked for textareas, and the results follow the rest of the
     * interface: editors everywhere, or textareas and <pre>s everywhere. */
    editorsOn() {
        return "EditorPanes" in ShExWebApp && $("#editors").val() !== "textarea";
    }
    /** One editor holding every result, as the array they are.
     *
     * They used to be one editor each with the punctuation of an array
     * written between them, which is what the Fixed Map's check marks
     * scrolled to.  Now the array is the editor's document, and a check mark
     * scrolls to its result's offset within it.
     */
    renderAppinfo() {
        if (this.appinfo.length === 0)
            return;
        const results = this.appinfo.map(({ renderMe }) => renderMe);
        try {
            const { text, ranges } = ShExWebApp.EditorServices.stringifyWithOffsets(results, o => o && (o.type === "TestedTriple" || results.indexOf(o) !== -1));
            // the pane takes its colours from where it is put, so put it there
            // first: an unattached div has no computed style to read
            const klass = this.appinfo.every(({ klass }) => klass === "passes") ? "passes" : "fails";
            const elt = $("<div/>").addClass(klass).addClass("results").data("rawText", text);
            this.resultsWidget.append(elt);
            const pane = ShExWebApp.EditorPanes.makeJsonPane(text, { colorsFrom: elt[0] });
            elt.append(pane.dom);
            this.resultsWidget.fitPaneToWindow(pane.dom);
            pane.requestMeasure(); // now that it is attached and sized
            // where each result starts, by the anchor its check mark links to
            const offsets = {};
            this.appinfo.forEach(({ renderMe, anchor }) => {
                const range = ranges.find(r => r.target === renderMe);
                if (range && anchor !== undefined)
                    offsets[anchor] = range.from;
            });
            this.resultsWidget.resultPanes.push({
                pane,
                ranges: ranges.filter(r => r.target && r.target.type === "TestedTriple"),
                offsets,
            });
        }
        catch (e) {
            console.warn("falling back to plain results JSON:", e);
            this.appinfo.forEach(({ renderMe, klass, anchor }) => this.resultsWidget.append($("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass).attr("id", anchor)));
        }
    }
    finish(done) {
        // a source that read documents to answer with hands them back, so a
        // slurp leaves the entity pages it visited as panes to edit
        const neighborhoods = this.caches.inputData.neighborhoods;
        const db = this.caches.inputData.parsed;
        if (neighborhoods && neighborhoods.slurping()) {
            if (db && typeof db.loadedPages === "function") {
                for (const { id, text } of db.loadedPages())
                    neighborhoods.addPageDocument(id, text);
                neighborhoods.render();
            }
            // the triples went in as they arrived (makeQueryTracker), so what is
            // left is to show it and to parse what was written
            neighborhoods.showSlurped();
            this.caches.inputData.refresh();
        }
        this.renderAppinfo();
        $("#results > .status").text("rendering results...").show();
        // Results used to be punctuated into a JSON array -- "[" before the
        // first, "," between -- which `$("#results div *")` did by appending to
        // every *descendant* of the results.  Once a result is an editor rather
        // than a <pre> that is every line and every gutter element of it, which
        // is where the commas in the gutter came from.  One result per block,
        // separated by a rule, says the same thing without writing into
        // somebody else's DOM.
        $("#results > .status").hide();
        // for debugging values and schema formats:
        // try {
        //   const x = ShExWebApp.Util.valToValues(ret);
        //   // const x = ShExWebApp.Util.ShExJtoAS(valuesToSchema(valToValues(ret)));
        //   res = this.resultsWidget.replace(JSON.stringify(x, null, "  "));
        //   const y = ShExWebApp.Util.valuesToSchema(x);
        //   res = this.resultsWidget.append(JSON.stringify(y, null, "  "));
        // } catch (e) {
        //   console.dir(e);
        // }
        if (this.caches.editorSupport)
            this.caches.editorSupport.reportValidation(this.entries);
        this.resultsWidget.finish();
    }
    failure(e, action, text) {
        this.resultsWidget.failMessage(e, action, text);
    }
}
