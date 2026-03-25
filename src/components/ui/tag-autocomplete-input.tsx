"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TagAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  suggestions: string[];
  existingTags?: string[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
}

export function TagAutocompleteInput({
  value,
  onChange,
  onAdd,
  suggestions,
  existingTags = [],
  placeholder,
  className,
  maxSuggestions = 8,
}: TagAutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions
    .filter((s) => {
      if (existingTags.map((t) => t.toLowerCase()).includes(s.toLowerCase())) return false;
      if (!value.trim()) return true;
      return s.toLowerCase().includes(value.toLowerCase());
    })
    .slice(0, maxSuggestions);

  const handleSelect = useCallback((suggestion: string) => {
    onChange(suggestion);
    // Trigger add via a micro-task so state settles
    setTimeout(() => {
      onAdd();
    }, 0);
    setOpen(false);
    setActiveIndex(-1);
  }, [onChange, onAdd]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && filtered.length > 0) {
        handleSelect(filtered[activeIndex]);
      } else {
        onAdd();
        setOpen(false);
      }
      return;
    }
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIndex(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-green-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {highlightMatch(s, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold text-green-400">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}
