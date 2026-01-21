import type { NodeViewComponentProps } from "@nytimes/react-prosemirror";
import type { ReactNodeViewConstructor } from "@nytimes/react-prosemirror";

function renderErrors(errors: { message: string; from: number; to: number }[]) {
  return (
    <div className="flex flex-col gap-2">
      {errors.map((error, i) => (
        <div
          key={i}
          className="rounded-md p-3 border text-sm bg-red-50 border-red-200 text-red-800"
        >
          {error.message}
        </div>
      ))}
    </div>
  );
}

import GridEditor from "./GridEditor.js";
import "./Form.css";

import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

import katex from 'katex';
import 'katex/dist/katex.min.css';
import parse from 'html-react-parser';

function Paragraph({ children }: NodeViewComponentProps) {
  return <p onClick={() => console.log('click')}>{children}</p>;
}

const buildCell = ({ col, row, attrs }) => {
  const cell = row[col];
  let content;
  let colspan = 1;
  let rowspan = 1;
  let background = "#fff";
  if (typeof cell === "object") {
    content = cell.doc.content;
    colspan = content[0].content[0].content.length;
    rowspan = content[0].content[0].length;
  } else {
    background = attrs.color;
    const text = String(row[col]);
    content = [
      {
        "type": "paragraph",
        "content": row[col] && [
          {
            "type": "text",
            text,
          }
        ]
      }
    ];
  }
  return ({
    "type": "table_cell",
    "attrs": {
      colspan,
      rowspan,
      "colwidth": null,
      "width": "50px",
      "height": "50px",
      background,
    },
    "content": content,
  });
};

const buildRow = ({ cols, row, attrs }) => {
  return ({
    "type": "table_row",
    "content": cols.map(col => {
      return buildCell({col, row, attrs});
    }),
  })
};

const buildTable = ({ cols, rows, attrs }) => {
  return ({
    "type": "table",
    "content": rows.map((row, rowIndex) => {
      return buildRow({cols, row, attrs: attrs[rowIndex]});
    })
  })
};

const buildDocFromTable = ({ cols, rows }) => {
  const attrs = applyRules({ cols, rows });
  return {
    "type": "doc",
    "content": [
      {
        ...buildTable({cols, rows, attrs}),
      },
    ]
  }
};

const applyRules = ({ cols, rows }) => {
  const argsCols = cols.slice(0, cols.length - 1);
  const totalCol = cols[cols.length - 1];
  const rowAttrs = []
  rows.forEach((row, rowIndex) => {
    let total = 0;
    argsCols.forEach(col => {
      total += +row[col];
    });
    if (rowAttrs[rowIndex] === undefined) {
      rowAttrs[rowIndex] = {};
    }
    rowAttrs[rowIndex].color = +row[totalCol] !== total && "#f99" || "#fff";
  });
  return rowAttrs;
};

const makeMagicGrid = ({ order }) => {
  order;
  const modelDoc = buildDocFromTable({
    cols: ["a", "b", "c"],
    rows: [
      {a: "", b: "", c: ""},
      {a: "", b: "", c: ""},
      {a: "", b: "", c: ""},
    ],
  });
  return modelDoc;
};

export function ModelEditor({ state }) {
  const reactNodeViews: Record<string, ReactNodeViewConstructor> = {
    paragraph: () => ({
      component: Paragraph,
      dom: document.createElement("div"),
      contentDOM: document.createElement("div"),
    }),
  };
  let { modelDoc, order } = state.data;
  if (modelDoc === undefined) {
    modelDoc = makeMagicGrid({order});
  }
  return (
    <GridEditor
      state={state}
      doc={modelDoc}
      reactNodeViews={reactNodeViews}
    />
  );
}

export function Form({ state }) {
  if (Array.isArray(state.data?.errors) && state.data.errors.length > 0) {
    return renderErrors(state.data.errors);
  }
  const { expression, problemStatement } = state.data;
  const html = katex.renderToString(expression, {
    displayMode: true,
    output: "html",
    throwOnError: false
  });
  return (
    (state === undefined || state.data === undefined) &&
    <div /> ||
    <>
      <div className="py-4">
        { problemStatement }
        <div className="w-24 p-4 text-4xl font-semibold text-slate-600">
          { parse(html) }
        </div>
      </div>
      <div className="grid gap-10 grid-cols-1 sm:grid-cols-2">
        <ModelEditor state={state} />
      </div>
    </>
  );
}
