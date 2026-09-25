package org.shexjs.jetbrains

import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys

/**
 * Editor right-click actions for validate-by-pointing (see
 * [ShexPointingValidator]).  Each is shown only in the editor it makes sense
 * in -- a data document for the node, a schema for the shape -- keyed off the
 * file extension (which also covers the manifest browser's `entry*.data.ttl` /
 * `entry*.schema.shex` panes).
 */
private val DATA_EXTS = setOf("ttl", "trig", "turtle", "n3", "nt")
private val SCHEMA_EXTS = setOf("shex", "shexc")

private fun validator(e: AnActionEvent) =
    e.project?.getService(ShexPointingValidator::class.java)

private fun extOf(e: AnActionEvent): String? =
    e.getData(CommonDataKeys.VIRTUAL_FILE)?.extension?.lowercase()

/** Right-click a node in a data document → mark it as the focus node. */
class ValidateThisNodeAction : AnAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT
    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.getData(CommonDataKeys.EDITOR) != null && extOf(e) in DATA_EXTS
    }
    override fun actionPerformed(e: AnActionEvent) {
        val editor = e.getData(CommonDataKeys.EDITOR) ?: return
        validator(e)?.markNode(editor)
    }
}

/** Right-click a shape name in a schema → mark it as the shape to validate against. */
class ValidateAgainstThisShapeAction : AnAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT
    override fun update(e: AnActionEvent) {
        e.presentation.isEnabledAndVisible = e.getData(CommonDataKeys.EDITOR) != null && extOf(e) in SCHEMA_EXTS
    }
    override fun actionPerformed(e: AnActionEvent) {
        val editor = e.getData(CommonDataKeys.EDITOR) ?: return
        validator(e)?.markShape(editor)
    }
}

/** Re-validate the last node/shape pair against the current (edited) documents. */
class RevalidateAction : AnAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT
    override fun actionPerformed(e: AnActionEvent) { validator(e)?.revalidate() }
}

/** Toggle re-validating the last pair automatically a beat after each edit. */
class ToggleAutoValidateAction : AnAction() {
    override fun getActionUpdateThread() = ActionUpdateThread.BGT
    override fun actionPerformed(e: AnActionEvent) { validator(e)?.toggleAutoValidate() }
}
