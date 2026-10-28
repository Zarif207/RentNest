"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type DebouncedInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  /** The committed value (e.g. from the URL). */
  value: string;
  onCommit: (value: string) => void;
  delay?: number;
};

/**
 * Text input that commits after the user stops typing. It follows outside
 * changes to `value` (back button, "Clear all") without overwriting text the
 * user typed while their last commit was still loading.
 */
export function DebouncedInput({ value, onCommit, delay = 400, ...props }: DebouncedInputProps) {
  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const [seenValue, setSeenValue] = useState(value);

  // Adjust state during render when the outside value changes.
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== committed) {
      setCommitted(value);
      setText(value);
    }
  }

  useEffect(() => {
    const next = text.trim();
    if (next === committed) return;

    const timer = setTimeout(() => {
      setCommitted(next);
      onCommit(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, committed, delay, onCommit]);

  return <Input value={text} onChange={(event) => setText(event.target.value)} {...props} />;
}
