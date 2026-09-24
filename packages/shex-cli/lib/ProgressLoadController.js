const ProgressLoadControllerCjsModule = function (shexLoader) {

// Reports import loading on the console, redrawing one line as each import
// lands. clearLine/cursorTo exist only on a TTY stdout: when output is a
// pipe or a file (--diagnose in a script, or under test) the progress is
// simply not drawn, and the final count is written as a plain line.
class ProgressLoadController extends shexLoader.ResourceLoadControler {
  add (promise) {
    const index = this.toLoad.length;
    super.add(promise.then(ret => {
      if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Loaded ${index} of ${this.schemasSeen.length} imports: ${ret.url}`);
      }
      return ret;
    }));
  }
  allLoaded () {
    return super.allLoaded().then(x => {
      if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      }
      process.stdout.write(`Loaded ${this.toLoad.length} imports.\n`);
      return x;
    });
  }
}
  return ProgressLoadController;
}

module.exports = ProgressLoadControllerCjsModule;
