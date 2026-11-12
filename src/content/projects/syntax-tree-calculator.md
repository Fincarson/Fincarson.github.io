---
title: Syntax_Tree_Calculator
slug: syntax-tree-calculator
start: "2025-02"
end: "2025-03"
featured: false
summary: "A calculator built like a small interpreter in C: it tokenizes input, parses it into a syntax tree and evaluates it."
about:
  - "Syntax_Tree_Calculator is a calculator built like a small interpreter in C: it tokenizes the input, parses it into a syntax tree and evaluates it, with operator precedence, parentheses and variables. I built it to find out what happens between typing 3 + 4 * 2 and seeing 11."
  - You type a line of arithmetic at a prompt. The program breaks it into tokens, parses the tokens into a syntax tree that captures precedence and grouping, then walks the tree to produce the answer. It also prints the tree in prefix notation, so you can see the structure it found.
play:
  - "In src/calculator_recursion, compile the four source files with a C compiler: gcc main.c lex.c parser.c codeGen.c -o calculator"
  - Run the program and type an expression at the >> prompt, for example x = 3 * y + 4.
  - Read the value and the prefix traversal it prints for each line.
  - Press Ctrl+Z on Windows, or Ctrl+D on macOS and Linux, to quit.
playHeading: How to use
playSteps: true
built:
  - I wrote it in C, with no dependencies beyond a C compiler.
  - The grammar is LL(1), so the parser never looks more than one token ahead.
  - It handles integer arithmetic with +, -, * and / in the correct order of precedence, parentheses, and unary plus and minus.
  - Variables and assignment use a symbol table, with x, y and z starting at 0.
  - It reports mismatched parentheses, division by a constant zero and syntax errors.
solo: true
members:
  - Vincent Jefferson (solo project)
stack:
  - C
repo: https://github.com/Fincarson/Syntax_Tree_Calculator
media:
  - src: ../../assets/projects/syntax-tree-calculator/cover.webp
    alt: "Syntax Tree Calculator cover. It reads: Syntax Tree Calculator, with C programming. Between the words, a syntax tree adds 3 times 4 to 2 times 5."
---
