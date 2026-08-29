/**
 * The shape map: the query map the reader writes, the edit map it expands
 * to, and the fixed map the validator is asked -- three texts and the
 * traffic between them.
 *
 * This is doc/ShExShapeMapCache.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */
class ShapeMapCache extends InterfaceCache {
    constructor(selection, caches, turtleParser, resultsWidget) {
        super(selection, null);
        this.tabsElement = $("#shapeMap-tabs");
        this.editMapSelector = "#editMap";
        this.editMap = $("#editMap");
        this.queryMap = $("#queryMap");
        this.fixedMap = $("#fixedMap");
        this.fixedMapTab = this.tabsElement.find('[href="#fixedMap-tab"]');
        this.caches = caches;
        this.resultsWidget = resultsWidget;
        this.meta.termToLex = (trm) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
        this.meta.lexToTerm = (lex) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
    }
    async parse(text) {
        this.removeEditMapPair(null);
        this.queryMap.val(text);
        this.copyQueryMapToEditMap();
        await this.copyEditMapToFixedMap();
    }
    ;
    async getItems() {
        throw Error("should not try to get manifest cache items");
    }
    /**
     * @return list of errors encountered
     */
    async copyEditMapToQueryMap() {
        if (this.editMap.attr("data-dirty") === "true") {
            const text = this.editMap.find(".pair").get().reduce((acc, queryPair) => {
                const node = $(queryPair).find(".focus").val();
                const shape = $(queryPair).find(".inputShape").val();
                if (!node || !shape)
                    return acc;
                const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "!" : "";
                return acc.concat([node + "@" + status + shape]);
            }, []).join(",\n");
            this.queryMap.empty().val(text);
            const ret = await this.copyEditMapToFixedMap();
            this.markEditMapClean();
            return ret;
        }
        else {
            return []; // no errors
        }
    }
    /**
     * Parse query map to populate editMap and fixedMap.
     * @returns list of errors. ([] means everything was good.)
     */
    async copyQueryMapToEditMap() {
        this.queryMap.removeClass("error");
        const written = this.queryMap.val();
        this.resultsWidget.clear();
        let currentAction = "parsing input schema";
        try {
            await this.caches.inputSchema.refresh();
            currentAction = "parsing input data";
            await this.caches.inputData.refresh();
            currentAction = "parsing Query Map";
            const smparser = ShExWebApp.ShapeMapParser.construct(this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
            let sm;
            try {
                sm = smparser.parse(written);
            }
            catch (e) {
                e.inputError = true;
                throw e;
            }
            this.removeEditMapPair(null);
            this.addEditMapPairs(sm.length ? sm : null);
            const ret = await this.copyEditMapToFixedMap();
            this.markEditMapClean();
            this.resultsWidget.clear();
            return ret;
        }
        catch (e) {
            this.queryMap.addClass("error");
            this.resultsWidget.failMessage(e, currentAction);
            this.makeFreshEditMap();
            return [e];
        }
    }
    makeFreshEditMap() {
        this.removeEditMapPair(null);
        this.addEditMapPairs(null, null);
        this.markEditMapClean();
        return [];
    }
    addEmptyEditMapPair(evt) {
        this.addEditMapPairs(null, $(evt.target).parent().parent());
        this.markEditMapDirty();
        return false;
    }
    addEditMapPairs(pairs, target) {
        const renderTP = (tp) => {
            const ret = ["subject", "predicate", "object"].map(k => {
                const ld = tp[k];
                if (ld === ShExWebApp.ShapeMap.Focus)
                    return "FOCUS";
                if (!ld) // ?? ShExWebApp.Uti.any
                    return "_";
                return ldToTurtle(ld, this.caches.inputData.meta.termToLex);
            });
            return "{" + ret.join(" ") + "}";
        };
        const startOrLdToTurtle = (term) => {
            return term === ShExWebApp.Validator.Start ? START_SHAPE_LABEL : ShExWebApp.ShExTerm.shExJsTerm2Turtle(term, this.caches.inputSchema.meta);
        };
        (pairs || [{ node: { type: "empty" } }]).forEach((pair) => {
            const nodeType = (typeof pair.node !== "object" || "@value" in pair.node)
                ? "node"
                : pair.node.type;
            let skip = false;
            let node, shape;
            switch (nodeType) {
                case "empty":
                    node = shape = "";
                    break;
                case "node":
                    node = ldToTurtle(pair.node, this.caches.inputData.meta.termToLex);
                    shape = startOrLdToTurtle(pair.shape);
                    break;
                case "TriplePattern":
                    node = renderTP(pair.node);
                    shape = startOrLdToTurtle(pair.shape);
                    break;
                case "Extension":
                    // whether this source can resolve it is settled when the map is
                    // used; writing it back out only needs its name
                    node = this.caches.inputData.writeQueryMapExtension(pair.node.language, pair.node.lexical);
                    shape = startOrLdToTurtle(pair.shape);
                    break;
                default:
                    this.resultsWidget.append($("<div/>").append($("<span/>").text("unrecognized ShapeMap:"), $("<pre/>").text(JSON.stringify(pair))).addClass("error"));
                    skip = true; // skip this entry.
                    break;
            }
            if (!skip) {
                const spanElt = $("<tr/>", { class: "pair" });
                const focusElt = $("<textarea/>", {
                    rows: '1',
                    type: 'text',
                    class: 'data focus'
                }).text(node).on("change", () => this.markEditMapDirty()); // bound: bare method loses `this`
                const joinerElt = $("<span>", {
                    class: 'shapeMap-joiner'
                }).append("@").addClass(pair.status);
                joinerElt.append($("<input>", { style: "border: none; width: .2em;", readonly: "readonly" }).val(pair.status === "nonconformant" ? "!" : " ").on("click", (evt) => {
                    const parent = $(evt.target).parent();
                    const status = parent.hasClass("nonconformant") ? "conformant" : "nonconformant";
                    parent.removeClass("conformant nonconformant");
                    parent.addClass(status);
                    $(evt.target).val(status === "nonconformant" ? "!" : "");
                    this.markEditMapDirty();
                    evt.preventDefault();
                }));
                // if (pair.status === "nonconformant") {
                //   joinerElt.append("!");
                // }
                const shapeElt = $("<input/>", {
                    type: 'text',
                    value: shape,
                    class: 'schema inputShape'
                }).on("change", () => this.markEditMapDirty()); // bound: bare method loses `this`
                const addElt = $("<button/>", {
                    class: "addPair",
                    title: "add a node/shape pair"
                }).text("+");
                const removeElt = $("<button/>", {
                    class: "removePair",
                    title: "remove this node/shape pair"
                }).text("-");
                addElt.on("click", (evt) => this.addEmptyEditMapPair(evt));
                removeElt.on("click", (evt) => this.removeEditMapPair(evt));
                spanElt.append([focusElt, joinerElt, shapeElt, addElt, removeElt].map((elt) => {
                    return $("<td/>").append(elt);
                }));
                if (target) {
                    target.after(spanElt);
                }
                else {
                    this.editMap.append(spanElt);
                }
            }
        });
        if (this.editMap.find(".removePair").length === 1)
            this.editMap.find(".removePair").css("visibility", "hidden");
        else
            this.editMap.find(".removePair").css("visibility", "visible");
        this.editMap.find(".pair").each((idx) => {
            this.addContextMenus(this.editMapSelector + " .pair:nth(" + idx + ") .focus", this.caches.inputData);
            this.addContextMenus(".pair:nth(" + idx + ") .inputShape", this.caches.inputSchema);
        });
        return false;
    }
    removeEditMapPair(evt) {
        this.markEditMapDirty();
        if (evt) {
            $(evt.target).parent().parent().remove();
        }
        else {
            this.editMap.find(".pair").remove();
        }
        if (this.editMap.find(".removePair").length === 1)
            this.editMap.find(".removePair").css("visibility", "hidden");
        return false;
    }
    markEditMapDirty() {
        this.editMap.attr("data-dirty", true);
    }
    markEditMapClean() {
        this.editMap.attr("data-dirty", false);
    }
    /* context menus
     * opts.applyChoice(currentValue, pickedKey) => newValue: how a picked menu
     *   item lands in the input (default: replace the whole value).
     * opts.menuPosition ($input, offset) => {x, y}: where to pop the menu up
     *   (default: just inside the input's top-left corner).
     */
    addContextMenus(inputSelector, cache, opts = {}) {
        const _ShapeMapCache = this;
        // !!! terribly stateful; only one context menu at a time!
        const DATA_HANDLE = 'runCallbackThingie';
        let terms = null, nodeLex = null, target, scrollLeft, m, addSpace = "";
        $(inputSelector).on('contextmenu', rightClickHandler);
        $.contextMenu({
            trigger: 'none',
            selector: inputSelector,
            build: ($trigger, e) => {
                // return callback set by the mouseup handler
                return $trigger.data(DATA_HANDLE)();
            }
        });
        async function buildMenuItemsPromise(elt, evt) {
            if (elt.hasClass("data")) {
                nodeLex = elt.val();
                const shapeLex = elt.parent().parent().find(".schema").val();
                // Would like to use SMParser but that means users can't fix bad SMs.
                /*
                  const sm = smparser.parse(nodeLex + '@START')[0];
                  const m = typeof sm.node === "string" || "@value" in sm.node
                  ? null
                  : tpToM(sm.node);
                */
                m = nodeLex.match(RegExp("^" + ParseTriplePattern() + "$"));
                if (m) {
                    target = evt.target;
                    const selStart = target.selectionStart;
                    scrollLeft = target.scrollLeft;
                    terms = [0, 1, 2].reduce((acc, ord) => {
                        if (m[(ord + 1) * 2 - 1] !== undefined) {
                            const at = acc.start + m[(ord + 1) * 2 - 1].length;
                            const len = m[(ord + 1) * 2] ? m[(ord + 1) * 2].length : 0;
                            return {
                                start: at + len,
                                tz: acc.tz.concat([[at, len]]),
                                match: acc.match === null && at + len >= selStart ?
                                    ord :
                                    acc.match
                            };
                        }
                        else {
                            return acc;
                        }
                    }, { start: 0, tz: [], match: null });
                    function norm(tz) {
                        return tz.map((t) => {
                            return typeof t === "string" && t.startsWith('!')
                                ? "- " + t.substr(1) + " -"
                                : _ShapeMapCache.caches.inputData.meta.termToLex(t); // !!check
                        });
                    }
                    const store = await _ShapeMapCache.caches.inputData.refresh();
                    const queryMapKeywords = ["FOCUS", "_"];
                    const getTermsFunctions = [
                        () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
                        () => { return norm(store.getPredicates()); },
                        () => { return queryMapKeywords.concat(norm(store.getObjects())); },
                    ];
                    if (terms.match === null)
                        return false; // prevent contextMenu from whining about an empty list
                    return listToCTHash(getTermsFunctions[terms.match]());
                }
                else if (nodeLex && shapeLex) {
                    try {
                        var smparser = ShExWebApp.ShapeMapParser.construct(_ShapeMapCache.meta.base, _ShapeMapCache.caches.inputSchema.meta, _ShapeMapCache.caches.inputData.meta);
                        var sm = smparser.parse(nodeLex + '@' + shapeLex)[0];
                        if (sm.node.type === "Extension") {
                            const obj = {};
                            obj[MENU_ITEM_materialize] = { name: MENU_ITEM_materialize };
                            const nodes = await _ShapeMapCache.caches.inputData.resolveQueryMapExtension(sm.node.language, sm.node.lexical);
                            // the flat hash every other branch returns: an {items: ...}
                            // around it is one menu entry called "items", which is what
                            // the query map's menu used to offer
                            return nodes.reduce((ret, term) => {
                                const name = _ShapeMapCache.caches.inputData.meta.termToLex(term);
                                ret[name] = { name: name };
                                return ret;
                            }, obj);
                        }
                    }
                    catch (e) {
                        _ShapeMapCache.resultsWidget.failMessage(e, "query");
                        return false;
                    }
                }
            }
            terms = nodeLex = null;
            try {
                return listToCTHash(await cache.getItems());
            }
            catch (e) {
                // _ShapeMapCache, as everywhere in this function: `this` is undefined
                // here, so a pane that would not parse threw instead of saying so
                _ShapeMapCache.resultsWidget.failMessage(e, cache === _ShapeMapCache.caches.inputSchema ? "parsing schema" : "parsing data");
                let items = {};
                const failContent = "no choices found";
                items[failContent] = failContent;
                return items;
            }
            // hack to emulate regex parsing product
            /*
              function tpToM (tp) {
              return [nodeLex, '{', lex(tp.subject), " ", lex(tp.predicate), " ", lex(tp.object), "", "}", ""];
              function lex (node) {
              return node === ShExWebApp.ShapeMap.Focus
              ? "FOCUS"
              : node === null
              ? "_"
              : _ShapeMapCache.caches.inputData.meta.termToLex(node);
              }
              }
            */
        }
        function ParseTriplePattern() {
            const uri = "<[^>]*>|[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]*";
            const literal = "((?:" +
                "'(?:[^'\\\\]|\\\\')*'" + "|" +
                "\"(?:[^\"\\\\]|\\\\\")*\"" + "|" +
                "'''(?:(?:'|'')?[^'\\\\]|\\\\')*'''" + "|" +
                "\"\"\"(?:(?:\"|\"\")?[^\"\\\\]|\\\\\")*\"\"\"" +
                ")" +
                "(?:@[a-zA-Z-]+|\\^\\^(?:" + uri + "))?)";
            const uriOrKey = uri + "|FOCUS|_";
            // const termOrKey = uri + "|" + literal + "|FOCUS|_";
            return "(\\s*{\\s*)(" +
                uriOrKey + ")?(\\s*)(" +
                uri + "|a)?(\\s*)(" +
                uriOrKey + "|" + literal + ")?(\\s*)(})?(\\s*)";
        }
        ;
        function rightClickHandler(e) {
            e.preventDefault();
            const $this = $(this);
            $this.off('contextmenu', rightClickHandler);
            // when the items are ready,
            const p = buildMenuItemsPromise($this, e);
            p.then((items) => {
                // store a callback on the trigger
                $this.data(DATA_HANDLE, () => {
                    return {
                        callback: menuCallback,
                        items: items
                    };
                });
                const _offset = $this.offset();
                $this.contextMenu(opts.menuPosition
                    ? opts.menuPosition($this, _offset)
                    : { x: _offset.left + 10, y: _offset.top + 10 });
                $this.on('contextmenu', rightClickHandler);
            });
        }
        const menuCallback = (key, options) => {
            if (cache.onLoad)
                cache.onLoad();
            if (key === MENU_ITEM_materialize) {
                var toAdd = Object.keys(options.items).filter((k) => {
                    return k !== MENU_ITEM_materialize;
                });
                $(options.selector).val(toAdd.shift());
                var shape = $(options.selector.replace(/focus/, "inputShape")).val();
                this.addEditMapPairs(toAdd.map((node) => {
                    return {
                        node: _ShapeMapCache.caches.inputData.meta.lexToTerm(node),
                        shape: _ShapeMapCache.caches.inputSchema.meta.lexToTerm(shape)
                    };
                }), null);
            }
            else if (options.items[key].ignore) { // ignore the event
            }
            else if (terms) {
                const term = terms.tz[terms.match];
                let val = nodeLex.substr(0, term[0]) +
                    key + addSpace +
                    nodeLex.substr(term[0] + term[1]);
                if (terms.match === 2 && !m[9])
                    val = val + "}";
                else if (term[0] + term[1] === nodeLex.length)
                    val = val + " ";
                $(options.selector).val(val);
                // target.scrollLeft = scrollLeft + val.length - nodeLex.length;
                target.scrollLeft = target.scrollWidth;
            }
            else {
                const $input = $(options.selector);
                $input.val(opts.applyChoice ? opts.applyChoice($input.val(), key) : key);
            }
        };
        function listToCTHash(items) {
            return items.reduce((acc, item) => {
                acc[item] = { name: item };
                return acc;
            }, {});
        }
    }
    /** getShapeMap -- zip a node list and a shape list into a ShapeMap
     * use {this.caches.inputData,this.caches.inputSchema}.meta.{prefix,base} to complete IRIs
     * @return array of encountered errors
     */
    /** Rebuild the Fixed Map from the Edit Map.
     *
     * Resolving a pair is asynchronous -- a triple pattern or a query map
     * extension asks the data source what it selects -- so two of these can
     * be in flight at once, which happens whenever anything changes twice in
     * quick succession (setting the data and then the query map, say).  Each
     * used to empty the table on the way in and append on the way out, so
     * both lots of rows survived: the map grew a stale copy of every pair it
     * had before.  Now the table is emptied by whichever run is still the
     * current one, at the point it has something to put there.
     */
    /**
     * Rebuild the Fixed Map, with the tab saying so while it happens.
     *
     * Said once however many rebuilds overlap, and unsaid however this one
     * ends.  It used to restore whatever the label said on the way in -- for
     * the second of two overlapping rebuilds, that is "resolving Fixed Map"
     * -- and to restore nothing at all when a pair would not resolve, which
     * is how a query map the data source cannot answer (`SPARQL '''…'''`
     * asked of a local store) left the tab running for the rest of the
     * session.
     */
    async copyEditMapToFixedMap() {
        if ((this.fixedMapRuns = (this.fixedMapRuns || 0) + 1) === 1) {
            this.fixedMapLabel = this.fixedMapTab.text();
            this.fixedMapTab.text("resolving Fixed Map").addClass("running");
        }
        try {
            return await this.resolveFixedMap();
        }
        finally {
            if (--this.fixedMapRuns === 0)
                this.fixedMapTab.text(this.fixedMapLabel).removeClass("running");
        }
    }
    async resolveFixedMap() {
        const generation = this.fixedMapGeneration = (this.fixedMapGeneration || 0) + 1;
        const getQuads = async (s, p, o) => {
            const get = s === ShExWebApp.ShapeMap.Focus ? "subject" : "object";
            return (await this.caches.inputData.refresh()).getQuads(mine(s), mine(p), mine(o)).map((t) => {
                return this.caches.inputData.meta.termToLex(t[get]); // count on unpublished N3.js id API
            });
            function mine(term) {
                return term === ShExWebApp.ShapeMap.Focus || term === ShExWebApp.ShapeMap.Wildcard
                    ? null
                    : term;
            }
        };
        const nodeShapePromises = this.editMap.find(".pair").get().reduce((acc, queryPair) => {
            $(queryPair).find(".error").removeClass("error"); // remove previous error markers
            const node = $(queryPair).find(".focus").val();
            const shape = $(queryPair).find(".inputShape").val();
            const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "nonconformant" : "conformant";
            if (!node || !shape)
                return acc;
            const smparser = ShExWebApp.ShapeMapParser.construct(this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
            try {
                const sm = smparser.parse(node + '@' + shape)[0];
                const added = typeof sm.node === "string" || "@value" in sm.node
                    ? Promise.resolve({ nodes: [node], shape: shape, status: status })
                    : sm.node.type === "Extension"
                        ? this.caches.inputData.resolveQueryMapExtension(sm.node.language, sm.node.lexical)
                            .then((terms) => ({ nodes: terms.map((term) => this.caches.inputData.meta.termToLex(term)), shape: shape }))
                        : getQuads(sm.node.subject, sm.node.predicate, sm.node.object)
                            .then((nodes) => Promise.resolve({ nodes: nodes, shape: shape, status: status }));
                return acc.concat(added);
            }
            catch (e) {
                // find which cell was broken
                try {
                    smparser.parse(node + '@' + "START");
                }
                catch (e) {
                    $(queryPair).find(".focus").addClass("error");
                }
                try {
                    smparser.parse("<>" + '@' + shape);
                }
                catch (e) {
                    $(queryPair).find(".inputShape").addClass("error");
                }
                this.resultsWidget.failMessage(e, "parsing Edit Map", node + '@' + shape);
                throw new FlowControlError("handled ShapeMap error");
            }
        }, []);
        const createEntry = (node, nodeTerm, shape, shapeTerm, status) => {
            const spanElt = $("<tr/>", { class: "pair",
                "data-node": nodeTerm,
                "data-shape": shapeTerm
            });
            const focusElt = $("<input/>", {
                type: 'text',
                value: node,
                class: 'data focus',
                disabled: "disabled"
            });
            const joinerElt = $("<span>", {
                class: 'shapeMap-joiner'
            }).append("@").addClass(status);
            if (status === "nonconformant") {
                joinerElt.addClass("negated");
                joinerElt.append("!");
            }
            const shapeElt = $("<input/>", {
                type: 'text',
                value: shape,
                class: 'schema inputShape',
                disabled: "disabled"
            });
            const removeElt = $("<button/>", {
                class: "removePair",
                title: "remove this node/shape pair"
            }).text("-");
            removeElt.on("click", (evt) => {
                // Remove related result.
                let href, result;
                if ((href = $(evt.target).closest("tr").find("a").attr("href"))
                    && (result = document.getElementById(href.substr(1))))
                    $(result).remove();
                // Remove FixedMap entry.
                $(evt.target).closest("tr").remove();
            });
            spanElt.append([focusElt, joinerElt, shapeElt, removeElt, $("<a/>")].map((elt) => {
                return $("<td/>").append(elt);
            }));
            this.fixedMap.append(spanElt);
            return spanElt;
        };
        const pairs = await Promise.all(nodeShapePromises);
        if (generation !== this.fixedMapGeneration)
            return []; // a later edit is already resolving; its rows are the ones to show
        this.fixedMap.find("tbody").empty();
        pairs.reduce((acc, pair) => {
            pair.nodes.forEach((node) => {
                const nodeTerm = this.caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
                let shapeTerm = this.caches.inputSchema.meta.lexToTerm(pair.shape);
                if (shapeTerm === ShExWebApp.Validator.Start)
                    shapeTerm = START_SHAPE_INDEX_ENTRY;
                const key = nodeTerm + "|" + shapeTerm;
                if (key in acc)
                    return;
                const spanElt = createEntry(node, nodeTerm, pair.shape, shapeTerm, pair.status);
                acc[key] = spanElt; // just needs the key so far.
            });
            return acc;
        }, {});
        // scroll inputs to right
        this.fixedMap.find("input").each((idx, focusElt) => {
            focusElt.scrollLeft = focusElt.scrollWidth;
        });
        return []; // no errors
    }
}
