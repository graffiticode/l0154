// SPDX-License-Identifier: MIT
import assert from "assert";
import {
  Checker as BasisChecker,
  Transformer as BasisTransformer,
  Compiler as BasisCompiler
} from '@graffiticode/basis';

import { Parser } from '@artcompiler/parselatex';

import katex from 'katex';

export class Checker extends BasisChecker {
}

const scaleTerms = ({ terms, scale }) =>
      terms.map(row => row.map(val => val + scale));

export class Transformer extends BasisTransformer {
  MAGIC_SQUARE(node, options, resume) {
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        try {
          const data = options?.data || {};
          const order = 3;
          const sum = +v1.expression;
          assert(sum % order === 0, "invalid sum: " + sum);
          const scale = sum / 3 - 5;  // FIXME make work for higher order squares.
          const terms = scaleTerms({
            scale,
            terms: [
              [4, 3, 8],
              [9, 5, 1],
              [2, 7, 6],
            ],
          });
          const err = [];
          const val = {
            ...v0,
            ...v1,
            terms,
            ...data,
          };
          resume(err, val);
        } catch (err) {
          console.log("catch err=" + err);
          resume([], {err: err.toString()});
        }
      });
    });
  }

  INITIALIZE_GRID(node, options, resume) {
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const data = options?.data || {};
        const initializeGrid =
              data.initializeGrid !== undefined
              ? data.initializeGrid
              : v0;
        const err = [];
        const val = {
          ...v1,
          initializeGrid,
        };
        resume(err, val);
      });
    });
  }

  SHOW_FEEDBACK(node, options, resume) {
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const data = options?.data || {};
        const showFeedback =
              data.showFeedback !== undefined
              ? data.showFeedback
              : v0;
        const err = [];
        const val = {
          ...v1,
          showFeedback,
        };
        resume(err, val);
      });
    });
  }

  TABLE(node, options, resume) {
    this.visit(node.elts[1], options, async (e1, v1) => {
      this.visit(node.elts[0], options, async (e0, v0) => {
        const err = [];
        const val ={
          ...v0,
          ...v1
        };
        resume(err, val);
      });
    });
  }

  PROBLEM_STATEMENT(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = [];
      const val = {
        problemStatement: v0,
      };
      resume(err, val);
    });
  }

  EXPRESSION(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const expression = data.expression || v0;
      const val = {
        expression,
      };
      resume(err, val);
    });
  }

  COLS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = {
        cols: v0,
      };
      resume(err, val);
    });
  }

  ROWS(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const data = options?.data || {};
      const err = [];
      const val = {
        rows: v0,
      };
      resume(err, val);
    });
  }

  PROG(node, options, resume) {
    this.visit(node.elts[0], options, async (e0, v0) => {
      const err = e0;
      const val = v0.pop();
      console.log("PROG() val=" + JSON.stringify(val, null, 2));
      resume(err, {
        ...val,
      });
    });
  }
}

export const compiler = new BasisCompiler({
  langID: '0002',
  version: 'v0.0.1',
  Checker: Checker,
  Transformer: Transformer,
});
