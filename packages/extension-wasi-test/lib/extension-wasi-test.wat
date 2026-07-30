;; =============================================================================
;; extension-wasi-test.wat
;;
;; The ShEx "Test" semantic-action extension <http://shex.io/extensions/Test/>,
;; hand-written in WebAssembly text format (WAT).  Parsing, argument assembly
;; and printing all happen in Wasm; printing goes through WASI — the
;; WebAssembly System Interface (wasi_snapshot_preview1), the standardized
;; "libc analog" syscall layer for Wasm runtimes.  fd_write is the
;; writev(2)-shaped call that wasi-libc's printf() bottoms out in.
;;
;; Grammar (byte-for-byte mirror of @shexjs/extension-test's regexp;
;; only 0x20 counts as space, exactly as in the regexp's ` *`):
;;
;;   invocation ::= SP* ("print" | "fail") SP* "(" arg (SP* "," arg)* SP* ")" SP*
;;   arg        ::= SP* (string | position)
;;   string     ::= '"' dqchar* '"'  |  "'" sqchar* "'"
;;   dqchar     ::= any byte except 0x5C or 0x22  |  "\\"  |  "\""
;;   sqchar     ::= any byte except 0x5C or 0x27  |  "\\"  |  "\'"
;;   position   ::= "s" | "p" | "o"
;;
;; Semantics (mirroring shex-extension-test.js):
;;   - each string arg contributes its body with the outer quotes stripped and
;;     the two escape sequences decoded — \\ and \<quote> each yield their
;;     second character — per the Test extension definition;
;;   - each position arg contributes the RDF term .value of the matched
;;     triple's subject/predicate/object, supplied by the host as UTF-8;
;;   - the args are concatenated (no separator) into "the line";
;;   - the line plus "\n" is printed to WASI fd 1 with a single gathered
;;     fd_write (one ciovec for the line, one for the newline), retrying on
;;     partial writes;
;;   - "print" reports success, "fail" reports a SemActFailure — the host
;;     maps these onto the ShEx SemActHandler dispatch() protocol.
;;
;; ABI:
;;   exports:
;;     memory                                    linear memory, min 2 pages
;;     _initialize                               WASI reactor entry point (no-op)
;;     inputBase   : const i32                   where the host packs inputs
;;     dispatch(codePtr, codeLen,
;;              sPtr, sLen, pPtr, pLen,
;;              oPtr, oLen) -> status : i32
;;     linePtr, lineLen : mut i32                the assembled line (valid when
;;                                               status is 1 or 0)
;;     errCode : mut i32                         WASI errno after WRITE_ERROR;
;;                                               position letter after NO_TRIPLE
;;
;;   status codes returned by dispatch():
;;      1  PASS         code matched "print"; line assembled and printed
;;      0  FAIL         code matched "fail";  line assembled and printed
;;     -1  NO_MATCH     code didn't match the grammar above
;;     -2  NO_TRIPLE    a position arg was used but that term is absent
;;                      (its length was passed as -1); errCode = the letter
;;     -3  WRITE_ERROR  fd_write returned an errno (in errCode) or made
;;                      no progress
;;     -4  OOM          memory.grow refused to enlarge the line buffer
;;
;;   host protocol:
;;     - pack code and any term .values as UTF-8 anywhere at/above inputBase
;;       (growing the exported memory first if needed), leaving at least 16
;;       bytes of slack after the last input: the keyword matcher reads whole
;;       little-endian i32s and relies on that slack to stay in bounds;
;;     - pass length -1 for each term that is not in scope (e.g. startActs);
;;     - dispatch() builds the line just past the inputs, growing memory as
;;       needed, so input pointers stay valid for the whole call.
;;
;; Memory map:
;;   16..31     ciovec[2] for fd_write        { buf: u32, buf_len: u32 } * 2
;;   32..35     fd_write's nwritten out-cell
;;   40         the newline byte
;;   4096..     host-packed inputs (code, s, p, o)
;;   above      the assembled line (placed 8 bytes past the last input)
;; =============================================================================
(module $shex_extension_wasi_test

  ;; The one "syscall" this module needs.
  ;; fd_write(fd, *ciovecs, ciovec_count, *nwritten) -> errno
  (import "wasi_snapshot_preview1" "fd_write"
    (func $fd_write (param $fd i32) (param $iovs i32) (param $iovs_len i32)
                    (param $nwritten i32) (result i32)))

  (memory (export "memory") 2)

  ;; ---- fixed low-memory addresses -------------------------------------------
  (global $IOVS     i32 (i32.const 16))  ;; ciovec[2]
  (global $NWRITTEN i32 (i32.const 32))  ;; fd_write out-cell
  (global $NL       i32 (i32.const 40))  ;; "\n"
  (data (i32.const 40) "\n")

  ;; ---- host-facing globals --------------------------------------------------
  (global $inputBase (export "inputBase") i32 (i32.const 4096))

  (global $linePtr (export "linePtr") (mut i32) (i32.const 0))
  (global $lineLen (export "lineLen") (mut i32) (i32.const 0))
  (global $errCode (export "errCode") (mut i32) (i32.const 0))

  ;; ---- line under construction ----------------------------------------------
  (global $lineBase (mut i32) (i32.const 0))
  (global $lineEnd  (mut i32) (i32.const 0))

  ;; WASI reactor entry point: nothing to set up, but hosts (e.g. node:wasi's
  ;; initialize()) expect it.
  (func (export "_initialize"))

  ;; ---------------------------------------------------------------------------
  ;; ensure: make linear memory at least $need bytes long.
  ;; -> 0 on success, OOM if memory.grow refuses.
  ;; ---------------------------------------------------------------------------
  (func $ensure (param $need i32) (result i32)
    (local $cur i32)
    (local.set $cur (i32.mul (memory.size) (i32.const 65536)))
    (if (i32.gt_u (local.get $need) (local.get $cur))
      (then
        (if (i32.eq
              (memory.grow
                (i32.div_u
                  (i32.add (i32.sub (local.get $need) (local.get $cur))
                           (i32.const 65535))
                  (i32.const 65536)))
              (i32.const -1))
          (then (return (i32.const -4))))))     ;; OOM
    (i32.const 0))

  ;; ---------------------------------------------------------------------------
  ;; append: copy $len bytes at $src onto the end of the line.
  ;; -> 0 on success, OOM if the line buffer can't grow.
  ;; ---------------------------------------------------------------------------
  (func $append (param $src i32) (param $len i32) (result i32)
    (local $rc i32)
    (local.set $rc (call $ensure (i32.add (global.get $lineEnd) (local.get $len))))
    (if (i32.ne (local.get $rc) (i32.const 0))
      (then (return (local.get $rc))))
    (memory.copy (global.get $lineEnd) (local.get $src) (local.get $len))
    (global.set $lineEnd (i32.add (global.get $lineEnd) (local.get $len)))
    (i32.const 0))

  ;; ---------------------------------------------------------------------------
  ;; skipSpaces: advance $i past 0x20 bytes (only — the grammar's ` *`).
  ;; ---------------------------------------------------------------------------
  (func $skipSpaces (param $p i32) (param $len i32) (param $i i32) (result i32)
    (block $done
      (loop $more
        (br_if $done (i32.ge_u (local.get $i) (local.get $len)))
        (br_if $done (i32.ne (i32.load8_u (i32.add (local.get $p) (local.get $i)))
                             (i32.const 0x20)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $more)))
    (local.get $i))

  ;; ---------------------------------------------------------------------------
  ;; parseQuoted: scan a quoted string whose opening quote $q (0x22 or 0x27)
  ;; has already been consumed; $i indexes the first body byte.  Validates the
  ;; escape rule (backslash may be followed only by backslash or $q) and
  ;; appends the body with each escape decoded to its second character: plain
  ;; runs are flushed with bulk copies, escaped characters as single bytes.
  ;; Multi-byte UTF-8 passes through untouched: every continuation byte is
  ;; >= 0x80 and so can't collide with quote or backslash.
  ;; -> the index just past the closing quote, or a negative status.
  ;; ---------------------------------------------------------------------------
  (func $parseQuoted (param $p i32) (param $len i32) (param $i i32) (param $q i32)
                     (result i32)
    (local $start i32)
    (local $b i32)
    (local $rc i32)
    (local.set $start (local.get $i))
    (block $done
      (loop $more
        ;; unterminated string
        (if (i32.ge_u (local.get $i) (local.get $len))
          (then (return (i32.const -1))))       ;; NO_MATCH
        (local.set $b (i32.load8_u (i32.add (local.get $p) (local.get $i))))
        (br_if $done (i32.eq (local.get $b) (local.get $q)))
        (if (i32.eq (local.get $b) (i32.const 0x5c))  ;; backslash
          (then
            (if (i32.ge_u (i32.add (local.get $i) (i32.const 1)) (local.get $len))
              (then (return (i32.const -1))))   ;; NO_MATCH: dangling backslash
            (local.set $b (i32.load8_u (i32.add (i32.add (local.get $p) (local.get $i))
                                                (i32.const 1))))
            (if (i32.and (i32.ne (local.get $b) (i32.const 0x5c))
                         (i32.ne (local.get $b) (local.get $q)))
              (then (return (i32.const -1))))   ;; NO_MATCH: bad escape
            ;; flush the plain run [start, i), then the escape's second character
            (local.set $rc (call $append (i32.add (local.get $p) (local.get $start))
                                         (i32.sub (local.get $i) (local.get $start))))
            (if (i32.ne (local.get $rc) (i32.const 0))
              (then (return (local.get $rc))))
            (local.set $rc (call $append (i32.add (i32.add (local.get $p) (local.get $i))
                                                  (i32.const 1))
                                 (i32.const 1)))
            (if (i32.ne (local.get $rc) (i32.const 0))
              (then (return (local.get $rc))))
            (local.set $i (i32.add (local.get $i) (i32.const 2)))
            (local.set $start (local.get $i)))
          (else
            (local.set $i (i32.add (local.get $i) (i32.const 1)))))
        (br $more)))
    ;; append the trailing plain run [start, i)
    (local.set $rc (call $append (i32.add (local.get $p) (local.get $start))
                                 (i32.sub (local.get $i) (local.get $start))))
    (if (i32.ne (local.get $rc) (i32.const 0))
      (then (return (local.get $rc))))
    (i32.add (local.get $i) (i32.const 1)))     ;; step past the closing quote

  ;; ---------------------------------------------------------------------------
  ;; printLine: write the line plus "\n" to WASI fd 1 as one gathered
  ;; fd_write — ciovec[0] is the line, ciovec[1] the newline — retrying with
  ;; adjusted ciovecs until every byte is written.
  ;; -> 0, or WRITE_ERROR with the errno (or 0 for a stalled write) in errCode.
  ;; ---------------------------------------------------------------------------
  (func $printLine (result i32)
    (local $p0 i32) (local $l0 i32)             ;; first pending ciovec
    (local $p1 i32) (local $l1 i32)             ;; second pending ciovec
    (local $w i32)                              ;; bytes written this round
    (local $errno i32)
    (local.set $p0 (global.get $linePtr))
    (local.set $l0 (global.get $lineLen))
    (local.set $p1 (global.get $NL))
    (local.set $l1 (i32.const 1))
    (block $done
      (loop $more
        ;; if the first ciovec is spent, promote the second
        (if (i32.eqz (local.get $l0))
          (then
            (local.set $p0 (local.get $p1))
            (local.set $l0 (local.get $l1))
            (local.set $l1 (i32.const 0))))
        (br_if $done (i32.eqz (local.get $l0))) ;; nothing left to write
        (i32.store           (global.get $IOVS) (local.get $p0))
        (i32.store offset=4  (global.get $IOVS) (local.get $l0))
        (i32.store offset=8  (global.get $IOVS) (local.get $p1))
        (i32.store offset=12 (global.get $IOVS) (local.get $l1))
        (local.set $errno
          (call $fd_write
            (i32.const 1)                       ;; WASI fd 1: stdout
            (global.get $IOVS)
            (select (i32.const 2) (i32.const 1) (local.get $l1))
            (global.get $NWRITTEN)))
        (if (i32.ne (local.get $errno) (i32.const 0))
          (then
            (global.set $errCode (local.get $errno))
            (return (i32.const -3))))           ;; WRITE_ERROR
        (local.set $w (i32.load (global.get $NWRITTEN)))
        (if (i32.eqz (local.get $w))
          (then
            (global.set $errCode (i32.const 0))
            (return (i32.const -3))))           ;; WRITE_ERROR: no progress
        ;; consume $w bytes from the pending ciovecs
        (if (i32.lt_u (local.get $w) (local.get $l0))
          (then
            (local.set $p0 (i32.add (local.get $p0) (local.get $w)))
            (local.set $l0 (i32.sub (local.get $l0) (local.get $w))))
          (else
            (local.set $w (i32.sub (local.get $w) (local.get $l0)))
            (local.set $p0 (i32.add (local.get $p1) (local.get $w)))
            (local.set $l0 (i32.sub (local.get $l1) (local.get $w)))
            (local.set $l1 (i32.const 0))))
        (br $more)))
    (i32.const 0))

  ;; ---------------------------------------------------------------------------
  ;; dispatch: the extension entry point.  See the ABI comment at the top.
  ;; ---------------------------------------------------------------------------
  (func (export "dispatch")
        (param $codeP i32) (param $codeL i32)
        (param $sP i32) (param $sL i32)
        (param $pP i32) (param $pL i32)
        (param $oP i32) (param $oL i32)
        (result i32)
    (local $i i32)
    (local $b i32)
    (local $verdict i32)
    (local $rc i32)
    (local $end i32)
    (local $tP i32)
    (local $tL i32)

    (global.set $errCode (i32.const 0))
    (global.set $linePtr (i32.const 0))
    (global.set $lineLen (i32.const 0))

    ;; ---- carve the line buffer out just past the caller's inputs ----
    (local.set $end (i32.add (local.get $codeP) (local.get $codeL)))
    (if (i32.ne (local.get $sL) (i32.const -1))
      (then (if (i32.gt_u (i32.add (local.get $sP) (local.get $sL)) (local.get $end))
        (then (local.set $end (i32.add (local.get $sP) (local.get $sL)))))))
    (if (i32.ne (local.get $pL) (i32.const -1))
      (then (if (i32.gt_u (i32.add (local.get $pP) (local.get $pL)) (local.get $end))
        (then (local.set $end (i32.add (local.get $pP) (local.get $pL)))))))
    (if (i32.ne (local.get $oL) (i32.const -1))
      (then (if (i32.gt_u (i32.add (local.get $oP) (local.get $oL)) (local.get $end))
        (then (local.set $end (i32.add (local.get $oP) (local.get $oL)))))))
    (global.set $lineBase (i32.add (local.get $end) (i32.const 8)))
    (global.set $lineEnd  (global.get $lineBase))

    ;; ---- keyword: "print" | "fail" ----
    ;; Whole-word comparison via one unaligned little-endian i32 load plus a
    ;; byte: "prin" = 0x6e697270, "fail" = 0x6c696166.  i32.and evaluates both
    ;; operands, so the load may run even when the bounds test is false; the
    ;; host's 16 bytes of post-input slack keep it in bounds, and the bounds
    ;; conjunct still gates acceptance.
    (local.set $i (call $skipSpaces (local.get $codeP) (local.get $codeL) (i32.const 0)))
    (if (i32.and
          (i32.le_u (i32.add (local.get $i) (i32.const 5)) (local.get $codeL))
          (i32.and
            (i32.eq (i32.load (i32.add (local.get $codeP) (local.get $i)))
                    (i32.const 0x6e697270))                          ;; "prin"
            (i32.eq (i32.load8_u (i32.add (i32.add (local.get $codeP) (local.get $i))
                                          (i32.const 4)))
                    (i32.const 0x74))))                              ;; "t"
      (then
        (local.set $verdict (i32.const 1))                           ;; PASS
        (local.set $i (i32.add (local.get $i) (i32.const 5))))
      (else
        (if (i32.and
              (i32.le_u (i32.add (local.get $i) (i32.const 4)) (local.get $codeL))
              (i32.eq (i32.load (i32.add (local.get $codeP) (local.get $i)))
                      (i32.const 0x6c696166)))                       ;; "fail"
          (then
            (local.set $verdict (i32.const 0))                       ;; FAIL
            (local.set $i (i32.add (local.get $i) (i32.const 4))))
          (else (return (i32.const -1))))))                          ;; NO_MATCH

    ;; ---- "(" ----
    (local.set $i (call $skipSpaces (local.get $codeP) (local.get $codeL) (local.get $i)))
    (if (i32.ge_u (local.get $i) (local.get $codeL))
      (then (return (i32.const -1))))                                ;; NO_MATCH
    (if (i32.ne (i32.load8_u (i32.add (local.get $codeP) (local.get $i)))
                (i32.const 0x28))                                    ;; "("
      (then (return (i32.const -1))))                                ;; NO_MATCH
    (local.set $i (i32.add (local.get $i) (i32.const 1)))

    ;; ---- argument list: arg ("," arg)* ")" ----
    (block $argsDone
      (loop $nextArg
        (local.set $i (call $skipSpaces (local.get $codeP) (local.get $codeL) (local.get $i)))
        (if (i32.ge_u (local.get $i) (local.get $codeL))
          (then (return (i32.const -1))))                            ;; NO_MATCH
        (local.set $b (i32.load8_u (i32.add (local.get $codeP) (local.get $i))))
        (if (i32.or (i32.eq (local.get $b) (i32.const 0x22))         ;; '"'
                    (i32.eq (local.get $b) (i32.const 0x27)))        ;; "'"
          (then
            ;; string argument
            (local.set $i (call $parseQuoted (local.get $codeP) (local.get $codeL)
                                             (i32.add (local.get $i) (i32.const 1))
                                             (local.get $b)))
            (if (i32.lt_s (local.get $i) (i32.const 0))
              (then (return (local.get $i)))))
          (else
            ;; position argument: s | p | o
            (if (i32.eq (local.get $b) (i32.const 0x73))             ;; "s"
              (then (local.set $tP (local.get $sP)) (local.set $tL (local.get $sL)))
              (else (if (i32.eq (local.get $b) (i32.const 0x70))     ;; "p"
                (then (local.set $tP (local.get $pP)) (local.set $tL (local.get $pL)))
                (else (if (i32.eq (local.get $b) (i32.const 0x6f))   ;; "o"
                  (then (local.set $tP (local.get $oP)) (local.set $tL (local.get $oL)))
                  (else (return (i32.const -1))))))))                ;; NO_MATCH
            (if (i32.eq (local.get $tL) (i32.const -1))
              (then
                (global.set $errCode (local.get $b))
                (return (i32.const -2))))                            ;; NO_TRIPLE
            (local.set $rc (call $append (local.get $tP) (local.get $tL)))
            (if (i32.ne (local.get $rc) (i32.const 0))
              (then (return (local.get $rc))))
            (local.set $i (i32.add (local.get $i) (i32.const 1)))))
        ;; ---- "," continues the list, ")" ends it ----
        (local.set $i (call $skipSpaces (local.get $codeP) (local.get $codeL) (local.get $i)))
        (if (i32.ge_u (local.get $i) (local.get $codeL))
          (then (return (i32.const -1))))                            ;; NO_MATCH
        (local.set $b (i32.load8_u (i32.add (local.get $codeP) (local.get $i))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br_if $nextArg  (i32.eq (local.get $b) (i32.const 0x2c)))   ;; ","
        (br_if $argsDone (i32.eq (local.get $b) (i32.const 0x29)))   ;; ")"
        (return (i32.const -1))))                                    ;; NO_MATCH

    ;; ---- only trailing spaces may remain ----
    (local.set $i (call $skipSpaces (local.get $codeP) (local.get $codeL) (local.get $i)))
    (if (i32.ne (local.get $i) (local.get $codeL))
      (then (return (i32.const -1))))                                ;; NO_MATCH

    ;; ---- expose the line and print it ----
    (global.set $linePtr (global.get $lineBase))
    (global.set $lineLen (i32.sub (global.get $lineEnd) (global.get $lineBase)))
    (local.set $rc (call $printLine))
    (if (i32.ne (local.get $rc) (i32.const 0))
      (then (return (local.get $rc))))
    (local.get $verdict))
)
