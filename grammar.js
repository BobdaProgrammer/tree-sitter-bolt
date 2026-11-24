/**
 * @file Tree sitter for bolt
 * @author BobdaProgrammer
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: 'bolt',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,
conflicts: $ => [
  [$.block, $.hash_literal],
  [$.switch_body, $.hash_literal],
], 
rules: {
    // =========================================================
    // Program
    // =========================================================

    source_file: $ => repeat($._statement),

    _statement: $ => choice(
      $.let_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.struct_statement,
      $.import_statement,
      $.pub_statement,
      $.expression_statement,
    ),

    // =========================================================
    // Statements
    // =========================================================

    let_statement: $ => seq(
      'let',
      choice(
        $.identifier,
        $.field_access,
        $.index_expression,
        $.array_literal
      ),
      '=',
      $._expression,
      optional(';'),
    ),

    return_statement: $ => seq(
      'return',
      choice(
        seq(
          $._expression,
          repeat(seq(',', $._expression)),
        ),
        ';',
      ),
    ),

    break_statement: $ => seq(
      'break',
      optional(';'),
    ),

    continue_statement: $ => seq(
      'continue',
      optional(';'),
    ),

    pub_statement: $ => seq(
      'pub',
      $._statement,
    ),

    import_statement: $ => seq(
      'import',
      $.string,
      optional(';'),
    ),

    struct_statement: $ => seq(
      'struct',
      $.identifier,
      '{',
      optional(comma_sep1($.identifier)),
      '}',
    ),

    expression_statement: $ => seq(
      $._expression,
      optional(';'),
    ),

    // =========================================================
    // Expressions
    // =========================================================

    _expression: $ => choice(
      $.identifier,
      $.integer,
      $.float,
      $.boolean,
      $.null,
      $.string,

      $.prefix_expression,
      $.binary_expression,

      $.grouped_expression,

      $.if_expression,
      $.for_expression,
      $.switch_expression,
      $.defer_expression,

      $.function_literal,

      $.array_literal,
      $.hash_literal,

      $.struct_instantiation,

      $.call_expression,
      $.index_expression,
      $.slice_expression,
      $.field_access,

      $.assignment_expression,
      $.struct_type_conversion,
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer: $ => /\d+/,

    float: $ => /\d+\.\d+/,

    boolean: $ => choice(
      'true',
      'false',
    ),

    null: $ => 'null',

    // =========================================================
    // Strings
    // =========================================================

    string: $ => choice(
      $.double_quoted_string,
      $.single_quoted_string,
      $.backtick_string,
    ),

    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.escape_sequence,
        /[^"\\\n]/,
      )),
      '"',
    ),

    single_quoted_string: $ => seq(
      "'",
      repeat(choice(
        $.escape_sequence,
        /[^'\\\n]/,
      )),
      "'",
    ),

    backtick_string: $ => seq(
      '`',
      repeat(choice(
        $.escape_sequence,
        /[^`\\\n]/,
      )),
      '`',
    ),

    escape_sequence: $ => token(
      seq('\\', /./),
    ),

    // =========================================================
    // Prefix
    // =========================================================

    prefix_expression: $ => prec(
      12,
      seq(
        choice(
          '!',
          '-',
          '...',
        ),
        $._expression,
      ),
    ),

    // =========================================================
    // Binary operators
    // =========================================================

    binary_expression: $ => choice(

      prec.left(
        4,
        seq(
          $._expression,
          '&&',
          $._expression,
        ),
      ),

      prec.left(
        5,
        seq(
          $._expression,
          '||',
          $._expression,
        ),
      ),

      prec.left(
        6,
        seq(
          $._expression,
          choice('==', '!='),
          $._expression,
        ),
      ),

      prec.left(
        7,
        seq(
          $._expression,
          choice('<', '>', '<=', '>='),
          $._expression,
        ),
      ),

      prec.left(
        8,
        seq(
          $._expression,
          choice('+', '-'),
          $._expression,
        ),
      ),

      prec.left(
        9,
        seq(
          $._expression,
          '%',
          $._expression,
        ),
      ),

      prec.left(
        10,
        seq(
          $._expression,
          choice('*', '/'),
          $._expression,
        ),
      ),
    ),

    // =========================================================
    // Grouping
    // =========================================================

    grouped_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    // =========================================================
    // If
    // =========================================================

    if_expression: $ => seq(
      'if',
      $._expression,
      $.block,
      optional($.else_clause),
    ),

    else_clause: $ => seq(
      'else',
      choice(
        $.if_expression,
        $.block,
      ),
    ),

    // =========================================================
    // For
    // =========================================================

// =========================================================
// For
// =========================================================
for_expression: $ => choice(
  // for {}
  seq(
    'for',
    $.block
  ),

  // for condition {}
  seq(
    'for',
    $._expression,
    $.block
  ),

  // for value = range expression {}
  // for value, index = range expression {}
  seq(
    'for',
    $.identifier,
    optional(seq(
      ',',
      $.identifier
    )),
    '=',
    'range',
    $._expression,
    $.block
  )
),
    // =========================================================
    // Switch
    // =========================================================

switch_expression: $ => choice(
  // switch {}
  seq(
    'switch',
    $.switch_body
  ),

  // switch expression {}
  seq(
    'switch',
    $._expression,
    $.switch_body
  )
),

switch_body: $ => seq(
  '{',
  repeat($.switch_case),
  '}'
),

switch_case: $ => seq(
  'case',
  $._expression,
  ':',
  repeat($._statement)
),

    // =========================================================
    // Blocks
    // =========================================================

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    // =========================================================
    // Defer
    // =========================================================

    defer_expression: $ => seq(
      'defer',
      $._expression,
    ),

    // =========================================================
    // Functions
    // =========================================================

    function_literal: $ => seq(
      'fn',
      '(',
      optional(comma_sep1($.parameter)),
      ')',
      $.block,
    ),

    parameter: $ => $.identifier,

    // =========================================================
    // Arrays
    // =========================================================

    array_literal: $ => seq(
      '[',
      optional(comma_sep1($._expression)),
      ']',
    ),

    index_expression: $ => prec.left(
      14,
      seq(
        $._expression,
        '[',
        $._expression,
        ']',
      ),
    ),

    slice_expression: $ => prec.left(
      14,
      seq(
        $._expression,
        '[',
        $._expression,
        ':',
        $._expression,
        ']',
      ),
    ),

    // =========================================================
    // Hash
    // =========================================================

    hash_literal: $ => seq(
      '{',
      optional(comma_sep1($.hash_pair)),
      '}',
    ),

    hash_pair: $ => seq(
      $._expression,
      ':',
      $._expression,
    ),

    // =========================================================
    // Structs
    // =========================================================

    struct_instantiation: $ => seq(
      'new',
      $._expression,
      '{',
      optional(comma_sep1($.struct_field)),
      '}',
    ),

    struct_field: $ => seq(
      $.identifier,
      ':',
      $._expression,
    ),

    struct_type_conversion: $ => prec.left(
      11,
      seq(
        $.identifier,
        'as',
        $.identifier,
      ),
    ),

    // =========================================================
    // Calls
    // =========================================================

    call_expression: $ => prec.left(
      13,
      seq(
        $._expression,
        '(',
        optional(comma_sep1($._expression)),
        ')',
      ),
    ),

    // =========================================================
    // Field access
    // =========================================================

    field_access: $ => prec.left(
      15,
      seq(
        $._expression,
        '.',
        $._expression,
      ),
    ),

    // =========================================================
    // Assignment
    // =========================================================

    assignment_expression: $ => prec.right(
      2,
      seq(
        choice(
          $.identifier,
          $.field_access,
          $.index_expression,
        ),
        choice(
          '=',
          '+=',
          '-=',
          '*=',
          '/=',
        ),
        $._expression,
      ),
    ),

    // =========================================================
    // Comments
    // =========================================================

    comment: $ => token(
      seq(
        '//',
        /.*/,
      ),
    ),
  },
});


function comma_sep1(rule) {
  return seq(
    rule,
    repeat(seq(',', rule)),
    optional(','),
  );
}
