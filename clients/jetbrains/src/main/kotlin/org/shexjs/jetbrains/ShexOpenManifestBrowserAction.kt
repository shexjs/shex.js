package org.shexjs.jetbrains

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.fileChooser.FileChooser
import com.intellij.openapi.fileChooser.FileChooserDescriptorFactory
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.openapi.wm.ToolWindowManager

/**
 * "Open ShEx Manifest Browser" (Tools menu): picks a YAML manifest -- the file
 * in the current editor if it is YAML, otherwise a file chooser -- reveals the
 * ShEx Manifest tool window, and loads it.
 */
class ShexOpenManifestBrowserAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val file = pickManifest(e) ?: return
        val toolWindow = ToolWindowManager.getInstance(project).getToolWindow(TOOL_WINDOW_ID)
        if (toolWindow == null) {
            // Should not happen (registered in plugin.xml), but load anyway.
            project.getService(ShexManifestBrowser::class.java).open(file)
            return
        }
        // Activate first (realizes the panel via the tool-window factory), then load.
        toolWindow.activate({ project.getService(ShexManifestBrowser::class.java).open(file) }, true)
    }

    private fun pickManifest(e: AnActionEvent): VirtualFile? {
        val current = e.getData(CommonDataKeys.VIRTUAL_FILE)
        if (current != null && isYaml(current)) return current
        val descriptor = FileChooserDescriptorFactory.createSingleFileDescriptor()
            .withTitle("Select a ShEx Manifest (YAML)")
            .withFileFilter { isYaml(it) }
        return FileChooser.chooseFile(descriptor, e.project, null)
    }

    private fun isYaml(f: VirtualFile) = f.extension.equals("yaml", true) || f.extension.equals("yml", true)

    companion object { const val TOOL_WINDOW_ID = "ShEx Manifest" }
}
