"use client";

import { RotateCcw } from "lucide-react";
import { INTRO_SEEN_KEY } from "@/components/motion/intro-gate";
import { Button } from "@/components/ui/button";

/** Style-guide helper: forget that the intro played, then reload to see it again. */
export function ReplayIntroButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        try {
          sessionStorage.removeItem(INTRO_SEEN_KEY);
        } catch {
          // Storage blocked: the reload will simply skip the intro.
        }
        window.location.reload();
      }}
    >
      <RotateCcw data-icon="inline-start" /> Replay intro
    </Button>
  );
}
