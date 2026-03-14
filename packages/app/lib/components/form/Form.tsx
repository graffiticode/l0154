// SPDX-License-Identifier: MIT
import ReactMarkdown from "react-markdown";

import GridEditor from "./GridEditor.js";
import "./Form.css";

import katex from 'katex';
import 'katex/dist/katex.min.css';
import parse from 'html-react-parser';

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

export function Form({ state }) {
  if (!state?.data) {
    return <div />;
  }

  if (Array.isArray(state.data.errors) && state.data.errors.length > 0) {
    return renderErrors(state.data.errors);
  }

  const { expression, problemStatement } = state.data;
  const html = katex.renderToString(expression, {
    displayMode: true,
    output: "html",
    throwOnError: false
  });

  return (
    <div className="min-h-full bg-transparent">
      <div className="py-4">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{problemStatement}</ReactMarkdown>
        </div>
      </div>
      <div className="inline-flex flex-col items-center pl-4">
        <div className="p-4 text-4xl font-semibold text-slate-600">
          { parse(html) }
        </div>
        <GridEditor state={state} doc={state.data.modelDoc} />
      </div>
    </div>
  );
}
