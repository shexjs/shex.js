package org.shexjs.jetbrains

import com.intellij.openapi.diagnostic.logger
import com.intellij.openapi.project.Project
import com.intellij.util.concurrency.AppExecutorUtil
import com.redhat.devtools.lsp4ij.LanguageServerItem
import com.redhat.devtools.lsp4ij.LanguageServerManager
import org.eclipse.lsp4j.ExecuteCommandParams
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit

/**
 * Running the ShEx language server's `workspace/executeCommand`s through LSP4IJ,
 * shared by the manifest browser and the pointing validator.
 *
 * The one footgun to know: `LanguageServerManager.StartOptions` defaults to
 * `forceRestart=true`, so a bare `start(id)` RESTARTS an already-running server.
 * `getLanguageServer` starts nothing, so on a cold call we force-*start* once
 * (never restart) and poll until it is up.
 */
object ShexLsp {
    const val SERVER_ID = "shexLanguageServer"
    private const val MAX_START_POLLS = 10 // ~3s at 300ms, for a cold start
    private val LOG = logger<ShexLsp>()

    /** Run a server command and complete with its (Gson-decodable) result, or an
     * `{errors:[...]}` map if the server isn't running. */
    fun executeCommand(project: Project, command: String, args: List<Any?>): CompletableFuture<Any?> {
        return startedServer(project).thenCompose { item ->
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

    /** The running server, force-starting (never restarting) once on a cold call
     * and polling until it is up (or giving up after a few seconds). */
    fun startedServer(project: Project): CompletableFuture<LanguageServerItem?> {
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
}
