package org.shexjs.jetbrains

import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.openapi.project.Project
import com.redhat.devtools.lsp4ij.LanguageServerFactory
import com.redhat.devtools.lsp4ij.server.OSProcessStreamConnectionProvider
import com.redhat.devtools.lsp4ij.server.StreamConnectionProvider
import java.nio.file.Paths

/**
 * Registers the ShEx language server (packages/shex-language-server) with LSP4IJ.
 *
 * LSP4IJ drives diagnostics, hover, go-to-definition, find-references, the
 * document outline, completion and the `shex.validate` command automatically
 * once the server is connected; this plugin only launches the process and lets
 * LSP4IJ speak LSP to it over stdio. The `languageMapping` /
 * `fileNamePatternMapping` entries in plugin.xml decide which files connect and
 * which LSP `languageId` each is announced with.
 */
class ShexLanguageServerFactory : LanguageServerFactory {
    override fun createConnectionProvider(project: Project): StreamConnectionProvider =
        ShexLanguageServer(project)
}

/**
 * Launches `node <server.js> --stdio` (or, for a packaged bin, `<bin> --stdio`).
 *
 * The server location is resolved, in order:
 *  1. the `SHEX_LANGUAGE_SERVER` environment variable, if set — either a path to
 *     a built `server.js` or a globally-installed `shex-language-server` bin;
 *  2. otherwise the copy built inside this monorepo, assuming the project open in
 *     the IDE is the shex.js repo root:
 *         <projectBase>/packages/shex-language-server/lib/server.js
 *     (this plugin lives at clients/jetbrains/, a sibling of packages/, so the
 *     server sits two levels up from here and back down into packages/).
 *
 * `node` (and a bare bin name) are resolved from PATH by GeneralCommandLine; we
 * inherit the user's console environment so their Node install is found.
 */
private class ShexLanguageServer(project: Project) : OSProcessStreamConnectionProvider() {
    init {
        val server = resolveServerPath(project)

        // A *.js path is run through Node; anything else is treated as an
        // executable server bin (e.g. a globally-installed `shex-language-server`).
        val commandLine =
            if (server.endsWith(".js"))
                GeneralCommandLine("node", server, "--stdio")
            else
                GeneralCommandLine(server, "--stdio")

        // Inherit PATH etc. so `node` (and a bare bin) resolve like they do in a
        // terminal; run from the project root so the server's relative lookups
        // (e.g. resolving imported schemas/data) start there.
        commandLine.withParentEnvironmentType(GeneralCommandLine.ParentEnvironmentType.CONSOLE)
        project.basePath?.let { commandLine.withWorkDirectory(it) }

        super.setCommandLine(commandLine)
    }

    private fun resolveServerPath(project: Project): String {
        // 1. Explicit override.
        System.getenv("SHEX_LANGUAGE_SERVER")
            ?.takeIf { it.isNotBlank() }
            ?.let { return it }

        // 2. Monorepo default, relative to the opened project (== repo root).
        project.basePath?.let { base ->
            return Paths.get(base, "packages", "shex-language-server", "lib", "server.js")
                .toString()
        }

        // 3. Last resort: hope a `shex-language-server` bin is on PATH.
        return "shex-language-server"
    }
}
