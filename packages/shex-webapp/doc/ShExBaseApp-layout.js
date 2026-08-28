/**
 * The page's geometry: the grip that divides panes from results, the
 * columns a screen lays its panes out in, the editors over the textareas,
 * the interface modes, drag and drop.  Mixed onto ShExBaseApp; see
 * ShExBaseApp.js.
 */

mixin(ShExBaseApp, {
  /**
   * The top edge of the results is a handle.
   *
   * The page is a fixed division -- panes above, results below -- and how
   * much each gets depends on what you are doing: reading a long result, or
   * writing a long schema.  Dragging the edge says which, and the panes
   * take (or give up) what the results don't (or do).
   */
  prepareResultsGrip () {
    const grip = $("#resultsGrip");
    if (grip.length === 0)
      return;
    const least = 48; // px: the tab strip, and enough result to know it is there
    let dragging = false;
    const divideAt = y => {
      // innerHeight rather than $(window).height(): the latter reads a
      // layout, and asks it of a document that may not have one
      const page = window.innerHeight || 0;
      const most = page > 2 * least ? page - least : Infinity;
      const height = Math.min(Math.max(page - y, least), most);
      $("#results").css("flex", "0 0 " + Math.round(height) + "px");
      // a pane that just changed size measures again, editors included
      this.remeasureScreenPanes(this.currentScreen());
    };
    grip.on("mousedown", evt => {
      dragging = true;
      evt.preventDefault(); // or the drag selects the page instead
    });
    $(document).on("mousemove.shexjsGrip", evt => { if (dragging) divideAt(evt.clientY); });
    $(document).on("mouseup.shexjsGrip", () => { dragging = false; });
  },

  /** the row of columns a screen's panes lay out in: the toolbar and the
   * statusbar are the screen's other children, and go under it */
  screenColumns (screen) {
    let row = screen.children(".screenColumns").first();
    if (row.length === 0)
      row = $("<div/>").addClass("screenColumns").prependTo(screen);
    return row;
  },

  /**
   * The tab set panes take turns in, made on demand (§4).
   *
   * A column can hold one pane at a time as well as several at once: the
   * schema and the overlay it is read with are the same column of
   * ShExReduce's screen, a tab each -- which is what the data source's own
   * documents do in #dataPaneTabs.  `tabs:` names the set, `label:` names
   * the tab, and the panes that share a set share a column in declaration
   * order.
   */
  paneTabset (pane, screen, columns) {
    const key = pane.panel === undefined ? "" : pane.panel;
    if (!columns.has(key))
      columns.set(key, $("<div/>").addClass("panel").attr("data-panel", key || null)
                  .appendTo(this.screenColumns(screen)));
    let set = $("#" + pane.tabs);
    if (set.length === 0) {
      set = $("<div/>").attr({id: pane.tabs, "data-tabset": ""}).appendTo(columns.get(key));
      $("<ul/>").appendTo(set);
    }
    const panel = pane.id || pane.name + "Tab";
    set.children("ul").first().append(
      $("<li/>").append($("<a/>", {href: "#" + panel}).text(pane.label || pane.name)));
    return set;
  },

  /** The Menu → "user interface" editors select (?editors= in permalinks)
   * replaces the textareas with language-aware CodeMirror panes (when the
   * webpack bundle includes EditorPanes); the textareas stay in the DOM as
   * live value proxies so caches/permalinks/tests are unaffected.  Toggling
   * off restores the plain textareas with the current text -- handy for
   * comparing editor and textarea behaviors.
   */
  setEditors () {
    const want = "EditorPanes" in ShExWebApp && $("#editors").val() !== "textarea";
    if (want && !this.editorSupport) {
      this.editorSupport = new EditorSupport(this);
      // ShExResultsRenderer reaches editorSupport through its caches
      // reference; non-enumerable so the many Object.keys(Caches) iterations
      // (textarea handlers, query parameters, ...) never mistake it for a
      // cache.
      Object.defineProperty(this.Caches, "editorSupport",
                            {value: this.editorSupport, enumerable: false, configurable: true});
      this.addEditorPanes();
      this.editorSupport.enableShapeHover();
    } else if (!want && this.editorSupport) {
      this.editorSupport.destroy();
      delete this.Caches.editorSupport;
      this.editorSupport = null;
    }
  },

  /** which caches get panes; subclasses add theirs.
   *
   * The schema pane is ShExC and always will be.  The data pane's language
   * is not the app's to decide: its text says which neighborhood serves the
   * data ("# Endpoint: <url>" queries SPARQL, "# Wikibase" synthesizes
   * entity pages, anything else is Turtle to parse), and each of those
   * modules describes its own text.  So the pane asks whichever module
   * claims the text as it stands -- and gets a plain textarea, exactly as
   * with the editors off, from a module that describes nothing.
   */
  addEditorPanes () {
    this.editorSupport.addPane("inputSchema", this.Caches.inputSchema, "shexc");
    // the data pane's language is whatever the showing document is in, and
    // that is the selected source's to say
    this.editorSupport.addPane("inputData", this.Caches.inputData, null,
                               () => this.neighborhoods.paneEditor());
    pluginDescriptors().forEach(ext => (ext.panes || []).forEach(pane => {
      if (pane.editor)
        this.editorSupport.addPane(pane.name, this.Caches[pane.name], pane.editor);
    }));
  },

  /** The showing document may have changed language (a different source, or
   * a different pane of it), and a pane's grammar is fixed when it is
   * built, so rebuild it. */
  refreshDataPaneEditor () {
    // Whether there is a pane to rebuild is not the question -- a source
    // with no document to edit leaves none, and the next source may want
    // one back.  The question is whether the editors are on at all.
    if (!this.editorSupport)
      return;
    const pane = this.editorSupport.panes.inputData;
    if (pane) {
      pane.destroy();          // hands its text back to the textarea
      delete this.editorSupport.panes.inputData;
    }
    this.editorSupport.addPane("inputData", this.Caches.inputData, null,
                               () => this.neighborhoods.paneEditor());
    // destroying a pane restores the textarea it hid, so say again what
    // should be showing
    this.neighborhoods.showDocumentArea();
  },

  /* controls menu */
  async toggleControls (evt) {
    // don't use `return false` 'cause the browser doesn't wait around for a promise before looking at return false to decide the event is handled
    if (evt) evt.preventDefault();

    const revealing = evt && $("#controls").css("display") !== "flex";
    $("#controls").css("display", revealing ? "flex" : "none");
    this.toggleControlsArrow(revealing ? "up" : "down");
    if (revealing) {
      let target = evt.target;
      while (target.tagName !== "BUTTON")
        target = target.parentElement;
      if ($("#menuForm").css("position") === "absolute") {
        $("#controls").
          css("top", 0).
          css("left", $("#menu-button").css("margin-left"));
      } else {
        const bottonBBox = target.getBoundingClientRect();
        const controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
        const left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
        $("#controls").css("top", bottonBBox.bottom).css("left", left);
      }
      $("#permalink a").removeAttr("href"); // can't click until ready
      const permalink = await this.getPermalink();
      $("#permalink a").attr("href", permalink);
    }
  },

toggleControlsArrow (which) {
    // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
    if (document.getElementById("menu-button") === null)
      return;
    const down = $(document.getElementById("menu-button").
                   querySelectorAll('use[*|href="#down-arrow"]'));
    const up = $(document.getElementById("menu-button").
                 querySelectorAll('use[*|href="#up-arrow"]'));

    switch (which) {
    case "down":
      down.show();
      up.hide();
      break;
    case "up":
      down.hide();
      up.show();
      break;
    default:
      throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
    }
  },

setInterface (evt) {
    this.toggleControls();
    this.customizeInterface();
  },

customizeInterface () {
  if ($("#interface").val() === "minimal") {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").show();
    $("#inputData .status").html("data (<span id=\"dataDialect\">" + this.neighborhoods.dialect() + "</span>)").show();
    // minimal: the shape map is all that stays beside the schema
    $("#shapeMapArea").siblings().hide();
    $("#title img, #title h1, #screenTabs").hide();
    $("#menuForm").css("position", "absolute").css(
      "left",
      $("#inputSchema .status").get(0).getBoundingClientRect().width -
        $("#menuForm").get(0).getBoundingClientRect().width
    );
    $("#controls").css("position", "relative");
  } else {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").hide();
    $("#inputData .status").html("data (<span id=\"dataDialect\">" + this.neighborhoods.dialect() + "</span>)").hide();
    $("#shapeMapArea").siblings().show();
    $("#title img").show();
    // The switch stands in for the part of the title that named what is
    // showing (addScreenOption), so the heading itself comes back either
    // way and the part it replaced does not.  A title with no such part
    // hands over the whole of itself, and stays away while the switch is up.
    const named = $("#title h1").first().find(".screenName");
    $("#title h1").toggle(!this.screenTabsLive || named.length > 0);
    named.toggle(!this.screenTabsLive);
    $("#screenTabs").toggle(!!this.screenTabsLive);
    $("#menuForm").removeAttr("style");
    $("#controls").css("position", "absolute");
  }
},

async prepareDragAndDrop () {
    this.QueryParams.filter(q => {
      return "cache" in q;
    }).map(q => {
      return {
        location: q.location,
        targets: [{
          ext: "",   // Will match any file
          media: "", //   or media type.
          target: q.cache
        }]
      };
    }).concat([
      {location: $("body"), targets: [
        {media: "application/json", target: this.Caches.manifest},
        {media: "application/x-yaml", target: this.Caches.manifest},
        {ext: ".shex", media: "text/shex", target: this.Caches.inputSchema},
        {ext: ".ttl", media: "text/turtle", target: this.Caches.inputData},
        {ext: ".json", media: "application/json", target: this.Caches.manifest},
        {ext: ".smap", media: "text/plain", target: this.Caches.shapeMap}]}
    ]).forEach(desc => {
      const droparea = desc.location;
      // kudos to http://html5demos.com/dnd-upload
      desc.location.
        on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
        }).
        on("dragover dragenter", (evt) => {
          desc.location.addClass("hover");
        }).
        on("dragend dragleave drop", (evt) => {
          desc.location.removeClass("hover");
        }).
        on("drop", (evt) => {
          evt.preventDefault();
          droparea.removeClass("droppable");
          $("#results > .status").removeClass("error");
          this.resultsWidget.clear();
          let xfer = evt.originalEvent.dataTransfer;
          const prefTypes = [
            {type: "files"},
            {type: "application/json"},
            {type: "text/uri-list"},
            {type: "text/plain"}
          ];
          const promises = [];
          if (prefTypes.find(l => {
            if (l.type.indexOf("/") === -1) {
              if (l.type in xfer && xfer[l.type].length > 0) {
                $("#results > .status").text("handling "+xfer[l.type].length+" files...").show();
                promises.push(readfiles(xfer[l.type], desc.targets));
                return true;
              }
            } else {
              if (xfer.getData(l.type)) {
                const val = xfer.getData(l.type);
                $("#results > .status").text("handling "+l.type+"...").show();
                if (l.type === "application/json") {
                  if (desc.location.get(0) === $("body").get(0)) {
                    let parsed = JSON.parse(val);
                    if (!(Array.isArray(parsed))) {
                      parsed = [parsed];
                    }
                    parsed.map(elt => {
                      const action = "action" in elt ? elt.action: elt;
                      action.schemaURL = action.schema; delete action.schema;
                      action.dataURL = action.data; delete action.data;
                    });
                    promises.push(this.Caches.manifest.set(parsed, DefaultBase, "drag and drop"));
                  } else {
                    promises.push(inject(desc.targets, DefaultBase, val, l.type));
                  }
                } else if (l.type === "text/uri-list") {
                  $.ajax({
                    accepts: {
                      mycustomtype: 'text/shex,text/turtle,*/*'
                    },
                    url: val,
                    dataType: "text"
                  }).fail((jqXHR, textStatus) => {
                    const error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
                    this.resultsWidget.append($("<pre/>").text("GET <" + val + "> failed: " + error));
                  }).done((data, status, jqXhr) => {
                    try {
                      promises.push(inject(desc.targets, val, data, (jqXhr.getResponseHeader("Content-Type") || "unknown-media-type").split(/[ ;,]/)[0]));
                      $("#loadForm").dialog("close");
                      this.toggleControls();
                    } catch (e) {
                      this.resultsWidget.append($("<pre/>").text("unable to evaluate <" + val + ">: " + (e.stack || e)));
                    }
                  });
                } else if (l.type === "text/plain") {
                  promises.push(inject(desc.targets, DefaultBase, val, l.type));
                }
                $("#results > .status").text("").hide();
                // desc.targets.text(xfer.getData(l.type));
                return true;
                async function inject (targets, url, data, mediaType) {
                  const target =
                        targets.length === 1 ? targets[0].target :
                        targets.reduce((ret, elt) => {
                          return ret ? ret :
                            mediaType === elt.media ? elt.target :
                            null;
                        }, null);
                  if (target) {
                    const appendTo = $("#append").is(":checked") ? target.get() : "";
                    await target.set(appendTo + data, url, 'drag and drop', mediaType);
                  } else {
                    this.resultsWidget.append("don't know what to do with " + mediaType + "\n");
                  }
                }
              }
            }
            return false;
          }) === undefined)
            this.resultsWidget.append($("<pre/>").text(
              "drag and drop not recognized:\n" +
                JSON.stringify({
                  dropEffect: xfer.dropEffect,
                  effectAllowed: xfer.effectAllowed,
                  files: xfer.files.length,
                  items: [].slice.call(xfer.items).map(i => {
                    return {kind: i.kind, type: i.type};
                  })
                }, null, 2)
            ));
          SharedForTests.promise = Promise.all(promises);
        });
    });
    const readfiles = /*async*/ (files, targets) => { // returns promise but doesn't use await
      const formData = new FormData();
      let successes = 0;
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i], name = file.name;
        const target = targets.reduce((ret, elt) => {
          return ret ? ret :
            name.endsWith(elt.ext) ? elt.target :
            null;
        }, null);
        if (target) {
          promises.push(new Promise((resolve, reject) => {
            formData.append("file", file);
            const reader = new FileReader();
            reader.onload = ((target) => {
              return async (event) => {
                const appendTo = $("#append").is(":checked") ? target.get() : "";
                await target.set(appendTo + event.target.result, DefaultBase);
                ++successes;
                resolve()
              };
            })(target);
            reader.readAsText(file);
          }))
        } else {
          this.resultsWidget.append("don't know what to do with " + name + "\n");
        }
      }
      return Promise.all(promises).then(() => {
        $("#results > .status").text("loaded "+successes+" files.").show();
      })
    }
  },
});
