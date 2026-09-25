plugins {
    // Kotlin/JVM for the plugin sources. Must be >= the Kotlin the target
    // platform was built with (2026.2 ships 2.4.x metadata), or compileKotlin
    // fails reading the platform's *.kotlin_module files.
    kotlin("jvm") version "2.4.0"
    // IntelliJ Platform Gradle Plugin 2.x (note: this is NOT the legacy
    // org.jetbrains.intellij 1.x plugin).
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
    mavenCentral()
    // IntelliJ Platform artifacts + JetBrains Marketplace plugins.
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        // IntelliJ IDEA is a single distribution since 2025.3 (the IC/IU split
        // ended), so intellijIdea(version) replaces create("IC"/"IU", version).
        intellijIdea(providers.gradleProperty("platformVersion").get())

        // JCEF (the manifest browser's embedded web view) is a *bundled plugin*
        // since 2026.x, not core platform -- request it so JBCefBrowser / org.cef
        // are on the classpath.
        bundledPlugin("com.intellij.modules.jcef")

        // LSP4IJ: the LSP client runtime we plug into. Declaring it here makes
        // it a compile dependency and a runtime plugin dependency (so runIde
        // installs it, and Marketplace treats it as a required dependency).
        plugin(
            "com.redhat.devtools.lsp4ij",
            providers.gradleProperty("lsp4ijVersion").get(),
        )

    }
}

intellijPlatform {
    pluginConfiguration {
        version = providers.gradleProperty("pluginVersion")
        ideaVersion {
            sinceBuild = providers.gradleProperty("pluginSinceBuild")
            untilBuild = providers.gradleProperty("pluginUntilBuild")
        }
    }
}

kotlin {
    // 2024.2+ runs on JBR 21; build for 21 to match the current platform.
    jvmToolchain(21)
}

// Dev convenience: point the sandbox IDE at this monorepo's built language
// server, so opening a `.shex` file Just Works even when the sandbox's project
// base isn't the shex.js repo (the plugin otherwise reads `project.basePath` --
// which is a throwaway temp dir when you open a single file). The path is
// computed from this module's location, so it isn't machine-specific.
tasks.named<JavaExec>("runIde") {
    environment("SHEX_LANGUAGE_SERVER", file("../../packages/shex-language-server/lib/server.js").absolutePath)
}
