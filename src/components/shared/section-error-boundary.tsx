"use client";

import { Component, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Catches a render error in one page section, so it shows a small "Try again"
 * card instead of blanking the whole page.
 */
export class SectionErrorBoundary extends Component<
  { children: ReactNode; label?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {this.props.label ?? "This section"} couldn&apos;t load right now.
          </p>
          <Button variant="outline" onClick={() => this.setState({ failed: false })}>
            <RotateCcw data-icon="inline-start" /> Try again
          </Button>
        </div>
      </section>
    );
  }
}
