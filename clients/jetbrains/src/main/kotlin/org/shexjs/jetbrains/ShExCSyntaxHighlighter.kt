package org.shexjs.jetbrains

import com.intellij.lexer.Lexer
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors
import com.intellij.openapi.editor.HighlighterColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.editor.colors.TextAttributesKey.createTextAttributesKey
import com.intellij.openapi.fileTypes.SyntaxHighlighter
import com.intellij.openapi.fileTypes.SyntaxHighlighterBase
import com.intellij.openapi.fileTypes.SyntaxHighlighterFactory
import com.intellij.openapi.project.Project
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.psi.TokenType
import com.intellij.psi.tree.IElementType

/** The lexical token kinds [ShExCLexer] emits. */
object ShExCTokens {
    val COMMENT = IElementType("SHEXC_COMMENT", ShExCLanguage)
    val STRING = IElementType("SHEXC_STRING", ShExCLanguage)
    val IRI = IElementType("SHEXC_IRI", ShExCLanguage)
    val PREFIXED_NAME = IElementType("SHEXC_PREFIXED_NAME", ShExCLanguage)
    val KEYWORD = IElementType("SHEXC_KEYWORD", ShExCLanguage)
    val NUMBER = IElementType("SHEXC_NUMBER", ShExCLanguage)
    val BRACE = IElementType("SHEXC_BRACE", ShExCLanguage)
    val PUNCT = IElementType("SHEXC_PUNCT", ShExCLanguage)
}

/**
 * Base (lexical) syntax highlighting for ShExC.  Colors follow the user's theme
 * by keying off the platform's `DefaultLanguageHighlighterColors`.  The language
 * server's semantic-token overlay (shape declaration vs. reference) is applied
 * by LSP4IJ on top of this.
 */
class ShExCSyntaxHighlighter : SyntaxHighlighterBase() {
    override fun getHighlightingLexer(): Lexer = ShExCLexer()

    override fun getTokenHighlights(tokenType: IElementType): Array<TextAttributesKey> = when (tokenType) {
        ShExCTokens.COMMENT -> COMMENT_KEYS
        ShExCTokens.STRING -> STRING_KEYS
        ShExCTokens.IRI -> IRI_KEYS
        ShExCTokens.PREFIXED_NAME -> PREFIXED_NAME_KEYS
        ShExCTokens.KEYWORD -> KEYWORD_KEYS
        ShExCTokens.NUMBER -> NUMBER_KEYS
        ShExCTokens.BRACE -> BRACE_KEYS
        ShExCTokens.PUNCT -> PUNCT_KEYS
        TokenType.BAD_CHARACTER -> BAD_KEYS
        else -> TextAttributesKey.EMPTY_ARRAY
    }

    companion object {
        private val COMMENT = createTextAttributesKey("SHEXC_COMMENT", DefaultLanguageHighlighterColors.LINE_COMMENT)
        private val STRING = createTextAttributesKey("SHEXC_STRING", DefaultLanguageHighlighterColors.STRING)
        private val IRI = createTextAttributesKey("SHEXC_IRI", DefaultLanguageHighlighterColors.METADATA)
        private val PREFIXED_NAME = createTextAttributesKey("SHEXC_PREFIXED_NAME", DefaultLanguageHighlighterColors.INSTANCE_FIELD)
        private val KEYWORD = createTextAttributesKey("SHEXC_KEYWORD", DefaultLanguageHighlighterColors.KEYWORD)
        private val NUMBER = createTextAttributesKey("SHEXC_NUMBER", DefaultLanguageHighlighterColors.NUMBER)
        private val BRACE = createTextAttributesKey("SHEXC_BRACE", DefaultLanguageHighlighterColors.BRACES)
        private val PUNCT = createTextAttributesKey("SHEXC_PUNCT", DefaultLanguageHighlighterColors.OPERATION_SIGN)
        private val BAD = createTextAttributesKey("SHEXC_BAD", HighlighterColors.BAD_CHARACTER)

        private val COMMENT_KEYS = arrayOf(COMMENT)
        private val STRING_KEYS = arrayOf(STRING)
        private val IRI_KEYS = arrayOf(IRI)
        private val PREFIXED_NAME_KEYS = arrayOf(PREFIXED_NAME)
        private val KEYWORD_KEYS = arrayOf(KEYWORD)
        private val NUMBER_KEYS = arrayOf(NUMBER)
        private val BRACE_KEYS = arrayOf(BRACE)
        private val PUNCT_KEYS = arrayOf(PUNCT)
        private val BAD_KEYS = arrayOf(BAD)
    }
}

/** Registers [ShExCSyntaxHighlighter] for the ShExC language (see plugin.xml). */
class ShExCSyntaxHighlighterFactory : SyntaxHighlighterFactory() {
    override fun getSyntaxHighlighter(project: Project?, virtualFile: VirtualFile?): SyntaxHighlighter =
        ShExCSyntaxHighlighter()
}
