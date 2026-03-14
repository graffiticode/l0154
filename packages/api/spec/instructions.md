# L0154 Instructions

L0154 is a Graffiticode language for creating magic square math puzzles.

## Overview

Use L0154 to create interactive magic square puzzles where students fill in missing numbers so that all rows, columns, and diagonals sum to the same value.

## Available Functions

- `initializeGrid` -- Initialize the grid with dimensions and configuration
- `showFeedback` -- Control feedback display for student responses
- `magicSquare` -- Create a magic square puzzle
- `problemStatement` -- Set the problem statement text
- `expression` -- Set the mathematical expression or constraint
- `table` -- Configure the table layout
- `cols` -- Set the number of columns
- `rows` -- Set the number of rows

## Example

```
magicSquare problemStatement "The magic number is" initializeGrid true showFeedback true expression "15"..
```
