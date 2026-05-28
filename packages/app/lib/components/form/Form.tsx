// SPDX-License-Identifier: MIT
import ReactMarkdown from "react-markdown";

import GridEditor from "./GridEditor.js";
import "./Form.css";

import katex from 'katex';
import 'katex/dist/katex.min.css';
import parse from 'html-react-parser';
import backgroundImage from '../../images/blue-texture.png';

const BG_SKY = "bg-[#B5DDFF]";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function renderErrors(errors: { message: string; from: number; to: number }[], theme: string | undefined) {
  return (
    <div className="flex flex-col gap-2">
      {errors.map((error, i) => (
        <div
          key={i}
          className={classNames(
            "rounded-md p-3 border text-sm",
            theme === "dark"
              ? "bg-red-900/50 border-red-700 text-red-200"
              : "bg-red-50 border-red-200 text-red-800"
          )}
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

  const theme = typeof state.data === "object" && state.data !== null ? state.data.theme : undefined;
  if (Array.isArray(state.errors) && state.errors.length > 0) {
    return renderErrors(state.errors, theme);
  }

  const { expression, problemStatement, useBgTexture } = state.data;
  const html = katex.renderToString(expression, {
    displayMode: true,
    output: "html",
    throwOnError: false
  });

  return (
    <div
      className={`p-10 min-h-screen w-full bg-repeat bg-auto bg-center ${BG_SKY}`}
      style={useBgTexture ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
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
