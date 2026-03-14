// SPDX-License-Identifier: MIT
import { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import "./Form.css";

const debouncedApply = debounce(({ state, type, args }) => {
  state.apply && state.apply({ type, args });
}, 1000, { leading: true, trailing: true });

function rotateGrid({ grid, turns }) {
  turns = turns % 4;
  while (turns > 0) {
    grid = grid[0].map((_, colIndex) => grid.map(row => row[colIndex]).reverse());
    turns--;
  }
  return grid;
}

function reflectGrid({ grid, turns }) {
  return turns % 2 === 0 ? grid : grid.map(row => [...row].reverse());
}

const matchTerms = ({ cells, terms }) => {
  const flatCells = cells.flat();
  const flatTerms = terms.flat();
  return flatTerms.filter((val, index) => val === flatCells[index]);
};

const matchTermsToCells = ({ cells, terms }) => {
  const termsMatches = [];
  const reflectedRotatedTermsList = [];
  [0, 1].forEach((_, reflectTurns) => {
    const reflectedGrid = reflectGrid({ grid: terms, turns: reflectTurns });
    [0, 1, 2, 3].forEach((_, rotateTurns) => {
      const rrt = rotateGrid({ grid: reflectedGrid, turns: rotateTurns });
      reflectedRotatedTermsList.push(rrt);
      termsMatches.push(matchTerms({ cells, terms: rrt }));
    });
  });
  const bestIndex = termsMatches.reduce(
    (best, m, i) => m.length > termsMatches[best].length ? i : best,
    0
  );
  return reflectedRotatedTermsList[bestIndex];
};

const getCellColor = ({ val, term, showFeedback }) => {
  if (!showFeedback || isNaN(val)) return "#fff";
  return val === term ? "#efe" : "#fee";
};

function CellInput({ value, options, onChange, onKeyDown, row, col }: {
  value: string;
  options: number[];
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  row: number;
  col: number;
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const cellRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightIndex >= 0 && dropdownRef.current) {
      const el = dropdownRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleSelect = (opt: number) => {
    onChange(String(opt));
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlightIndex >= 0 && highlightIndex < options.length) {
        handleSelect(options[highlightIndex]);
      } else if (!open) {
        setOpen(true);
        setHighlightIndex(0);
      }
    } else if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex(prev => Math.min(prev + 1, options.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex(prev => Math.max(prev - 1, 0));
      } else {
        onKeyDown(e);
      }
    } else {
      onKeyDown(e);
    }
  };

  return (
    <div ref={cellRef} className="magic-grid-cell">
      <input
        type="text"
        inputMode="numeric"
        data-row={row}
        data-col={col}
        value={value}
        onChange={e => {
          const filtered = e.target.value.replace(/[^0-9]/g, "");
          onChange(filtered);
        }}
        onFocus={() => { setHighlightIndex(-1); }}
        onBlur={() => { setOpen(false); setHighlightIndex(-1); }}
        onKeyDown={handleKeyDown}
        className="magic-grid-input"
      />
      {open && (
        <div ref={dropdownRef} className="magic-grid-dropdown">
          {options.map((opt: number, i: number) => (
            <button
              key={opt}
              type="button"
              className={`magic-grid-option${i === highlightIndex ? " magic-grid-option-highlight" : ""}`}
              onMouseDown={e => {
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GridEditor({ state, doc }) {
  const { terms, showFeedback, expression } = state.data;
  const order = terms.length;
  const magicNumber = parseInt(expression);

  const getInitialValues = () => {
    const values: string[][] = Array.from({ length: order }, () =>
      Array.from({ length: order }, () => "")
    );
    if (doc?.content?.[0]?.content) {
      doc.content[0].content.forEach((row, r) => {
        row.content?.forEach((cell, c) => {
          const text = cell.content?.[0]?.content?.[0]?.text || "";
          values[r][c] = text.trim();
        });
      });
    }
    return values;
  };

  const [values, setValues] = useState<string[][]>(getInitialValues);
  const gridRef = useRef<HTMLTableElement>(null);

  // All integers from 1 to magicNumber - 1
  const allOptions = Array.from({ length: magicNumber - 1 }, (_, i) => i + 1);

  const numericValues = values.map(row => row.map(v => parseInt(v)));
  const matchedTerms = matchTermsToCells({ cells: numericValues, terms });
  const cellColors = values.map((row, r) =>
    row.map((_, c) => getCellColor({
      val: numericValues[r][c],
      term: matchedTerms[r][c],
      showFeedback,
    }))
  );

  const buildModelDoc = (vals: string[][]) => ({
    type: "doc",
    content: [{
      type: "table",
      content: vals.map(row => ({
        type: "table_row",
        content: row.map(cell => ({
          type: "table_cell",
          attrs: { colspan: 1, rowspan: 1, colwidth: null, width: "80px", height: "80px", background: "#fff" },
          content: [{
            type: "paragraph",
            content: cell ? [{ type: "text", text: cell }] : undefined,
          }],
        })),
      })),
    }],
  });

  useEffect(() => {
    debouncedApply({
      state,
      type: "change",
      args: { modelDoc: buildModelDoc(values) },
    });
  }, [JSON.stringify(values)]);

  const handleChange = (r: number, c: number, val: string) => {
    setValues(prev => {
      const next = prev.map(row => [...row]);
      // Clear the same number from any other cell
      if (val !== "") {
        for (let ri = 0; ri < order; ri++) {
          for (let ci = 0; ci < order; ci++) {
            if ((ri !== r || ci !== c) && next[ri][ci] === val) {
              next[ri][ci] = "";
            }
          }
        }
      }
      next[r][c] = val;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const next = e.shiftKey ? getPrevCell(r, c) : getNextCell(r, c);
      focusCell(next.r, next.c);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(r, (c + 1) % order);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(r, (c - 1 + order) % order);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusCell((r + 1) % order, c);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell((r - 1 + order) % order, c);
    }
  };

  const getNextCell = (r: number, c: number) => {
    c++;
    if (c >= order) { c = 0; r++; }
    if (r >= order) { r = 0; }
    return { r, c };
  };

  const getPrevCell = (r: number, c: number) => {
    c--;
    if (c < 0) { c = order - 1; r--; }
    if (r < 0) { r = order - 1; }
    return { r, c };
  };

  const focusCell = (r: number, c: number) => {
    const input = gridRef.current?.querySelector(
      `input[data-row="${r}"][data-col="${c}"]`
    ) as HTMLInputElement | null;
    input?.focus();
    input?.select();
  };

  return (
    <table ref={gridRef} className="magic-grid">
      <tbody>
        {values.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td
                key={c}
                style={{ backgroundColor: cellColors[r][c] }}
              >
                <CellInput
                  value={cell}
                  options={allOptions}
                  onChange={val => handleChange(r, c, val)}
                  onKeyDown={e => handleKeyDown(e, r, c)}
                  row={r}
                  col={c}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
