/**
 * Validation in the worker, driven from the page: create a validator over
 * there, then ask it the fixed map, relaying what it reports as it goes.
 * Each of the two is a WorkerTask; what this class adds is what the
 * messages mean to the page -- results to render, tracker events, the
 * pages a slurp read, the queries a fetching source made.
 *
 * This is doc/RemoteShExValidator.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */
const USE_INCREMENTAL_RESULTS = true;
class RemoteShExValidator {
    constructor(loaded, schemaURL, inputData, renderer, onCancel, source, workerUrl) {
        this.renderer = renderer;
        this.onCancel = onCancel;
        this.workerUrl = workerUrl;
        this.created = new WorkerTask({
            button: $("#validate"),
            onCancel: this.onCancel,
            abortText: "validator creation aborted",
            request: Object.assign({
                request: "create",
                schema: loaded.schema,
                schemaURL: schemaURL,
                slurp: this.renderer.caches.inputData.neighborhoods.slurping(),
                // repairs: as for the in-page validator, what would make a failing
                // node conform (doc/error-normalization.md §4)
                options: { regexModule: $("#regexpEngine").val(), repairs: true },
            }, 
            // a source that fetches is named and rebuilt over there; one that
            // is handed its data hands it over
            source
                ? source
                : { data: inputData.getQuads().map(t => WorkerMarshalling.rdfjsTripleToJsonTriple(t)) }),
            // `created` resolves with the worker's results; `error` rejects
            workerUrl,
        }).ready();
    }
    async invoke(fixedMap, validationTracker, time, done, currentAction) {
        await this.created;
        const transportMap = fixedMap.map(function (ent) {
            return {
                node: ent.node,
                shape: ent.shape === ShExWebApp.Validator.Start ?
                    START_SHAPE_INDEX_ENTRY :
                    ent.shape
            };
        });
        const results = [];
        const caches = this.renderer.caches;
        const tracker = () => caches.inputData.queryTrackerController.queryTracker;
        return new WorkerTask({
            button: $("#validate"),
            onCancel: this.onCancel,
            abortText: "validation aborted",
            request: {
                request: "validate",
                queryMap: transportMap,
                options: { includeDoneResults: !USE_INCREMENTAL_RESULTS, track: LOG_PROGRESS },
            },
            handlers: {
                update: msg => {
                    if (!USE_INCREMENTAL_RESULTS)
                        throw Error('fix this code path; probably results=msg.data.(all?)results');
                    results.push(...msg.data.results);
                    msg.data.results.forEach(function (res) {
                        if (res.shape === START_SHAPE_INDEX_ENTRY)
                            res.shape = ShExWebApp.Validator.Start;
                    });
                    msg.data.results.forEach(entry => this.renderer.entry(entry));
                },
                recurse: msg => validationTracker.recurse(msg.data.x),
                known: msg => validationTracker.known(msg.data.x),
                enter: msg => validationTracker.enter(msg.data.point, msg.data.label),
                exit: msg => validationTracker.exit(msg.data.point, msg.data.label, msg.data.ret),
                done: (msg, task) => {
                    $("#results > .status").text("rendering results...").show();
                    if (!USE_INCREMENTAL_RESULTS) {
                        if ("solutions" in msg.data.results)
                            msg.data.results.solutions.forEach(this.renderEntry);
                        else
                            this.renderEntry(msg.data.results);
                    }
                    time = Date.now() - time;
                    $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms");
                    this.renderer.finish();
                    if (done) {
                        done();
                    }
                    task.resolve({ validationResults: results });
                },
                error: (msg, task) => {
                    const e = WorkerTask.errorOf(msg.data); // its name kept, so a plugin can know its own
                    $("#results > .status").text("validation errors:").show();
                    this.renderer.failure(e, currentAction);
                    console.error(e); // dump details to console.
                    if (done) {
                        done(e);
                    }
                    // ...and the validation is over: the error has been rendered, so
                    // this answers the way the page's own validator answers a failure
                    // it has reported.  Left unanswered, whoever asked for the
                    // validation waits for it forever -- and the app is holding the
                    // validate button down until it hears.
                    task.resolve({ validationError: e });
                },
                // A source that reads documents to answer with has them over there,
                // and the panes a slurp leaves are over here: these are the pages
                // that walk has read since the last lot.
                slurpedPages: msg => {
                    const neighborhoods = caches.inputData.neighborhoods;
                    (msg.data.pages || []).forEach(({ id, text }) => neighborhoods.addPageDocument(id, text));
                    if ((msg.data.pages || []).length)
                        neighborhoods.render();
                },
                // Query tracking: the tracker takes what a db reports, which is
                // RDF/JS (DbQueryTracker) -- so the marshalling a postMessage needed
                // is undone here, at the boundary that needed it, rather than in a
                // tracker that a local db also calls.
                startQuery: msg => {
                    if (tracker())
                        // the worker's token, not this tracker's: it is what the answer
                        // will arrive carrying
                        tracker().start(msg.data.isOut, WorkerMarshalling.jsonTermToRdfjsTerm(msg.data.term, RdfJs.DataFactory), msg.data.shapeLabel, msg.data.token);
                },
                finishQuery: msg => {
                    if (tracker())
                        tracker().end(msg.data.quads.map(t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, RdfJs.DataFactory)), msg.data.time, msg.data.token);
                },
                failedQuery: msg => {
                    if (tracker() && tracker().fail)
                        tracker().fail(Error(msg.data.message), msg.data.time, msg.data.token);
                },
            },
            workerUrl: this.workerUrl,
        }).ready();
    }
}
