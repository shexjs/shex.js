package org.shexjs.jetbrains

import com.intellij.icons.AllIcons
import com.intellij.lang.Language
import com.intellij.openapi.fileTypes.LanguageFileType
import javax.swing.Icon

/**
 * ShEx-family languages and file types.
 *
 * Each gives a set of extensions a stable IntelliJ [Language] id that the
 * LSP4IJ `languageMapping` entries in plugin.xml bind to the server, and that a
 * `SyntaxHighlighterFactory` can hang base highlighting off of.
 *
 * RDF data companions (`.ttl` / `.trig` / `.turtle`) get a Turtle language too,
 * so the data panes are highlighted (see [TurtleSyntaxHighlighter]).  Its id is
 * the ShEx-specific "ShExTurtle", NOT "Turtle": `com.intellij.lang.Language(id)`
 * throws on a duplicate id, and a bare "Turtle" would collide at class-load with
 * any RDF plugin that already defines it.  The server is *also* bound to these
 * files by filename pattern (see `fileNamePatternMapping`), so even a foreign
 * plugin owning `.ttl` doesn't cost you validation.
 *
 * The [Language] id (the string passed to the constructor below) must match the
 * `language=` attribute of the corresponding `<fileType>` and `<languageMapping>`
 * in plugin.xml.
 */

object ShExCLanguage : Language("ShExC")
object ShapeMapLanguage : Language("ShapeMap")
object ShExJLanguage : Language("ShExJ")
object ShExRLanguage : Language("ShExR")
object TurtleLanguage : Language("ShExTurtle") {
    override fun getDisplayName(): String = "Turtle"
}

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

/** RDF data documents (Turtle / TriG), the companions a schema validates. */
class TurtleFileType private constructor() :
    ShexFileType(TurtleLanguage, "ShExTurtle", "RDF data (Turtle / TriG)", "ttl") {
    companion object {
        @JvmField
        val INSTANCE = TurtleFileType()
    }
}
