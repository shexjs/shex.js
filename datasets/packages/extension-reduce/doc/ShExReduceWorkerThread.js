/**
 * ShExReduce in the worker: the handler a `%Reduce:{...%}` dispatches on.
 *
 * The actions run *during* the match (registerEager, for the same reason
 * the page's half does: they steer it), so they have to run where the
 * matcher is.  On the worker page that is over here, and the value each one
 * returned rides home on the result it was recorded on -- which is what the
 * fold on the page takes rather than running anything again.  Without this,
 * a validation in the worker produced results with no actions in them and
 * `reduce` folded them to what a parse with no actions reduces to: the node
 * it started from.
 *
 * Imported by ShExWorkerThread on the app's say-so (the descriptor's
 * `worker`), which is why this is not a worker script of its own.
 */
importScripts(pluginBase + "webpacks/shexreduce-webapp.js");

registerWorkerPlugin({
  register (validator, api) {
    if (!api.Reduce)
      return; // ShExReduce's module is not in this worker
    // the schema's own prefixes, so an action may write one(':value') the
    // way the schema writes :value -- from the validator, which is holding
    // the schema it will actually match against
    api.Reduce.registerEager(validator, {
      evaluate: api.ReduceJs,
      prefixes: (validator.schema && validator.schema._prefixes) || {},
    });
  },
});
