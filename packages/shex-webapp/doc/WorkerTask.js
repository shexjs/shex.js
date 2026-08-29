/**
 * One request to the page's worker, from the button that starts it to the
 * answer -- the shape a validation and a materialization share.
 *
 *   const results = await new WorkerTask({
 *     button: $("#validate"), onCancel, abortText: "validation aborted",
 *     request: {request: "validate", queryMap, options},
 *     handlers: {
 *       update (msg) { … },                       // a message the task is not over after
 *       done (msg, task) { task.resolve(what) },  // ...and one it is
 *     },
 *     workerUrl,
 *   }).ready();
 *
 * While the task runs the button reads "abort" and stops it; when it is
 * over the button is itself again.  Every message the worker posts is
 * handed to the handler named by its `response`; a handler ends the task
 * with `task.resolve(value)` or `task.reject(error)`, and one that does
 * neither leaves it running (a materialization reports a node's errors
 * and goes on).  Where there is no handler, `done` and `created` resolve
 * with `msg.data.results`, `error` rejects with the Error the worker
 * described (its name kept, so a plugin can know its own), and anything
 * else rejects as unexpected.
 *
 * This is doc/WorkerTask.js's source (tsconfig.app.json compiles src/app/ into
 * doc/); edit here and run `npm run build`.
 */
class WorkerTask {
    constructor({ button, onCancel, abortText, request, handlers, workerUrl }) {
        this.button = button;
        this.restoreText = button.text();
        this.onCancel = onCancel;
        this.abortText = abortText;
        this.request = request;
        this.handlers = handlers || {};
        this.workerUrl = workerUrl;
    }
    ready() {
        return new Promise((resolve, reject) => {
            this.settle = { resolve, reject };
            this.button.addClass("stoppable").text("abort (ctl-enter)");
            this.button.off();
            this.button.on("click", evt => this.cancel(evt));
            ShExWorker.onmessage = msg => this.receive(msg);
            ShExWorker.postMessage(Object.assign({ plugins: pluginWorkerUrls() }, this.request));
        });
    }
    receive(msg) {
        const response = msg.data.response;
        const handler = this.handlers[response];
        try {
            if (handler)
                handler(msg, this);
            else if (response === "done" || response === "created")
                this.resolve(msg.data.results);
            else if (response === "error")
                this.reject(WorkerTask.errorOf(msg.data));
            else
                this.reject(Error(`expected a ${this.request.request} response, got ${JSON.stringify(msg.data)}`));
        }
        catch (e) {
            this.reject(e);
        }
    }
    /** the task is over: the worker's next message is nobody's, the button is itself again */
    finish() {
        ShExWorker.onmessage = false;
        this.button.removeClass("stoppable").text(this.restoreText);
        this.button.off("click");
        this.button.on("click", this.onCancel);
    }
    resolve(value) { this.finish(); this.settle.resolve(value); }
    reject(error) { this.finish(); this.settle.reject(error); }
    /** the abort button: a new worker, since the old one cannot be interrupted */
    cancel(evt) {
        ShExWorker.terminate();
        ShExWorker = new Worker(this.workerUrl);
        if (evt !== null)
            $("#results > .status").text(this.abortText).show();
        this.reject(new FlowControlError("Interrupted by user click"));
    }
    /** the Error a worker's error message describes: name, stack and all */
    static errorOf(data) {
        const e = Error(data.message);
        if (data.name)
            e.name = data.name;
        e.stack = data.stack;
        e.text = data.text || data.errorText;
        return e;
    }
}
