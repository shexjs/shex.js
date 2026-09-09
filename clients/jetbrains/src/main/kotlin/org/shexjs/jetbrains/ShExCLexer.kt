package org.shexjs.jetbrains

import com.intellij.lexer.LexerBase
import com.intellij.psi.TokenType
import com.intellij.psi.tree.IElementType

/**
 * A lexer-only tokenizer for ShExC, just enough for **base** syntax
 * highlighting.  It is deliberately not a parser: the language server (via
 * LSP4IJ) supplies the semantics -- diagnostics, navigation, and the semantic-
 * token overlay that marks a shape's declaration vs. a reference to it.  This
 * lexer only paints the lexical layer under that: comments, strings, IRIs,
 * prefixed names, keywords, numbers, and punctuation.
 *
 * It matches one of [patterns] at each position (longest-first by list order),
 * falling back to a single BAD_CHARACTER so every character is covered and the
 * lexer can never stall.
 */
class ShExCLexer : LexerBase() {
    private var buffer: CharSequence = ""
    private var endOffset = 0
    private var tokenStart = 0
    private var tokenEnd = 0
    private var currentToken: IElementType? = null

    override fun start(buffer: CharSequence, startOffset: Int, endOffset: Int, initialState: Int) {
        this.buffer = buffer
        this.endOffset = endOffset
        this.tokenStart = startOffset
        this.tokenEnd = startOffset
        advance()
    }

    override fun getState(): Int = 0
    override fun getTokenType(): IElementType? = currentToken
    override fun getTokenStart(): Int = tokenStart
    override fun getTokenEnd(): Int = tokenEnd
    override fun getBufferSequence(): CharSequence = buffer
    override fun getBufferEnd(): Int = endOffset

    override fun advance() {
        tokenStart = tokenEnd
        if (tokenStart >= endOffset) { currentToken = null; return }
        for ((regex, type) in patterns) {
            val m = regex.matchAt(buffer, tokenStart)
            if (m != null && m.value.isNotEmpty()) {
                tokenEnd = (tokenStart + m.value.length).coerceAtMost(endOffset)
                currentToken = type
                return
            }
        }
        tokenEnd = tokenStart + 1
        currentToken = TokenType.BAD_CHARACTER
    }

    companion object {
        // Order matters: whitespace and comments first, then multi-char tokens
        // before the single-char punctuation that could otherwise steal them.
        private val patterns: List<Pair<Regex, IElementType>> = listOf(
            Regex("""\s+""") to TokenType.WHITE_SPACE,
            Regex("""#[^\n]*""") to ShExCTokens.COMMENT,
            // single-line string literals (value sets); escapes allowed
            Regex("\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'") to ShExCTokens.STRING,
            Regex("""<[^>\s<>"{}|^`\\]*>""") to ShExCTokens.IRI,
            Regex("""@?(?:PREFIX|BASE|IMPORT|prefix|base)\b""") to ShExCTokens.KEYWORD,
            Regex("""\b(?:start|EXTERNAL|CLOSED|EXTRA|LITERAL|IRI|BNODE|NONLITERAL|AND|OR|NOT|MININCLUSIVE|MINEXCLUSIVE|MAXINCLUSIVE|MAXEXCLUSIVE|LENGTH|MINLENGTH|MAXLENGTH|TOTALDIGITS|FRACTIONDIGITS|true|false)\b""") to ShExCTokens.KEYWORD,
            Regex("""[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?""") to ShExCTokens.NUMBER,
            Regex("""(?:[A-Za-z_][\w.\-]*)?:(?:[A-Za-z_][\w.%\-]*)?""") to ShExCTokens.PREFIXED_NAME,
            Regex("""\ba\b""") to ShExCTokens.KEYWORD, // rdf:type shorthand
            Regex("""[{}()\[\]]""") to ShExCTokens.BRACE,
            Regex("""[;,.|@*+?=~!/&^\-]""") to ShExCTokens.PUNCT,
        )
    }
}
