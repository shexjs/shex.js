package org.shexjs.jetbrains

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.Disposable
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.event.DocumentEvent
import com.intellij.openapi.editor.event.DocumentListener
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileEditor.ex.FileEditorManagerEx
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.util.concurrency.AppExecutorUtil
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit
import javax.swing.SwingConstants

/**
 * Validate-by-pointing, the JetBrains counterpart to the VS Code client's
 * right-click flow: mark a **node** in a data document and a **shape** in a
 * schema (in either order); when both are set, the pair `<node>@<shape>` is
 * validated and the verdict shown as a balloon.
 *
 * The pair is kept after a run, so re-marking just the node (or the shape)
 * re-validates against the other. Every actual validation is still the server's
 * work -- this only gathers the two terms and the two documents (mirroring the
 * VS Code extension's term capture and prefix/BASE expansion) and calls
 * `shex.runManifestEntry` (which also yields the failure reasons).
 */
@Service(Service.Level.PROJECT)
class ShexPointingValidator(private val project: Project) : Disposable {
    private data class Marked(val atom: String, val label: String, val text: String, val base: String?, val file: VirtualFile?)
    private var node: Marked? = null
    private var shape: Marked? = null
    private val gson = Gson()
    /** Cross-pane highlighting for the pointed pair, opened side by side. */
    private val cross = ShexCrossHighlighter(project)
    @Volatile private var autoValidate = false
    private var autoFuture: ScheduledFuture<*>? = null

    init {
        // Auto re-validate the current pair a beat after an edit to its schema
        // or data, when toggled on (cheap no-op while off / with no pair).
        EditorFactory.getInstance().eventMulticaster.addDocumentListener(object : DocumentListener {
            override fun documentChanged(e: DocumentEvent) {
                if (!autoValidate) return
                val n = node ?: return; val s = shape ?: return
                val f = FileDocumentManager.getInstance().getFile(e.document) ?: return
                if (f != n.file && f != s.file) return
                autoFuture?.cancel(false)
                autoFuture = AppExecutorUtil.getAppScheduledExecutorService().schedule(
                    { ApplicationManager.getApplication().invokeLater { revalidate() } }, AUTO_DELAY_MS, TimeUnit.MILLISECONDS)
            }
        }, this)
    }

    /** Re-run the last node/shape pair against the LIVE documents. */
    fun revalidate() = maybeValidate()

    /** Turn auto-revalidate-on-edit on/off; returns the new state. */
    fun toggleAutoValidate(): Boolean {
        autoValidate = !autoValidate
        notify("Auto-revalidate on edit: " + (if (autoValidate) "on (${AUTO_DELAY_MS} ms after an edit)" else "off"),
            NotificationType.INFORMATION)
        return autoValidate
    }

    override fun dispose() { autoFuture?.cancel(false) }

    private fun fileOf(editor: Editor): VirtualFile? = FileDocumentManager.getInstance().getFile(editor.document)

    /** The file's live in-memory text (with unsaved edits), else the snapshot. */
    private fun liveText(m: Marked): String {
        val f = m.file ?: return m.text
        return FileDocumentManager.getInstance().getDocument(f)?.text ?: m.text
    }

    /** Mark the term at the caret in a data document as the focus node. */
    fun markNode(editor: Editor) {
        val text = editor.document.text
        val prefixes = collectPrefixes(text)
        val token = termAt(text, editor.caretModel.offset)
            ?: return warn("Put the caret on a node (e.g. :alice or <Patient2>) and try again.")
        val atom = iriAtom(token, prefixes)
            ?: return warn("“$token” isn't an IRI or prefixed name.")
        if (looksLikeNamespace(atom, prefixes, "a node")) return
        node = Marked(atom, token, text, collectBase(text), fileOf(editor))
        info("Node: ${describe(token, atom)}." + if (shape == null) " Now right-click a shape → “Validate Against This Shape”." else "")
        maybeValidate()
    }

    /** Mark the term at the caret in a schema as the shape (START allowed). */
    fun markShape(editor: Editor) {
        val text = editor.document.text
        val prefixes = collectPrefixes(text)
        val token = termAt(text, editor.caretModel.offset)
            ?: return warn("Put the caret on a shape name (or START) and try again.")
        val atom = shapeAtom(token, prefixes)
            ?: return warn("“$token” isn't a shape IRI, prefixed name, or START.")
        if (looksLikeNamespace(atom, prefixes, "a shape")) return
        shape = Marked(atom, token, text, null, fileOf(editor))
        info("Shape: ${describe(token, atom)}." + if (node == null) " Now right-click a node → “Validate This Node”." else "")
        maybeValidate()
    }

    private fun maybeValidate() {
        val n = node ?: return
        val s = shape ?: return
        val queryMap = "${n.atom}@${s.atom}"
        // Validate the LIVE documents (not the pick-time snapshot), so editing
        // the schema/data and re-validating reflects the edits. runManifestEntry
        // resolves the shape against the schema's own base and returns the
        // per-association status, reasons, and correspondences for highlighting.
        val dataText = liveText(n)
        ShexLsp.executeCommand(project, "shex.runManifestEntry",
            listOf(liveText(s), dataText, queryMap, "conformant", collectBase(dataText)))
            .thenAccept { res -> ApplicationManager.getApplication().invokeLater { present(queryMap, res, s.file, n.file) } }
    }

    /** Open the pair side by side (schema left, data right), arm the cross-pane
     * highlighting from the correspondences, and balloon the verdict. */
    private fun present(queryMap: String, res: Any?, schemaFile: VirtualFile?, dataFile: VirtualFile?) {
        val obj = gson.toJsonTree(res).let { if (it.isJsonObject) it.asJsonObject else JsonObject() }
        val corr = if (obj.has("correspondences") && obj.get("correspondences").isJsonArray)
            obj.getAsJsonArray("correspondences") else null
        obj.remove("correspondences")
        openSideBySide(schemaFile, dataFile)
        cross.setCorrespondences(corr)
        report(queryMap, obj)
    }

    private fun report(queryMap: String, obj: JsonObject) {
        val qm = esc(queryMap)
        if (obj.has("errors") && obj.get("errors").isJsonArray) {
            warn(qm + "<br>" + obj.getAsJsonArray("errors").joinToString("<br>") { esc(it.asString) })
            return
        }
        val a = obj.getAsJsonArray("assocs")?.firstOrNull()?.asJsonObject
        when (a?.get("actual")?.asString) {
            "conformant" -> notify("✓ $qm — conformant", NotificationType.INFORMATION)
            "nonconformant" -> {
                val reasons = a.getAsJsonArray("reasons")?.joinToString("<br>") { "• " + esc(it.asString) } ?: ""
                notify("✗ $qm — nonconformant" + (if (reasons.isNotEmpty()) "<br>$reasons" else ""), NotificationType.WARNING)
            }
            else -> notify("$qm — no result", NotificationType.WARNING)
        }
    }

    // --- side-by-side panes + highlighter -----------------------------------

    /** Open the shape's document on the left and the node's on the right (a
     * vertical split), then arm the highlighter on the two editors.  Files the
     * user already has open are reused, not reopened/re-split -- you pointed in
     * both editors, so normally nothing moves. */
    private fun openSideBySide(schemaFile: VirtualFile?, dataFile: VirtualFile?) {
        val fem = FileEditorManagerEx.getInstanceEx(project)
        if (schemaFile != null && !fem.isFileOpen(schemaFile)) fem.openFile(schemaFile, false)
        if (dataFile != null && dataFile != schemaFile && !fem.isFileOpen(dataFile)) {
            val window = fem.currentWindow
            val split = window != null && runCatching {
                window.split(SwingConstants.VERTICAL, true, dataFile, false) != null
            }.getOrDefault(false)
            if (!split) fem.openFile(dataFile, false)
        }
        // Arm highlighting by *document* (available immediately, shown in every
        // editor of the file -- no editor-capture timing to jump-start).
        cross.setDocuments(docOf(schemaFile), docOf(dataFile))
    }

    private fun docOf(vf: VirtualFile?) = vf?.let { FileDocumentManager.getInstance().getDocument(it) }

    // --- term capture + expansion (mirrors the VS Code extension) ------------

    /** The RDF term covering `offset`: an <iri>, a prefixed name, a default
     * `:name`, or a bare word like START. */
    private fun termAt(text: String, offset: Int): String? {
        for (m in TERM.findAll(text))
            if (offset >= m.range.first && offset <= m.range.last + 1) return m.value
        return null
    }

    /** A shape-map atom for a term: keep an <iri> as-is, expand a prefixed name
     * to an absolute <iri> (the shape-map parser gets no prefixes), else null. */
    private fun iriAtom(token: String, prefixes: Map<String, String>): String? {
        val t = token.trim()
        if (Regex("^<[^>]*>$").matches(t)) return t
        val c = t.indexOf(':')
        if (c >= 0) prefixes[t.substring(0, c)]?.let { return "<$it${t.substring(c + 1)}>" }
        return null
    }

    private fun shapeAtom(token: String, prefixes: Map<String, String>): String? =
        if (Regex("^(START|start)$").matches(token.trim())) "START" else iriAtom(token, prefixes)

    private fun collectPrefixes(text: String): Map<String, String> {
        val m = HashMap<String, String>()
        for (mt in PREFIX_RE.findAll(text)) m[mt.groupValues[1]] = mt.groupValues[2]
        return m
    }

    private fun collectBase(text: String): String? = BASE_RE.find(text)?.groupValues?.get(1)

    /** Warn on the usual misclick: the caret was on a namespace IRI in a PREFIX
     * line, not on a term. */
    private fun looksLikeNamespace(atom: String, prefixes: Map<String, String>, what: String): Boolean {
        if (atom.startsWith("<") && prefixes.values.contains(atom.substring(1, atom.length - 1))) {
            warn("$atom is a namespace from a PREFIX line, not $what. Put the caret on the term itself (e.g. :alice or :User).")
            return true
        }
        return false
    }

    private fun describe(token: String, atom: String): String = if (token == atom) atom else "$token → $atom"
    private fun esc(s: String): String = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    private fun info(html: String) = notify(html, NotificationType.INFORMATION)
    private fun warn(html: String) = notify(html, NotificationType.WARNING)
    private fun notify(html: String, type: NotificationType) {
        NotificationGroupManager.getInstance().getNotificationGroup("ShEx")
            .createNotification("ShEx", html, type).notify(project)
    }

    companion object {
        private const val AUTO_DELAY_MS = 500L   // debounce for auto-revalidate on edit
        private val TERM = Regex("<[^>\\s]*>|[A-Za-z_][\\w.+\\-]*:[\\w.+\\-]*|:[\\w.+\\-]+|[A-Za-z_][\\w.+\\-]*")
        private val PREFIX_RE = Regex("(?:@prefix|PREFIX)\\s+([A-Za-z_][\\w.\\-]*)?:\\s*<([^>]*)>", RegexOption.IGNORE_CASE)
        private val BASE_RE = Regex("(?:@base|BASE)\\s+<([^>]*)>", RegexOption.IGNORE_CASE)
    }
}
