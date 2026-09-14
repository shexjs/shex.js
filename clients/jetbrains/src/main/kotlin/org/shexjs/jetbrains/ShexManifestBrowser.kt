package org.shexjs.jetbrains

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.diagnostic.logger
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.fileEditor.ex.FileEditorManagerEx
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.ui.components.JBLabel
import com.intellij.ui.jcef.JBCefApp
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import com.intellij.util.concurrency.AppExecutorUtil
import com.redhat.devtools.lsp4ij.LanguageServerItem
import com.redhat.devtools.lsp4ij.LanguageServerManager
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefLoadHandlerAdapter
import org.eclipse.lsp4j.ExecuteCommandParams
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import javax.swing.JComponent
import javax.swing.SwingConstants

/**
 * The ShEx manifest browser: a JCEF panel hosting the very same
 * `media/manifest-browser.html` the VS Code client uses, bridged to the ShEx
 * language server's `shex.loadManifest` / `shex.runManifestEntry` commands
 * through LSP4IJ.
 *
 * The web page renders only the table and the verdict; selecting an entry opens
 * its schema and data as real IntelliJ editor tabs (a `schemaURL`/`dataURL`
 * opens the real file; inline content becomes a temp file), and validation runs
 * against those live documents -- so you can edit and Re-run.
 *
 * Page <-> host protocol (postMessage-shaped JSON):
 *   page -> host:  {type:"ready"|"reload"} | {type:"select"|"run", index} | {type:"runAll"}
 *   host -> page:  {type:"manifest", entries, file} | {type:"result", index, result}
 * The page posts via `window.__shexHostPost(jsonString)` (injected below) and
 * receives via `window.__shexDeliver(obj)`.
 */
@Service(Service.Level.PROJECT)
class ShexManifestBrowser(private val project: Project) : Disposable {
    private val gson = Gson()
    private val browser: JBCefBrowser? = if (JBCefApp.isSupported()) JBCefBrowser() else null
    private val jsQuery: JBCefJSQuery? = browser?.let { JBCefJSQuery.create(it as JBCefBrowserBase) }

    /** The Swing component the tool window shows (or a note if JCEF is absent). */
    val component: JComponent =
        browser?.component ?: JBLabel("JCEF (the embedded browser) is not available in this IDE build.")

    private var manifestFile: VirtualFile? = null
    private var entries: JsonArray = JsonArray()
    private var tmpDir: Path? = null
    private var slotIndex: Int = -1
    private var slotSchema: VirtualFile? = null
    private var slotData: VirtualFile? = null

    /** Mutual schema<->data mouseover highlighting for the open pair. */
    private val cross = ShexCrossHighlighter(project)

    init {
        browser?.let { b ->
            Disposer.register(this, b)
            jsQuery?.addHandler { request -> onPageMessage(request); null }
            b.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
                override fun onLoadEnd(cefBrowser: CefBrowser, frame: CefFrame?, httpStatusCode: Int) {
                    // Define the page -> host channel the shared page expects.
                    val inject = jsQuery?.inject("msg") ?: return
                    cefBrowser.executeJavaScript(
                        "window.__shexHostPost = function(msg) { $inject };", cefBrowser.url, 0)
                }
            }, b.cefBrowser)
        }
    }

    /** Load a manifest file and (re)start the browser page. */
    fun open(file: VirtualFile) {
        manifestFile = file
        // Warm the server so the first validation isn't a cold start -- and never
        // restart one that is already up (StartOptions defaults to forceRestart=true).
        runCatching {
            LanguageServerManager.getInstance(project)
                .start(SERVER_ID, LanguageServerManager.StartOptions().setForceStart(true).setForceRestart(false))
        }
        val html = pageHtml()
        if (html == null) {
            browser?.loadHTML("<p style='font-family:sans-serif;padding:1rem'>Could not find " +
                "<code>packages/shex-language-server/media/manifest-browser.html</code>. Build the language server.</p>")
            return
        }
        browser?.loadHTML(html)
    }

    // --- page messages ------------------------------------------------------

    private fun onPageMessage(request: String) {
        val msg = runCatching { gson.fromJson(request, JsonObject::class.java) }.getOrNull() ?: return
        val type = msg.get("type")?.asString ?: return
        // Editor operations must run on the EDT.
        ApplicationManager.getApplication().invokeLater {
            when (type) {
                "ready", "reload" -> loadEntries()
                "select" -> { val i = msg.get("index").asInt; openEntry(i); validateEntry(i, true) }
                "run" -> validateEntry(msg.get("index").asInt, true)
                "runAll" -> for (i in 0 until entries.size())
                    if (!has(entries[i].asJsonObject, "neighborhood")) validateEntry(i, false)
            }
        }
    }

    private fun loadEntries() {
        val file = manifestFile ?: return
        val text = String(file.contentsToByteArray(), Charsets.UTF_8)
        executeCommand("shex.loadManifest", listOf(text, file.path)).thenAccept { result ->
            val obj = gson.toJsonTree(result).let { if (it.isJsonObject) it.asJsonObject else JsonObject() }
            entries = if (obj.has("entries")) obj.getAsJsonArray("entries") else JsonArray()
            val out = JsonObject().apply {
                addProperty("type", "manifest")
                add("entries", slimEntries())    // the page only needs the display fields
                addProperty("file", file.name)
            }
            deliver(out)
        }
    }

    private fun validateEntry(i: Int, live: Boolean) {
        val e = entryAt(i) ?: return
        val useSlot = live && slotIndex == i
        val schema = liveTextOr(if (useSlot) slotSchema else null, str(e, "schema"))
        val data = liveTextOr(if (useSlot) slotData else null, str(e, "data"))
        val args = listOf(schema, data, str(e, "queryMap"), str(e, "status", "conformant"), strOrNull(e, "dataBase"))
        executeCommand("shex.runManifestEntry", args).thenAccept { result ->
            val tree = gson.toJsonTree(result)
            val obj = if (tree.isJsonObject) tree.asJsonObject else JsonObject()
            // The correspondences drive host-side mouseover highlighting for the
            // open pair; keep them out of the page payload and hand them to the
            // cross-highlighter (on the EDT) instead.
            val corr = if (obj.has("correspondences")) obj.getAsJsonArray("correspondences") else null
            obj.remove("correspondences")
            if (useSlot) ApplicationManager.getApplication().invokeLater { cross.setCorrespondences(corr) }
            deliver(JsonObject().apply {
                addProperty("type", "result"); addProperty("index", i); add("result", obj)
            })
        }
    }

    // --- opening the real editors -------------------------------------------

    /** Open the entry's schema on the left and its data on the right (a vertical
     * split), replacing the previous entry's panes, and arm the mutual
     * schema<->data mouseover highlighting on the two editors. */
    private fun openEntry(i: Int) {
        val e = entryAt(i) ?: return
        val fem = FileEditorManagerEx.getInstanceEx(project)
        // Replace the previous entry's panes (but never a buffer you've edited).
        closeSlot(fem, slotData)
        closeSlot(fem, slotSchema)

        val schemaFile = resolveSlotFile(strOrNull(e, "schemaPath"), str(e, "schema"), "entry$i.schema.shex")
        val dataFile = resolveSlotFile(strOrNull(e, "dataPath"), str(e, "data"), "entry$i.data.${dataExt(str(e, "data"))}")
        slotSchema = schemaFile
        slotData = dataFile
        slotIndex = i

        if (schemaFile != null) fem.openFile(schemaFile, false)
        if (dataFile != null) {
            // Put the data in a side-by-side (vertical divider) split; fall back
            // to a plain tab if the split API isn't available in this IDE build.
            val window = fem.currentWindow
            val split = window != null && runCatching {
                window.split(SwingConstants.VERTICAL, true, dataFile, false) != null
            }.getOrDefault(false)
            if (!split) fem.openFile(dataFile, false)
        }
        // Arm highlighting by *document* -- available immediately (unlike an
        // editor) and shown in every editor of the file.
        cross.setDocuments(docOf(schemaFile), docOf(dataFile))
    }

    private fun docOf(vf: VirtualFile?) = vf?.let { FileDocumentManager.getInstance().getDocument(it) }

    /** The [VirtualFile] for a slot: the real file a schemaURL/dataURL names, or
     * a temp file holding inline content (no editor opened here -- see openEntry). */
    private fun resolveSlotFile(fsPath: String?, content: String, tmpName: String): VirtualFile? =
        if (fsPath != null) LocalFileSystem.getInstance().findFileByPath(fsPath)
        else {
            val dir = tmpDir ?: Files.createTempDirectory("shex-manifest-").also { tmpDir = it }
            val p = dir.resolve(tmpName)
            Files.write(p, content.toByteArray(Charsets.UTF_8))
            LocalFileSystem.getInstance().refreshAndFindFileByNioFile(p)
        }

    /** Close a previous slot's editor unless you have unsaved edits in it. */
    private fun closeSlot(fem: FileEditorManagerEx, vf: VirtualFile?) {
        vf ?: return
        if (FileDocumentManager.getInstance().isFileModified(vf)) return
        runCatching { fem.closeFile(vf) }
    }

    private fun liveTextOr(vfile: VirtualFile?, fallback: String): String {
        if (vfile != null) FileDocumentManager.getInstance().getDocument(vfile)?.let { return it.text }
        return fallback
    }

    // --- talking to the server ----------------------------------------------

    /**
     * Run a server command via LSP4IJ and complete with its result (a Gson-
     * decodable value), or an `{errors:[...]}` map if the server isn't running.
     *
     * API to verify against the pinned LSP4IJ (see the plugin README): that
     * `LanguageServerManager#start(String)` and `#getLanguageServer(String) ->
     * CompletableFuture<LanguageServerItem>` exist, and that `LanguageServerItem
     * #getServer()` returns the lsp4j `LanguageServer`.
     */
    private fun executeCommand(command: String, args: List<Any?>): CompletableFuture<Any?> {
        return startedServer().thenCompose { item ->
            val server = item?.server
            if (server == null)
                CompletableFuture.completedFuture<Any?>(mapOf("errors" to listOf("ShEx language server is not running.")))
            else
                @Suppress("UNCHECKED_CAST")
                (server.workspaceService.executeCommand(ExecuteCommandParams(command, args)) as CompletableFuture<Any?>)
        }.exceptionally { t ->
            LOG.warn("shex executeCommand $command failed", t)
            mapOf("errors" to listOf(t.message ?: t.toString()))
        }
    }

    /**
     * The running language server, starting it if needed but **never restarting
     * one already up** (LSP4IJ's default `StartOptions` has `forceRestart=true`,
     * which would kill and relaunch the server on every call).  `getLanguageServer`
     * itself starts nothing, so on a cold call we force-start once and then poll
     * until it is up (or give up after a few seconds).
     */
    private fun startedServer(): CompletableFuture<LanguageServerItem?> {
        val manager = LanguageServerManager.getInstance(project)
        val result = CompletableFuture<LanguageServerItem?>()
        fun attempt(n: Int) {
            manager.getLanguageServer(SERVER_ID).whenComplete { item, _ ->
                when {
                    item != null -> result.complete(item)
                    n == 0 -> {
                        runCatching {
                            manager.start(SERVER_ID, LanguageServerManager.StartOptions()
                                .setForceStart(true).setForceRestart(false))
                        }
                        AppExecutorUtil.getAppScheduledExecutorService().schedule({ attempt(1) }, 300, TimeUnit.MILLISECONDS)
                    }
                    n < MAX_START_POLLS -> AppExecutorUtil.getAppScheduledExecutorService().schedule({ attempt(n + 1) }, 300, TimeUnit.MILLISECONDS)
                    else -> result.complete(null)
                }
            }
        }
        attempt(0)
        return result
    }

    // --- delivering to the page ---------------------------------------------

    private fun deliver(msg: JsonObject) {
        val b = browser ?: return
        // Pass the object literal directly; escape the two JS line separators
        // that are legal in JSON strings but would break a JS source literal.
        val code = ("window.__shexDeliver(" + gson.toJson(msg) + ")")
            .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
        ApplicationManager.getApplication().invokeLater { b.cefBrowser.executeJavaScript(code, b.cefBrowser.url, 0) }
    }

    private fun slimEntries(): JsonArray {
        val out = JsonArray()
        for (el in entries) {
            val o = el.asJsonObject
            val s = JsonObject()
            for (k in DISPLAY_FIELDS) if (o.has(k)) s.add(k, o.get(k))
            out.add(s)
        }
        return out
    }

    // --- the page HTML ------------------------------------------------------

    private fun pageHtml(): String? {
        val path = resolveHtmlPath() ?: return null
        if (!Files.exists(path)) return null
        val nonce = java.lang.Long.toHexString(System.nanoTime())
        return runCatching {
            Files.readString(path).replace("{{nonce}}", nonce).replace("{{cspSource}}", "'self'")
        }.getOrNull()
    }

    /** Resolve the shared page, mirroring the server resolution in
     * [ShexLanguageServer]: next to a `SHEX_LANGUAGE_SERVER` `server.js`, else in
     * the monorepo the project is opened from. */
    private fun resolveHtmlPath(): Path? {
        System.getenv("SHEX_LANGUAGE_SERVER")?.takeIf { it.isNotBlank() && it.endsWith(".js") }?.let {
            return Paths.get(it).parent?.parent?.resolve("media")?.resolve("manifest-browser.html")
        }
        project.basePath?.let {
            return Paths.get(it, "packages", "shex-language-server", "media", "manifest-browser.html")
        }
        return null
    }

    override fun dispose() {
        cross.dispose()
        tmpDir?.let { dir ->
            runCatching { Files.walk(dir).sorted(Comparator.reverseOrder()).forEach { Files.deleteIfExists(it) } }
        }
    }

    // --- small JSON helpers -------------------------------------------------

    private fun entryAt(i: Int): JsonObject? = if (i in 0 until entries.size()) entries[i].asJsonObject else null
    private fun has(o: JsonObject, k: String) = o.has(k) && !o.get(k).isJsonNull
    private fun str(o: JsonObject, k: String, def: String = "") = if (has(o, k)) o.get(k).asString else def
    private fun strOrNull(o: JsonObject, k: String): String? = if (has(o, k)) o.get(k).asString else null

    /** `.trig` when inline data uses a `GRAPH` keyword (which strict-Turtle
     * tooling would reject), else `.ttl`; both are the same "turtle" language. */
    private fun dataExt(content: String): String =
        if (Regex("(?:^|[^:\\w])GRAPH\\s", RegexOption.IGNORE_CASE).containsMatchIn(content)) "trig" else "ttl"

    companion object {
        const val SERVER_ID = "shexLanguageServer"
        private const val MAX_START_POLLS = 10 // ~3s at 300ms, for a cold start
        private val DISPLAY_FIELDS = listOf("index", "schemaLabel", "dataLabel", "queryMap", "status", "comment", "neighborhood")
        private val LOG = logger<ShexManifestBrowser>()
    }
}
