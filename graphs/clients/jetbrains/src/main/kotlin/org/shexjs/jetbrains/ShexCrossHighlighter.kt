package org.shexjs.jetbrains

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.intellij.openapi.Disposable
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.event.EditorMouseEvent
import com.intellij.openapi.editor.event.EditorMouseListener
import com.intellij.openapi.editor.event.EditorMouseMotionListener
import com.intellij.openapi.editor.impl.DocumentMarkupModel
import com.intellij.openapi.editor.markup.EffectType
import com.intellij.openapi.editor.markup.HighlighterLayer
import com.intellij.openapi.editor.markup.HighlighterTargetArea
import com.intellij.openapi.editor.markup.MarkupModel
import com.intellij.openapi.editor.markup.RangeHighlighter
import com.intellij.openapi.editor.markup.TextAttributes
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.MessageType
import com.intellij.openapi.ui.popup.Balloon
import com.intellij.openapi.ui.popup.JBPopupFactory
import com.intellij.ui.JBColor
import com.intellij.ui.awt.RelativePoint
import java.awt.Color

/**
 * Mutual highlighting between a manifest entry's (or a pointed pair's) schema
 * and data, a la the ShEx.js WebApp: matched triples/constraints get a faint
 * always-on wash and failing ones a red squiggle; mousing over a constraint
 * brightens the data triples it matched (and vice-versa) and pops a tooltip
 * naming the counterpart -- the matched quad (data vocabulary) over a schema
 * constraint, the shape path (schema vocabulary) over a data triple.
 *
 * Works by **document**, not editor: markers live on the shared document markup
 * model (so they show in every editor of the file, and don't depend on an
 * editor being ready yet), and a single mouse listener on the global
 * [EditorFactory] multicaster serves any editor -- which is what makes hovering
 * work without first clicking an editor to "activate" it.  A mouse-exit clears
 * the transient brighten so nothing lingers when the pointer leaves.
 */
class ShexCrossHighlighter(private val project: Project) : Disposable {
    private data class R(val startLine: Int, val startChar: Int, val endLine: Int, val endChar: Int)
    private data class Corr(val conformant: Boolean, val schema: List<R>, val data: List<R>,
                            val quad: String?, val path: String?, val message: String?)

    private var corr: List<Corr> = emptyList()
    private var schemaDoc: Document? = null
    private var dataDoc: Document? = null
    private val persistent = mutableListOf<Pair<MarkupModel, RangeHighlighter>>()
    private val transient = mutableListOf<Pair<MarkupModel, RangeHighlighter>>()
    private var lastHits: List<Corr> = emptyList()
    private var lastHint: String? = null
    private var balloon: Balloon? = null

    init {
        val mc = EditorFactory.getInstance().eventMulticaster
        mc.addEditorMouseMotionListener(object : EditorMouseMotionListener {
            override fun mouseMoved(e: EditorMouseEvent) = onMouseMoved(e)
        }, this)
        mc.addEditorMouseListener(object : EditorMouseListener {
            override fun mouseExited(e: EditorMouseEvent) { clearTransient(); hideHint() }
        }, this)
    }

    /** Point at the entry's schema/data *documents* (nulls to clear). */
    fun setDocuments(schema: Document?, data: Document?) {
        clearAll()
        schemaDoc = schema
        dataDoc = data
        markAll()
    }

    fun setCorrespondences(json: JsonArray?) {
        val list = ArrayList<Corr>()
        json?.forEach { el ->
            val o = el.asJsonObject
            list.add(Corr(o.get("status")?.asString != "nonconformant",
                ranges(o.getAsJsonArray("schema")), ranges(o.getAsJsonArray("data")),
                str(o, "quad"), str(o, "path"), str(o, "message")))
        }
        corr = list
        clearTransient(); hideHint()
        markAll()   // wash matches + squiggle failures right away
    }

    override fun dispose() { clearAll() }   // the mouse listeners are removed with `this`

    // --- mouse --------------------------------------------------------------

    private fun onMouseMoved(e: EditorMouseEvent) {
        val doc = e.editor.document
        val side = when (doc) { schemaDoc -> "schema"; dataDoc -> "data"; else -> return }
        val offset = e.offset
        val hits = corr.filter { c -> (if (side == "schema") c.schema else c.data).any { within(doc, it, offset) } }
        paintTransient(hits)
        showHint(e, side, hits)
    }

    // --- markers on the shared document markup (visible in every editor) -----

    private fun markupOf(doc: Document): MarkupModel = DocumentMarkupModel.forDocument(doc, project, true)

    private fun markAll() {
        clearPersistent()
        for (c in corr) {
            val attrs = if (c.conformant) WASH else ERROR_MARK
            val layer = if (c.conformant) HighlighterLayer.SELECTION - 2 else HighlighterLayer.WARNING
            schemaDoc?.let { d -> c.schema.forEach { add(persistent, d, it, attrs, layer) } }
            dataDoc?.let { d -> c.data.forEach { add(persistent, d, it, attrs, layer) } }
        }
    }

    private fun paintTransient(hits: List<Corr>) {
        if (hits == lastHits) return          // still over the same correspondence
        lastHits = hits
        clearTransient()
        for (h in hits) {
            val attrs = if (h.conformant) MATCH else FAIL
            schemaDoc?.let { d -> h.schema.forEach { add(transient, d, it, attrs, HighlighterLayer.SELECTION - 1) } }
            dataDoc?.let { d -> h.data.forEach { add(transient, d, it, attrs, HighlighterLayer.SELECTION - 1) } }
        }
    }

    private fun add(into: MutableList<Pair<MarkupModel, RangeHighlighter>>, doc: Document,
                    r: R, attrs: TextAttributes, layer: Int) {
        val start = offsetOf(doc, r.startLine, r.startChar)
        val end = offsetOf(doc, r.endLine, r.endChar)
        if (end <= start) return
        val mm = markupOf(doc)
        into.add(mm to mm.addRangeHighlighter(start, end, layer, attrs, HighlighterTargetArea.EXACT_RANGE))
    }

    private fun offsetOf(doc: Document, line: Int, char: Int): Int {
        if (doc.lineCount == 0) return 0
        val l = line.coerceIn(0, doc.lineCount - 1)
        return (doc.getLineStartOffset(l) + char).coerceIn(0, doc.textLength)
    }

    private fun within(doc: Document, r: R, offset: Int): Boolean =
        offset in offsetOf(doc, r.startLine, r.startChar)..offsetOf(doc, r.endLine, r.endChar)

    private fun clearPersistent() { persistent.forEach { (mm, h) -> runCatching { mm.removeHighlighter(h) } }; persistent.clear() }
    private fun clearTransient() { transient.forEach { (mm, h) -> runCatching { mm.removeHighlighter(h) } }; transient.clear(); lastHits = emptyList() }
    private fun clearAll() { clearPersistent(); clearTransient(); hideHint() }

    // --- the mouseover tooltip (matched quad over schema, shape path over data) ---

    private fun showHint(e: EditorMouseEvent, sideName: String, hits: List<Corr>) {
        val texts = LinkedHashSet<String>()
        for (h in hits) {
            val t = if (sideName == "schema") h.quad else h.path   // the other doc's vocabulary
            if (!t.isNullOrEmpty())
                texts.add(esc(t) + (if (!h.conformant && !h.message.isNullOrEmpty()) " — " + esc(h.message) else ""))
        }
        val html = texts.joinToString("<br>")
        if (html == lastHint) return
        lastHint = html
        balloon?.hide(); balloon = null
        if (html.isEmpty()) return
        balloon = JBPopupFactory.getInstance()
            .createHtmlTextBalloonBuilder(html, MessageType.INFO, null)
            .setFadeoutTime(4000).createBalloon()
        balloon!!.show(RelativePoint(e.mouseEvent), Balloon.Position.above)
    }

    private fun hideHint() { balloon?.hide(); balloon = null; lastHint = null }
    private fun esc(s: String) = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    private fun ranges(arr: JsonArray?): List<R> {
        val out = ArrayList<R>()
        arr?.forEach {
            val r = it.asJsonObject
            out.add(R(r.get("startLine").asInt, r.get("startChar").asInt, r.get("endLine").asInt, r.get("endChar").asInt))
        }
        return out
    }

    private fun str(o: JsonObject, k: String): String? = o.get(k)?.takeIf { !it.isJsonNull }?.asString

    companion object {
        private val MATCH = TextAttributes().apply { backgroundColor = JBColor(Color(0xC8, 0xE6, 0xC9), Color(0x2E, 0x4A, 0x32)) }
        private val FAIL = TextAttributes().apply { backgroundColor = JBColor(Color(0xFF, 0xCD, 0xD2), Color(0x5A, 0x2A, 0x2A)) }
        private val WASH = TextAttributes().apply { backgroundColor = JBColor(Color(0xE1, 0xF2, 0xE5), Color(0x23, 0x33, 0x28)) }
        private val ERROR_MARK = TextAttributes().apply {
            effectType = EffectType.WAVE_UNDERSCORE
            effectColor = JBColor(Color(0xD1, 0x34, 0x38), Color(0xF2, 0x6D, 0x6D))
        }
    }
}
