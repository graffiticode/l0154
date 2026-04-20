<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# L0154 User Guide

Agent-facing guide for authoring magic square puzzles in L0154. Read this before composing a `create_item` prompt or an `update_item` modification.

## Overview

L0154 is an authoring language for **magic square puzzles** — interactive square grids where students fill in missing numbers so that every row, every column, and both diagonals sum to the same "magic number". Input is a natural-language description of a puzzle; output is an L0154 program whose compiled value is a configured magic square item that the renderer draws as a labeled grid with student response fields and optional feedback. The top-level shape is always a single `magicSquare` call that carries the puzzle configuration — `problemStatement`, `expression` (the magic number or sum constraint), `initializeGrid` (pre-fills to scaffold the puzzle), and `showFeedback`. L0154 is the right tool when the job is "make a magic square puzzle with some cells given and some cells blank"; it is not a generic grid editor, a calculator, or a full assessment item (those belong in L0158).

When composing a request, name the magic number first (the common row/column/diagonal sum, e.g. `15` for a classic 3×3 using 1–9), then the grid size (`rows 3 cols 3` for a standard 3×3; 4×4 and larger are supported), then the scaffolding: a problem statement shown above the grid, a cell map under `initializeGrid` describing which cells are pre-filled (and optionally which are marked as hints vs. fixed givens), and `showFeedback true/false` to toggle per-cell correctness highlighting. A "normal" magic square uses consecutive integers 1..n² exactly once; a "generalized" magic square accepts any integers so long as the sum constraint holds — call that out in the problem statement so the translator doesn't assume the classical case. The `expression` argument is a string; pass the magic number as `"15"`, or a sum identity like `"row = col = diag = 15"` when the pedagogy calls for spelling it out. Every L0154 program terminates with `..`.

In scope: square (and rectangular, when pedagogy allows) magic-sum puzzles; configurable grid dimensions; problem statement text; pre-populated cell values (`initializeGrid`) for hints, worked examples, or partially-revealed puzzles; toggleable feedback; integer cell values (classical 1..n² or generalized). Out of scope: non-sum puzzles (sudoku, kenken, crosswords, logic puzzles), decimal or fractional cells, variable-expression cells, full assessment items with multiple parts and rubrics (use L0158), generic spreadsheet grids (use L0166), and graph/board-style visualizations (use L0172).

## Vocabulary Cues

Say this to get that:

- **Magic square** — `magicSquare ( ... )`. The root of every program. "Build a magic square puzzle".
- **Magic number / sum** — `expression "15"`. The target row/column/diagonal sum. "Each line sums to 15".
- **Rows / cols** — `rows N`, `cols N`. Typically equal (3×3 classic). "A 3 by 3" ⇒ `rows 3 cols 3`; "a 4 by 4" ⇒ `rows 4 cols 4`.
- **Problem statement** — `problemStatement "Fill in the missing numbers so every row, column, and diagonal sums to 15."`. Shown above the grid. "Tell students what to do".
- **Initialize grid** — `initializeGrid {r1c1: "2", r2c2: "5", ...}`. Pre-fills cells as hints or fixed values; omit or pass `true` for a default configuration. "Pre-fill the center with 5" ⇒ populate `r2c2`.
- **Show feedback** — `showFeedback true` or `showFeedback false`. Controls correctness highlighting. "With feedback on / off".
- **Pipe clauses** — chain clauses inside `magicSquare` with `|`: `magicSquare (rows 3 | cols 3 | expression "15" | problemStatement "...")..`, or list them positionally as in the template. Either style composes into a single configuration record.
- **Classical vs. generalized** — a classical magic square uses 1..n² exactly once; a generalized magic square allows any integers. Say "classical 3×3" or "generalized with 7s and 13s" so the translator sets up the cell domain correctly.
- **Program terminator** — every L0154 program ends with `..`.

## Example Prompts

- *"Create a classical 3×3 magic square with magic number 15, show feedback on, and pre-fill the center cell with 5."* → `magic_square_puzzle`
- *"Build a 4×4 magic square with magic sum 34, no pre-filled cells, and the prompt 'Fill in all 16 cells using each number from 1 to 16 exactly once.'"* → `magic_square_puzzle`
- *"Generalized 3×3 magic square where every line sums to 21, with four hint cells given (r1c1=10, r1c3=4, r3c1=1, r3c3=7) and feedback enabled."* → `magic_square_puzzle`
- *"Magic square 3×3 with magic number 15 and the corners already filled in (2, 4, 6, 8) so students only place the remaining five numbers."* → `magic_square_puzzle`
- *"Worked-example magic square: 3×3 fully filled (2 7 6 / 9 5 1 / 4 3 8) with feedback on and the prompt 'Verify that every row, column, and diagonal sums to 15.'"* → `magic_square_puzzle`
- *"5×5 magic square with magic sum 65, feedback off, and the instruction 'Submit when all 25 cells use 1–25 exactly once.'"* → `magic_square_puzzle`

## Out of Scope

- **Non-sum puzzles** — sudoku, kenken, crosswords, logic grids. L0154 only enforces equal row/column/diagonal sums.
- **Non-integer cells** — decimals, fractions, variables. Integer cells only.
- **Full assessment items** — multi-part questions, rubrics, scored answer keys. Use L0158.
- **Generic spreadsheets** — data entry or free-form table layouts belong in L0166.
- **Graph or board layouts** — if the puzzle isn't laid out as an n×n grid, use L0172 or another renderer.
- **Dynamic puzzle generation** — L0154 configures a specific puzzle; runtime generation of fresh puzzles belongs in the translator backend, not the item.
