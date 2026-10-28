"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// UI only: there is no newsletter endpoint, so this just confirms locally.
export function NewsletterForm() {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("You're on the list", {
      description: "We'll send new listings and rental tips to your inbox.",
    });
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        placeholder="Your email"
        className="rounded-full bg-background"
      />
      <Button type="submit" size="icon" aria-label="Subscribe" className="shrink-0">
        <ArrowRight />
      </Button>
    </form>
  );
}
