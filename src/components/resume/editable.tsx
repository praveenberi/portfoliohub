"use client";

import React, { useRef } from "react";

/**
 * Inline contentEditable wrapper used by resume templates.
 *
 * - When `editable` is false, renders the value as a plain span/div.
 * - When `editable` is true, the element becomes contentEditable, gets a
 *   subtle hover/focus ring so the user can see what's editable, and commits
 *   the new value (innerText) on blur via `onChange`.
 *
 * The element is uncontrolled while focused: React renders `value` as the
 * initial children once and the browser owns the text until blur. A stable
 * `editKey` is used so toggling edit mode or switching entries forces a
 * remount (and picks up a fresh initial value).
 */
export function Editable({
  value,
  editable,
  onChange,
  multiline,
  as,
  className,
  style,
  placeholder,
  editKey,
}: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4";
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  /** Stable key for remounting when toggling edit mode or switching entries. */
  editKey?: string;
}) {
  const Tag = (as ?? (multiline ? "div" : "span")) as keyof JSX.IntrinsicElements;
  const ref = useRef<HTMLElement | null>(null);

  if (!editable) {
    return React.createElement(Tag, { className, style }, value || placeholder || "");
  }

  const editableClass =
    "outline-none rounded px-1 -mx-1 ring-1 ring-transparent hover:bg-blue-50/40 hover:ring-blue-200 focus:bg-blue-50 focus:ring-blue-400 transition-colors print:bg-transparent print:ring-0 print:hover:bg-transparent";

  return React.createElement(Tag, {
    ref: (el: HTMLElement | null) => { ref.current = el; },
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: true,
    "data-placeholder": placeholder,
    className: `${className ?? ""} ${editableClass}`.trim(),
    style,
    key: editKey,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const next = (e.currentTarget.innerText ?? "").replace(/ /g, " ").trimEnd();
      if (next !== value) onChange(next);
    },
    // Block <Enter> in single-line fields so users don't accidentally insert <br>s.
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
    },
  }, value);
}
