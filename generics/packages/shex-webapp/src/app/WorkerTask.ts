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

/** what the page posts: `request` names what the worker is to do, the rest is that request's */
interface WorkerRequest {
  request: string;
  [key: string]: any;
}

/**
 * What the worker posts (ShExWorkerThread.js): `response` names the
 * handler, the rest is that response's -- `x` for recurse and known;
 * `point`, `label` and `ret` for enter and exit; `pages` for slurpedPages;
 * `token`, `isOut`, `term`, `shapeLabel`, `quads`, `message` and `time` for
 * the query messages; whatever a plugin's own requests answer with.
 */
interface WorkerMessageData {
  response: string;
  /** update: the entries just validated; done and created: what the task resolves with */
  results?: any;
  /** error: the parts of an Error that survive a postMessage, and `text`, what the worker was doing */
  name?: string;
  message?: string;
  stack?: string;
  text?: string;
  [key: string]: any;
}

/** a message from the worker, as onmessage gets it (the tests' fake worker sends the same shape) */
interface WorkerMessage {
  data: WorkerMessageData;
}

/** answers one response: ends the task with task.resolve or task.reject, or leaves it running */
type WorkerMessageHandler = (msg: WorkerMessage, task: WorkerTask) => void;

/** handlers by the `response` they answer */
interface WorkerTaskHandlers {
  [response: string]: WorkerMessageHandler;
}

class WorkerTask {
  button: any;                    // jQuery: the button that started the task, "abort" while it runs
  restoreText: string;            // what the button said before, put back by finish
  onCancel: ((evt: any) => any) | undefined;  // the button's click handler between tasks
  abortText: string;              // the status line an abort leaves
  request: WorkerRequest;
  handlers: WorkerTaskHandlers;
  workerUrl: string;              // where a cancel starts the next worker from
  settle!: {resolve: (value: any) => void, reject: (error: any) => void};  // ready()'s promise, for a handler to end
  constructor ({button, onCancel, abortText, request, handlers, workerUrl}:
               {button: any, onCancel?: (evt: any) => any, abortText: string, request: WorkerRequest,
                handlers?: WorkerTaskHandlers, workerUrl: string}) {
    this.button = button;
    this.restoreText = button.text();
    this.onCancel = onCancel;
    this.abortText = abortText;
    this.request = request;
    this.handlers = handlers || {};
    this.workerUrl = workerUrl;
  }

  ready (): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.settle = {resolve, reject};
      this.button.addClass("stoppable").text("abort (ctl-enter)");
      this.button.off();
      this.button.on("click", (evt: any) => this.cancel(evt));
      ShExWorker.onmessage = (msg: any) => this.receive(msg);
      ShExWorker.postMessage(Object.assign({plugins: pluginWorkerUrls()}, this.request));
    });
  }

  receive (msg: WorkerMessage): void {
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
    } catch (e: any) {
      this.reject(e);
    }
  }

  /** the task is over: the worker's next message is nobody's, the button is itself again */
  finish (): void {
    ShExWorker.onmessage = false;
    this.button.removeClass("stoppable").text(this.restoreText);
    this.button.off("click");
    this.button.on("click", this.onCancel);
  }

  resolve (value: any): void { this.finish(); this.settle.resolve(value); }
  reject (error: any): void { this.finish(); this.settle.reject(error); }

  /** the abort button: a new worker, since the old one cannot be interrupted */
  cancel (evt: any): void {
    ShExWorker.terminate();
    ShExWorker = new Worker(this.workerUrl);
    if (evt !== null)
      $("#results > .status").text(this.abortText).show();
    this.reject(new FlowControlError("Interrupted by user click"));
  }

  /** the Error a worker's error message describes: name, stack and all */
  static errorOf (data: WorkerMessageData): Error {
    const e: any = Error(data.message);
    if (data.name)
      e.name = data.name;
    e.stack = data.stack;
    e.text = data.text || data.errorText;
    return e;
  }
}
