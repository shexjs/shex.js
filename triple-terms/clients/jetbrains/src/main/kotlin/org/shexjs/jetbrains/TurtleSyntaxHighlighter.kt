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

/** The lexical token kinds [TurtleLexer] emits. */
object TurtleTokens {
    val COMMENT = IElementType("TTL_COMMENT", TurtleLanguage)
    val STRING = IElementType("TTL_STRING", TurtleLanguage)
    val IRI = IElementType("TTL_IRI", TurtleLanguage)
    val PREFIXED_NAME = IElementType("TTL_PREFIXED_NAME", TurtleLanguage)
    val KEYWORD = IElementType("TTL_KEYWORD", TurtleLanguage)
    val LANGTAG = IElementType("TTL_LANGTAG", TurtleLanguage)
    val NUMBER = IElementType("TTL_NUMBER", TurtleLanguage)
    val BRACE = IElementType("TTL_BRACE", TurtleLanguage)
    val PUNCT = IElementType("TTL_PUNCT", TurtleLanguage)
}

/**
 * Base (lexical) syntax highlighting for Turtle / TriG, so the manifest
 * browser's data panes are readable.  Colors follow the user's theme by keying
 * off the platform's `DefaultLanguageHighlighterColors`.  The language server's
 * semantic-token overlay is applied by LSP4IJ on top of this.
 */
class TurtleSyntaxHighlighter : SyntaxHighlighterBase() {
    override fun getHighlightingLexer(): Lexer = TurtleLexer()

    override fun getTokenHighlights(tokenType: IElementType): Array<TextAttributesKey> = when (tokenType) {
        TurtleTokens.COMMENT -> COMMENT_KEYS
        TurtleTokens.STRING -> STRING_KEYS
        TurtleTokens.IRI -> IRI_KEYS
        TurtleTokens.PREFIXED_NAME -> PREFIXED_NAME_KEYS
        TurtleTokens.KEYWORD -> KEYWORD_KEYS
        TurtleTokens.LANGTAG -> LANGTAG_KEYS
        TurtleTokens.NUMBER -> NUMBER_KEYS
        TurtleTokens.BRACE -> BRACE_KEYS
        TurtleTokens.PUNCT -> PUNCT_KEYS
        TokenType.BAD_CHARACTER -> BAD_KEYS
        else -> TextAttributesKey.EMPTY_ARRAY
    }

    companion object {
        private val COMMENT = createTextAttributesKey("TTL_COMMENT", DefaultLanguageHighlighterColors.LINE_COMMENT)
        private val STRING = createTextAttributesKey("TTL_STRING", DefaultLanguageHighlighterColors.STRING)
        private val IRI = createTextAttributesKey("TTL_IRI", DefaultLanguageHighlighterColors.METADATA)
        private val PREFIXED_NAME = createTextAttributesKey("TTL_PREFIXED_NAME", DefaultLanguageHighlighterColors.INSTANCE_FIELD)
        private val KEYWORD = createTextAttributesKey("TTL_KEYWORD", DefaultLanguageHighlighterColors.KEYWORD)
        private val LANGTAG = createTextAttributesKey("TTL_LANGTAG", DefaultLanguageHighlighterColors.LABEL)
        private val NUMBER = createTextAttributesKey("TTL_NUMBER", DefaultLanguageHighlighterColors.NUMBER)
        private val BRACE = createTextAttributesKey("TTL_BRACE", DefaultLanguageHighlighterColors.BRACES)
        private val PUNCT = createTextAttributesKey("TTL_PUNCT", DefaultLanguageHighlighterColors.OPERATION_SIGN)
        private val BAD = createTextAttributesKey("TTL_BAD", HighlighterColors.BAD_CHARACTER)

        private val COMMENT_KEYS = arrayOf(COMMENT)
        private val STRING_KEYS = arrayOf(STRING)
        private val IRI_KEYS = arrayOf(IRI)
        private val PREFIXED_NAME_KEYS = arrayOf(PREFIXED_NAME)
        private val KEYWORD_KEYS = arrayOf(KEYWORD)
        private val LANGTAG_KEYS = arrayOf(LANGTAG)
        private val NUMBER_KEYS = arrayOf(NUMBER)
        private val BRACE_KEYS = arrayOf(BRACE)
        private val PUNCT_KEYS = arrayOf(PUNCT)
        private val BAD_KEYS = arrayOf(BAD)
    }
}

/** Registers [TurtleSyntaxHighlighter] for the Turtle language (see plugin.xml). */
class TurtleSyntaxHighlighterFactory : SyntaxHighlighterFactory() {
    override fun getSyntaxHighlighter(project: Project?, virtualFile: VirtualFile?): SyntaxHighlighter =
        TurtleSyntaxHighlighter()
}
