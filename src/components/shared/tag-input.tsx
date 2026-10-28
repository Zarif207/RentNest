"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  /** Turns a typed tag into its stored form (e.g. "Air Conditioning" → "air-conditioning"). */
  normalize?: (tag: string) => string;
  /** How a stored tag is shown. */
  format?: (tag: string) => string;
  placeholder?: string;
  invalid?: boolean;
};

/** Chips + input: Enter or comma adds, Backspace on empty removes the last one. */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  normalize = (tag) => tag.trim(),
  format = (tag) => tag,
  placeholder,
  invalid,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  // Adds several at once so a pasted "wifi, pool, gym" keeps every tag.
  const add = (...raws: string[]) => {
    const next = [...value];
    for (const tag of raws.map(normalize)) {
      if (tag && !next.includes(tag)) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));
  const unused = suggestions.filter((tag) => !value.includes(tag));

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-input px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          invalid && "border-destructive ring-3 ring-destructive/20",
        )}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm">
            {format(tag)}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove ${format(tag)}`}
              className="grid size-5 place-items-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => {
            const next = event.target.value;
            // Typing or pasting a comma commits what came before it.
            if (next.includes(",")) {
              const parts = next.split(",");
              add(...parts.slice(0, -1));
              setDraft(parts.at(-1) ?? "");
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            } else if (event.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "" : placeholder}
          aria-invalid={invalid || undefined}
          className="h-7 min-w-32 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Suggestions">
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors outline-none hover:border-solid hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus className="size-3" aria-hidden /> {format(tag)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
