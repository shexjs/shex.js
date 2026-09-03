;; @shexjs/extension-wasi library prelude <http://shex.io/extensions/WASI/>.
;;
;; A semantic action whose code does not begin with "(module" is a list of
;; module fields; the extension completes it with these fields and compiles
;; the whole.  The author supplies (func $main ...) — the prelude's _start
;; loads argv (the host-passed bindings) and calls it.  The composed module
;; imports only wasi_snapshot_preview1, so it runs under any WASI host that
;; performs the same composition.
;;
;; Bindings arrive as argv entries "<letter>=<value>" (s, p, o from the
;; matched triple; n for the focus node).  Exit status: 0 pass, 1 fail
;; (use $fail), 2 and up invocation error ($put_* exit 2 when the binding
;; is absent).
;;
;; library:
;;   $put (ptr len)       write bytes to fd 1
;;   $nl ()               write "\n"
;;   $println (ptr len)   $put then $nl
;;   $put_s/p/o/n ()      write a binding's value (exit 2 if absent)
;;   $println_s/p/o/n ()  ditto, newline-terminated
;;   $fail ()             exit(1) — a SemActFailure
;;   $strlen (ptr) -> len NUL-terminated string length
;;
;; memory map (one page, grows if the author asks):
;;   0     argc            4     argv buffer size
;;   16    iovec scratch   32    nwritten scratch
;;   48    argv pointers   1024  "\n"
;;   4096  argv text       8192  author's data segments start here
(import "wasi_snapshot_preview1" "args_sizes_get" (func $args_sizes_get (param i32 i32) (result i32)))
(import "wasi_snapshot_preview1" "args_get" (func $args_get (param i32 i32) (result i32)))
(import "wasi_snapshot_preview1" "fd_write" (func $fd_write (param i32 i32 i32 i32) (result i32)))
(import "wasi_snapshot_preview1" "proc_exit" (func $proc_exit (param i32)))
(memory (export "memory") 1)
(data (i32.const 1024) "\0a")
(func $put (param $ptr i32) (param $len i32)
  (i32.store (i32.const 16) (local.get $ptr))
  (i32.store (i32.const 20) (local.get $len))
  (drop (call $fd_write (i32.const 1) (i32.const 16) (i32.const 1) (i32.const 32))))
(func $nl
  (call $put (i32.const 1024) (i32.const 1)))
(func $println (param $ptr i32) (param $len i32)
  (call $put (local.get $ptr) (local.get $len))
  (call $nl))
(func $strlen (param $p i32) (result i32)
  (local $e i32)
  (local.set $e (local.get $p))
  (block $done
    (loop $l
      (br_if $done (i32.eqz (i32.load8_u (local.get $e))))
      (local.set $e (i32.add (local.get $e) (i32.const 1)))
      (br $l)))
  (i32.sub (local.get $e) (local.get $p)))
(func $put_arg (param $letter i32)
  (local $i i32)
  (local $p i32)
  (local.set $i (i32.const 1))
  (block $done
    (loop $l
      (br_if $done (i32.ge_u (local.get $i) (i32.load (i32.const 0))))
      (local.set $p (i32.load (i32.add (i32.const 48) (i32.mul (local.get $i) (i32.const 4)))))
      (if (i32.and (i32.eq (i32.load8_u (local.get $p)) (local.get $letter))
                   (i32.eq (i32.load8_u (i32.add (local.get $p) (i32.const 1))) (i32.const 61)))
        (then
          (call $put (i32.add (local.get $p) (i32.const 2))
                     (call $strlen (i32.add (local.get $p) (i32.const 2))))
          (return)))
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br $l)))
  (call $proc_exit (i32.const 2)))
(func $put_s (call $put_arg (i32.const 115)))
(func $put_p (call $put_arg (i32.const 112)))
(func $put_o (call $put_arg (i32.const 111)))
(func $put_n (call $put_arg (i32.const 110)))
(func $println_s (call $put_s) (call $nl))
(func $println_p (call $put_p) (call $nl))
(func $println_o (call $put_o) (call $nl))
(func $println_n (call $put_n) (call $nl))
(func $fail
  (call $proc_exit (i32.const 1)))
(func (export "_start")
  (drop (call $args_sizes_get (i32.const 0) (i32.const 4)))
  (drop (call $args_get (i32.const 48) (i32.const 4096)))
  (call $main))
