package org.shexjs.jetbrains

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

/**
 * Populates the "ShEx Manifest" tool window with the project's
 * [ShexManifestBrowser] panel (the JCEF web view).  The panel is empty until
 * [ShexOpenManifestBrowserAction] hands it a manifest to load.
 */
class ShexManifestToolWindowFactory : ToolWindowFactory {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val browser = project.getService(ShexManifestBrowser::class.java)
        val content = ContentFactory.getInstance().createContent(browser.component, "", false)
        toolWindow.contentManager.addContent(content)
    }
}
