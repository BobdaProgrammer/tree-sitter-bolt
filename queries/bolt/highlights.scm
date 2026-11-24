; =========================
; Keywords
; =========================

[
  "let"
  "pub"
  "fn"
  "for"
  "if"
  "else"
  "return"
  "defer"
  "range"
  "break"
  "continue"
  "struct"
  "new"
  "import"
  "as"
  "switch"
  "case"
] @keyword


; =========================
; Literals
; =========================

(integer) @number
(float) @number

(boolean) @boolean

(string) @string

(comment) @comment


; =========================
; Variables
; =========================

; Variable being declared
(let_statement
  (identifier) @variable)

; Variables used inside expressions
(binary_expression
  (identifier) @variable)

; Variables returned
(return_statement
  (binary_expression
    (identifier) @variable))

; Generic identifiers that occur inside expressions
(expression_statement
  (identifier) @variable)


; =========================
; Function definitions
; =========================

; Name of a function stored in a let
(let_statement
  (identifier) @function)

; Function parameters
(parameter
  (identifier) @variable.parameter)


; =========================
; Function calls
; =========================

(call_expression
  (identifier) @function.call)


; =========================
; Operators
; =========================

[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "="
  "+="
  "-="
  "*="
  "/="
  "&&"
  "||"
  "!"
] @operator


; =========================
; Punctuation
; =========================

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  ","
  ":"
  ";"
  "."
] @punctuation.delimiter
