package org.shexjs.jetbrains

import com.intellij.icons.AllIcons
import com.intellij.lang.Language
import com.intellij.openapi.fileTypes.LanguageFileType
import javax.swing.Icon

/**
 * ShEx-family languages and file types.
 *
 * These are intentionally thin: this plugin ships no lexer, parser or syntax
 * highlighter. Their only job is to give the ShEx-specific file extensions a
 * stable IntelliJ [Language] id that the LSP4IJ `languageMapping` entries in
 * plugin.xml can bind to the server.
 *
 * Only ShEx's *own* languages are defined here. RDF data companions
 * (`.ttl` / `.trig` / `.turtle`) are deliberately NOT given a Language of their
 * own — `com.intellij.lang.Language(id)` throws on a duplicate id, and a second
 * "Turtle" language would collide with any RDF/Turtle plugin the user already
 * has. Those files are attached to the server by filename pattern instead (see
 * the `fileNamePatternMapping` in plugin.xml), which also lets them coexist with
 * such a plugin.
 *
 * The [Language] id (the string passed to the constructor below) must match the
 * `language=` attribute of the corresponding `<fileType>` and `<languageMapping>`
 * in plugin.xml.
 */

object ShExCLanguage : Language("ShExC")
object ShapeMapLanguage : Language("ShapeMap")
object ShExJLanguage : Language("ShExJ")
object ShExRLanguage : Language("ShExR")

/** Shared plumbing so each concrete file type is a couple of lines. */
abstract class ShexFileType(
    language: Language,
    private val typeName: String,
    private val typeDescription: String,
    private val extension: String,
) : LanguageFileType(language) {
    override fun getName(): String = typeName
    override fun getDescription(): String = typeDescription
    override fun getDefaultExtension(): String = extension
    override fun getIcon(): Icon = AllIcons.FileTypes.Text
}

class ShExCFileType private constructor() :
    ShexFileType(ShExCLanguage, "ShExC", "ShEx schema (ShExC)", "shex") {
    companion object {
        @JvmField
        val INSTANCE = ShExCFileType()
    }
}

class ShapeMapFileType private constructor() :
    ShexFileType(ShapeMapLanguage, "ShapeMap", "ShEx shape map", "shapemap") {
    companion object {
        @JvmField
        val INSTANCE = ShapeMapFileType()
    }
}

class ShExJFileType private constructor() :
    ShexFileType(ShExJLanguage, "ShExJ", "ShEx schema (JSON / ShExJ)", "shexj") {
    companion object {
        @JvmField
        val INSTANCE = ShExJFileType()
    }
}

class ShExRFileType private constructor() :
    ShexFileType(ShExRLanguage, "ShExR", "ShEx schema (RDF / ShExR)", "shexr") {
    companion object {
        @JvmField
        val INSTANCE = ShExRFileType()
    }
}
