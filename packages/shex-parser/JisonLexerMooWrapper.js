const Moo = require('moo');

class JisonLexerMooWrapper {
  static ELLIPSIS = "…";
  static CONTEXT_SIZE = 20;

  /**
   * construct a JisonLexerMooWrapper given textMatchingRules from a JisonLexer
   * example:
   *   JisonLexerMooWrapper.CONTEXT_SIZE = 50; // 50 before error and 50 after
   *   JisonLexerMooWrapper.ELLIPSIS = "..."; // don't want to see the default U+202E
   *   const _jisonLexer = new ShExJisonLexer(ShExCParserState);
   *   const wrapper = new JisonLexerMooWrapper (
   *     _jisonLexer,
   *     _jisonLexer.textMatchingRules.slice(0, -3), // elide <<EOF>>, unexpected word and unexpected character
   *     // https://github.com/shexjs/shex.js/blob/594a149e199af68a13715fca28ea1b9a2c3488ba/packages/shex-parser/lib/ShExJison.jison#L389-L391
   *     [0] // \s+|{COMMENT} is skipped
   *     // https://github.com/shexjs/shex.js/blob/594a149e199af68a13715fca28ea1b9a2c3488ba/packages/shex-parser/lib/ShExJison.jison#L292
   *   );
   *   const parser = new ShExJisonParser(ShExCParserState, wrapper);
   * @param jisonLexer a compiled JisonLexer with a performAction method which treats yytext and maps pattern offsets to constants shared with JisonLexer.
   * @param textMatchingRules a list of regular expressions typically compiled into an instance of a JisonLexer.
   * @param textSkippingRules list like the textMatchingRules, but includes the skipped patterns, e.g. whitespace and comments.
   * @param eofRuleOrdinal offset in _jisonLexer's rules which matches EOF, a la `<<EOF>> return 'EOF';`. Should be outside of the textMatchingRules.
   */
  constructor (jisonLexer, textMatchingRules, textSkippingRules, eofRuleOrdinal) {
    this._jisonLexer = jisonLexer;
    this.options = jisonLexer.options;
    const mooRules = (textMatchingRules || jisonLexer.rules).reduce((acc, re, ord) => {
      const reStr = re.toString();
      const reSubtr = reStr.substring(2, reStr.length - 1);
      const re2 = new RegExp(reSubtr);
      // Moo result.type attribute is a string even though we supply numbers here.
      acc[ord] = { match: re2, lineBreaks: re2.test('\n') };
      return acc;
    }, { WS: { match: / +/, lineBreaks: true } });
    this._skipped = textSkippingRules.map(i => "" + i); // again, 'cause .type is a string
    this._moo = Moo.compile(mooRules);
    this._eofRuleOrdinal = eofRuleOrdinal;
    this._lastOffset = 0; // will be set on call to setInput
  }

  /**
   * Set the input text (no, doesn't work on a stream; PR anyone?).
   * @param text string to be parsed.
   * @param yy YY object (see lex and yacc documentation) shared between parser and lexer.
   */
  setInput (text, yy) {
    this.yy = yy;
    this._text = text;
    this._moo.reset(text);
    this._lastOffset = 0;
  }

  /**
   * Get the next non-skipped token from the input text.
   * @returns {*} a constant shared with the JisonParser.
   */
  lex () {
    let mooRet;
    do {
      mooRet = this._moo.next();
    } while (mooRet !== undefined && this._skipped.indexOf(mooRet.type) !== -1);
      
    // e.g. {"type":"11","value":"<http://a.example/S1>","text":"<http://a.example/S1>","offset":0,"lineBreaks":0,"line":1,"col":1}
    if (mooRet === undefined) {
      this.yyetxt = "";
      this.yyleng = 0;
      mooRet = { type: "" + this._eofRuleOrdinal };
    } else {
      this._lastOffset = mooRet.offset + mooRet.text.length;
      this.yylloc = {
        "first_line": mooRet.line,
        "last_line": mooRet.line,
        "first_column": mooRet.col,
        "last_column": mooRet.col + mooRet.text.length
      };
      this.yytext = mooRet.text;
      this.yyleng = mooRet.text.length;
      this.yylineno = mooRet.line = 1;
    }
    return this._jisonLexer.performAction(this.yy, this, parseInt(mooRet.type), 'INITIAL');
  }

  /**
   * Return context where currently parsing the input string.
   * @returns {string}
   */
  showPosition () {
    const pre = this.pastInput();
    const c = new Array(pre.length + 1).join("-");
    const upcomingInput = this.upcomingInput();
    return pre + upcomingInput + "\n" + c + "^";
  }
  pastInput () {
    const past = this._text.substr(0, this._lastOffset);
    return (past.length > JisonLexerMooWrapper.CONTEXT_SIZE ? JisonLexerMooWrapper.ELLIPSIS : '') + past.substr(-JisonLexerMooWrapper.CONTEXT_SIZE).replace(/\n/g, "\\n");
  }
  upcomingInput () {
    const next = this._text.length - this._lastOffset > JisonLexerMooWrapper.CONTEXT_SIZE
      ? this._text.substr(this._lastOffset, JisonLexerMooWrapper.CONTEXT_SIZE) + JisonLexerMooWrapper.ELLIPSIS
      : this._text.substr(this._lastOffset, this._text.length - this._lastOffset);
    return next.replace(/\n/g, "\\n");
  }
}

module.exports = {JisonLexerMooWrapper};
