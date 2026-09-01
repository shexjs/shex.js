/**
 * Where the app's state comes from and goes to: the query string it loads
 * and the permalink it writes, gists it creates and updates, downloads.
 * Mixed onto ShExBaseApp; see ShExBaseApp.js.
 *
 * This is doc/ShExBaseApp-links.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */
mixin(ShExBaseApp, {
    /**
     * Load URL search parameters
     */
    async loadSearchParameters() {
        // don't overwrite if we arrived here from going back and forth in history
        if (this.Caches.inputSchema.selection.val() !== "" || this.Caches.inputData.selection.val() !== "")
            return Promise.resolve();
        const iface = this.parseQueryString(location.search);
        this.toggleControlsArrow("down");
        $(".manifest li").text("no manifest schemas loaded");
        if ("examples" in iface) { // deprecated ?examples= interface
            iface.manifestURL = iface.examples;
            delete iface.examples;
        }
        if (!("manifest" in iface) && !("manifestURL" in iface)) {
            iface.manifestURL = ["../examples/manifest.json"];
        }
        // a gist-hosted manifest can be edited in place: reveal Menu → "/Update"
        const gistManifest = "manifestURL" in iface
            && iface.manifestURL[0].match(/^https:\/\/gist\.githubusercontent\.com\/([^\/]+)\/([0-9a-f]+)\/raw\/(?:([0-9a-f]+)\/)?/);
        if (gistManifest) {
            this.loadedGist = { owner: gistManifest[1], id: gistManifest[2], sha: gistManifest[3] };
            $("#updateGist").show();
        }
        // Load all known query parameters. Save load results into array like:
        /* [ [ "data", { "skipped": "skipped" } ],
           [ "manifest", { "fromUrl": { "url": "http://...", "data": "..." } } ], ] */
        // Plugins first, and one at a time: what one adds -- panes, and the
        // parameters and manifest keys that fill them -- has to be in
        // QueryParams before the walk below reads QueryParams.  ?plugin= and
        // ?pluginURL= are the same thing said two ways; a permalink writes the
        // second, and a person writes whichever they remember.
        await this.loadPlugins([].concat(iface.pluginURL || [], iface.plugin || []));
        const loadedAsArray = await Promise.all(this.QueryParams.map(async (input) => {
            const label = input.queryStringParm;
            const parm = label;
            if (input.earlyLoad)
                return [label, { skipped: "skipped" }];
            if (parm + "URL" in iface) {
                const url = iface[parm + "URL"][0];
                if (url.length > 0) { // manifest= loads no manifest
                    // !!! set anyways in asyncGet?
                    input.cache.url = url; // all fooURL query parms are caches.
                    try {
                        const got = await input.cache.asyncGet(url);
                        return [label, { fromUrl: got }];
                    }
                    catch (e) {
                        if ("fail" in input) {
                            input.fail(e);
                        }
                        else {
                            input.location.val(e.message);
                        }
                        this.resultsWidget.append($("<pre/>").text(e).addClass("error"));
                        return [label, { loadFailure: e instanceof Error ? e : Error(e) }];
                    }
                    ;
                }
            }
            else if (parm in iface) {
                const prepend = input.location.prop("tagName") === "TEXTAREA" ?
                    input.location.val() :
                    "";
                const value = prepend + (input.normalize
                    ? input.normalize(iface[parm].join(""))
                    : iface[parm].join(""));
                const origValue = input.location.val();
                try {
                    if ("cache" in input) {
                        await input.cache.set(value, location.href);
                    }
                    else {
                        input.location.val(prepend + value);
                        if (input.location.val() === null)
                            throw Error(`Unable to set value to ${prepend + value}`);
                    }
                    return [label, { literal: value }];
                }
                catch (e) {
                    input.location.val(origValue);
                    if ("fail" in input) {
                        input.fail(e);
                    }
                    this.resultsWidget.append($("<pre/>").text("error setting " + label + ":\n" + e + "\n" + value).addClass("error"));
                    return [label, { failure: e }];
                }
            }
            else if ("deflt" in input) {
                input.location.val(input.deflt);
                return [label, { deflt: "deflt" }]; // flag that it was a default
            }
            return [label, { skipped: "skipped" }];
        }));
        // convert loaded array into Object:
        /* { "data": { "skipped": "skipped" },
           "manifest": { "fromUrl": { "url": "http://...", "data": "..." } }, } */
        const loaded = loadedAsArray.reduce((acc, fromArray) => {
            acc[fromArray[0]] = fromArray[1];
            return acc;
        }, {});
        // Parse the shape-map using the prefixes and base.  What it reports is
        // rendered where the map is; this is called for what it fills in -- and
        // awaited, so that a link finishes loading with the map it named ready
        // to validate rather than still being built.  (It reports its errors
        // rather than throwing them, so a bad map is a message, not a failed
        // load.)
        if ($("#queryMap").val().trim().length > 0)
            await this.Caches.shapeMap.copyQueryMapToEditMap();
        else
            this.Caches.shapeMap.makeFreshEditMap();
        this.customizeInterface();
        $("body").keydown((e) => {
            const code = e.keyCode || e.charCode; // standards anyone?
            return !this.keyDownHandlers.find(h => h(e, code)); // if we find a handler, stop propagation
        });
        // A link that carries a schema does not validate on arrival.  It used to
        // say it did -- and threw a ReferenceError instead, for the two years
        // since these became methods of a class (`callValidator()`, with no
        // `this`), so nothing has ever run here.  Opening a link is not asking
        // for the walk behind it: a permalink may name an endpoint or a Wikibase,
        // where validating costs a hundred requests to somebody else's service.
        // Press validate.
        return loaded;
    },
    parseQueryString(query) {
        if (query[0] === '?')
            query = query.substr(1); // optional leading '?'
        const map = {};
        query.replace(/([^&,=]+)=?([^&,]*)(?:[&,]+|$)/g, (match, key, value) => {
            key = decodeURIComponent(key);
            value = decodeURIComponent(value);
            (map[key] = map[key] || []).push(value);
        });
        return map;
    },
    /**
     * update location with a current values of some inputs
     */
    async getPermalink() {
        let parms = [];
        // The map as it stands, whether or not the source can still answer it:
        // a link is about what is on screen, and a query map this source cannot
        // resolve -- a `SPARQL '''…'''` after a slurp handed the reader the
        // local store -- is still what the link should carry.  Failing to build
        // one leaves the menu with no link and says nothing about why.
        try {
            await this.Caches.shapeMap.copyEditMapToQueryMap();
        }
        catch (e) {
            // the query map keeps what it says, which is what goes in the link
        }
        parms = parms.concat(this.QueryParams.reduce((acc, input) => {
            let parm = input.queryStringParm;
            let val = input.location.val();
            // more than one plugin may be loaded, and the link has to bring
            // them all back
            if (input.cache && Array.isArray(input.cache.urls))
                return acc.concat(input.cache.urls.map(u => parm + "URL=" + encodeURIComponent(u)));
            if (input.cache && input.cache.url &&
                // Specifically avoid loading from DefaultBase?schema=blah
                // because that will load the HTML page.
                !input.cache.url.startsWith(DefaultBase)) {
                parm += "URL";
                val = input.cache.url;
            }
            return val.length > 0 ?
                acc.concat(parm + "=" + encodeURIComponent(val)) :
                acc;
        }, []));
        const s = parms.join("&");
        return location.origin + location.pathname + "?" + s;
    },
    /** Menu → "Create Gist": publish the inputs this app registered with a
     * manifest descriptor in its QueryParams (shex-simple: schema, data,
     * queryMap; shexmap adds staticVars, outputSchema, outputShapeMap) as a
     * github gist (modeled on
     * <https://gist.github.com/ericprud/4c2b0a7eac60e3b8eade6fd35215d715>)
     * and reload this page with ?manifestURL= pointing at the gist's
     * .manifest.yaml.  Texts over GIST_INLINE_LINES lines become separate
     * files (each descriptor's spillName) referenced by relative <key>URLs. */
    async createGist(evt) {
        if (evt)
            evt.preventDefault();
        this.toggleControls();
        const title = prompt("Title for this gist:", "");
        if (title === null)
            return null; // canceled
        const token = this.getGistToken();
        if (!token)
            return null;
        const files = await this.assembleGistFiles();
        const ghApi = this.ghApi.bind(this, token);
        try {
            const created = await ghApi("https://api.github.com/gists", "POST", { description: title || "ShEx validation example", public: true, files });
            localStorage.setItem(GIST_TOKEN_KEY, token);
            // sha-less raw URL: always the latest revision, and relative
            // schemaURL/dataURL/queryMapURL references resolve beside it (per-file
            // blob-sha raw_urls don't serve sibling files)
            const gistBase = `https://gist.githubusercontent.com/${created.owner.login}/${created.id}/raw/`;
            const simplePath = (location.pathname.match(/\/packages\/.*$/)
                || ["/packages/shex-webapp/doc/shex-simple.html"])[0];
            const md = `the [manifest](${created.html_url}#file-manifest-yaml) can be used in:\n`
                + `* ShEx.JS [shex-simple interface](https://shex.js.org${simplePath}`
                + `?manifestURL=${gistBase}.manifest.yaml)\n`;
            const mdName = `-${title ? title.replace(/[\/\\]/g, "-") + " " : ""}ShEx Validation Manifest.md`;
            const patched = await ghApi(created.url, "PATCH", { files: { [mdName]: { content: md } } });
            // pin the address bar's manifestURL to the created revision so the
            // permalink outlives later edits to the gist
            const manifestURL = "history" in patched && patched.history.length
                ? `${gistBase}${patched.history[0].version}/.manifest.yaml`
                : gistBase + ".manifest.yaml";
            const parms = this.QueryParams
                .filter(q => this.Getables.indexOf(q) === -1) // controls only; content comes from the gist
                .map(q => q.queryStringParm + "=" + encodeURIComponent(q.location.val()))
                .concat(["manifestURL=" + encodeURIComponent(manifestURL)]);
            const search = "?" + parms.join("&");
            // the created gist's address (a popup here proved to break the
            // reload); stashed so the reloaded page can log it again -- the
            // navigation clears the console
            const trace = `created gist: ${created.html_url} manifest: ${manifestURL}`;
            console.log(trace);
            try {
                sessionStorage.setItem(GIST_CREATED_KEY, trace);
            }
            catch (e) { /* private mode */ }
            location.search = search; // navigates: reload from the gist manifest
            return search; // for tests, which can't navigate
        }
        catch (e) {
            this.resultsWidget.failMessage(e, "creating gist");
            return null;
        }
    },
    /** Menu → "Update": publish the current state back to the gist this page's
     * manifestURL was loaded from (this.loadedGist, revealed by
     * loadSearchParameters), nulling spill-over files the new revision no
     * longer references, then reload pinned to the new revision (sha-less raw
     * URLs are CDN-cached, so reloading unpinned could show stale content). */
    async updateGist(evt) {
        if (evt)
            evt.preventDefault();
        this.toggleControls();
        if (!this.loadedGist)
            return null;
        const token = this.getGistToken();
        if (!token)
            return null;
        const files = await this.assembleGistFiles();
        const ghApi = this.ghApi.bind(this, token);
        try {
            const gistApiUrl = `https://api.github.com/gists/${this.loadedGist.id}`;
            const current = await ghApi(gistApiUrl, "GET");
            // this page may hold a revision somebody -- maybe this user in another
            // window -- has updated since
            if (this.loadedGist.sha && current.history && current.history.length
                && current.history[0].version !== this.loadedGist.sha
                && !confirm(`This page holds revision ${this.loadedGist.sha.substr(0, 7)}`
                    + ` but the gist has moved on to ${current.history[0].version.substr(0, 7)}.`
                    + ` Overwrite the newer revision?`))
                return null;
            for (const q of this.QueryParams)
                if (q.manifest && "spillName" in q.manifest
                    && q.manifest.spillName in current.files && !(q.manifest.spillName in files))
                    files[q.manifest.spillName] = null; // delete spill-overs now recorded inline
            const patched = await ghApi(gistApiUrl, "PATCH", { files });
            localStorage.setItem(GIST_TOKEN_KEY, token);
            const gistBase = `https://gist.githubusercontent.com/${this.loadedGist.owner}/${this.loadedGist.id}/raw/`;
            const manifestURL = "history" in patched && patched.history.length
                ? `${gistBase}${patched.history[0].version}/.manifest.yaml`
                : gistBase + ".manifest.yaml";
            const parms = this.QueryParams
                .filter(q => this.Getables.indexOf(q) === -1) // controls only; content comes from the gist
                .map(q => q.queryStringParm + "=" + encodeURIComponent(q.location.val()))
                .concat(["manifestURL=" + encodeURIComponent(manifestURL)]);
            const search = "?" + parms.join("&");
            const trace = `updated gist: ${current.html_url} manifest: ${manifestURL}`;
            console.log(trace);
            try {
                sessionStorage.setItem(GIST_CREATED_KEY, trace);
            }
            catch (e) { /* private mode */ }
            location.search = search; // navigates: reload from the updated manifest
            return search; // for tests, which can't navigate
        }
        catch (e) {
            if (/ 404 /.test(e.message))
                e.message += " (is this your gist? updating needs its owner's token)";
            this.resultsWidget.failMessage(e, "updating gist");
            return null;
        }
    },
    /** the github token Create/Update Gist use, prompted for once and
     * remembered in localStorage (cleared again by a 401 in ghApi) */
    getGistToken() {
        return localStorage.getItem(GIST_TOKEN_KEY)
            || prompt("Creating a gist requires a github token with \"gist\" scope\n"
                + "(menu → \"get token\" creates one; menu → \"instructions\" explains;\n"
                + "remembered in this browser's localStorage):");
    },
    async ghApi(token, url, method, body) {
        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json",
                "Accept": "application/vnd.github+json",
                "Authorization": "token " + token },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!resp.ok) {
            if (resp.status === 401)
                localStorage.removeItem(GIST_TOKEN_KEY); // stale token; re-prompt next time
            throw Error(`${method} ${url} → ${resp.status} ${await resp.text()}`);
        }
        return resp.json();
    },
    /** the files Create/Update Gist publish: .manifest.yaml holding one entry
     * built from the QueryParams manifest descriptors, plus a spill-over file
     * per input whose text is over GIST_INLINE_LINES lines */
    async assembleGistFiles() {
        await this.Caches.shapeMap.copyEditMapToQueryMap();
        const status = $("#results .fails").length ? "nonconformant" : "conformant";
        const files = {};
        const part = (parm, fileName, text) => {
            if (text.split("\n").length > GIST_INLINE_LINES) {
                files[fileName] = { content: text };
                return `  ${parm}URL: ${fileName}\n`;
            }
            return `  ${parm}: |\n` + text.replace(/\n+$/, "").split("\n")
                .map((l) => l.length ? "    " + l : "").join("\n") + "\n";
        };
        // each QueryParams entry with a manifest descriptor contributes to the
        // manifest entry, so each app's input registry declares what a gist records
        const yamlEntry = this.QueryParams.reduce((acc, q) => {
            if (!("manifest" in q))
                return acc;
            const m = q.manifest;
            if ("labelKey" in m)
                acc += `  ${m.labelKey}: ${m.label}\n`;
            const text = q.location.val();
            if (m.asYamlObject) {
                const obj = JSON.parse(text.trim() || "{}");
                return acc + (Object.keys(obj).length === 0
                    ? `  ${m.key}: {}\n`
                    : `  ${m.key}:\n` + Object.entries(obj).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}\n`).join(""));
            }
            if ("spillName" in m)
                return acc + part(m.key, m.spillName, text);
            return acc + `  ${m.key}: ${JSON.stringify(text)}\n`; // short scalar, quoted
        }, "") + `  status: ${status}\n`;
        files[".manifest.yaml"] = { content: "-" + yamlEntry.substring(1) };
        return files;
    },
    downloadResults(evt) {
        const typed = [
            { type: "text/plain", name: "results.txt" },
            { type: "application/json", name: "results.json" }
        ][$("#interface").val() === "appinfo" ? 1 : 0];
        const blob = new Blob([this.resultsWidget.text()], { type: typed.type });
        $("#download-results-button")
            .attr("href", window.URL.createObjectURL(blob))
            .attr("download", typed.name);
        this.toggleControls();
        console.log(this.resultsWidget.text());
    },
});
