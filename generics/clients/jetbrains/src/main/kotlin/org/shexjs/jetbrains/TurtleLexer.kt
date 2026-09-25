package org.shexjs.jetbrains

import com.intellij.lexer.LexerBase
import com.intellij.psi.TokenType
import com.intellij.psi.tree.IElementType

/**
 * A lexer-only tokenizer for Turtle / TriG, just enough for **base** syntax
 * highlighting of the RDF data panes.  Like [ShExCLexer] it is deliberately not
 * a parser: the language server (via LSP4IJ) supplies the semantics.  It paints
 * only the lexical layer: comments, strings (including triple-quoted), IRIs,
 * prefixed names and blank-node labels, keywords (`@prefix`/`@base`/SPARQL-style
 * `PREFIX`/`BASE`, `GRAPH`, `a`, `true`/`false`), language tags, numbers and
 * punctuation.
 *
 * It matches one of [patterns] at each position (longest-first by list order),
 * falling back to a single BAD_CHARACTER so every character is covered and the
 * lexer can never stall.
 */
class TurtleLexer : LexerBase() {
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
        // Order matters: whitespace and comments first, then the multi-char
        // tokens (triple-quoted strings, keywords) before the shorter ones and
        // the single-char punctuation that could otherwise steal them.
        private val patterns: List<Pair<Regex, IElementType>> = listOf(
            Regex("""\s+""") to TokenType.WHITE_SPACE,
            Regex("""#[^\n]*""") to TurtleTokens.COMMENT,
            // triple-quoted long strings (may span lines), then single-line ones
            Regex("\"\"\"(?:\\\\.|[^\\\\])*?\"\"\"", RegexOption.DOT_MATCHES_ALL) to TurtleTokens.STRING,
            Regex("'''(?:\\\\.|[^\\\\])*?'''", RegexOption.DOT_MATCHES_ALL) to TurtleTokens.STRING,
            Regex("\"(?:[^\"\\\\\\n]|\\\\.)*\"") to TurtleTokens.STRING,
            Regex("'(?:[^'\\\\\\n]|\\\\.)*'") to TurtleTokens.STRING,
            Regex("""<[^>\s<>"{}|^`\\]*>""") to TurtleTokens.IRI,
            // @prefix / @base directives and their SPARQL-style PREFIX / BASE forms
            Regex("""@?(?:prefix|base|PREFIX|BASE)\b""") to TurtleTokens.KEYWORD,
            // TriG's GRAPH, the rdf:type shorthand and the boolean literals
            Regex("""\b(?:GRAPH|graph|true|false)\b""") to TurtleTokens.KEYWORD,
            // a language tag following a literal (@en, @en-US) -- after the @-keywords
            Regex("""@[A-Za-z]+(?:-[A-Za-z0-9]+)*""") to TurtleTokens.LANGTAG,
            Regex("""[+-]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?""") to TurtleTokens.NUMBER,
            // blank-node label, then a prefixed name (prefix and/or local may be empty)
            Regex("""_:[A-Za-z0-9_](?:[\w.\-])*""") to TurtleTokens.PREFIXED_NAME,
            Regex("""(?:[A-Za-z_][\w.\-]*)?:(?:[A-Za-z_][\w.%\-]*)?""") to TurtleTokens.PREFIXED_NAME,
            Regex("""\ba\b""") to TurtleTokens.KEYWORD, // rdf:type shorthand
            Regex("""[{}()\[\]]""") to TurtleTokens.BRACE,
            Regex("""[;,.^@*+?=~!/&\-]""") to TurtleTokens.PUNCT,
        )
    }
}
