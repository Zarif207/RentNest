"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CircleCheck, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_SUBJECTS, contactSchema, type ContactValues } from "@/schemas/contact";

// UI ONLY: the backend has no contact endpoint, so nothing is sent or
// emailed. Submitting validates, waits briefly to show the loading state,
// then shows the thank-you panel. Wire a real endpoint into `onSubmit`.
const SIMULATED_DELAY_MS = 900;

/** Glass contact form card: validated fields, loading state, then a thank-you panel. */
export function ContactForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = async (values: ContactValues) => {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    setSentTo(values.name.split(" ")[0]);
    toast.success("Thanks for your message", { description: "This demo doesn't send messages yet." });
    form.reset();
  };

  const fade = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 } };

  return (
    <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl sm:p-8 dark:shadow-black/30">
      <AnimatePresence mode="wait" initial={false}>
        {sentTo ? (
          <motion.div key="thanks" {...fade} className="flex min-h-120 flex-col items-center justify-center text-center" role="status">
            <span className="grid size-16 place-items-center rounded-full bg-gold/15 text-bronze">
              <CircleCheck className="size-7" aria-hidden />
            </span>
            <h2 className="mt-6 text-3xl font-medium tracking-tighter">Thank you, {sentTo}.</h2>
            <p className="mt-3 max-w-sm text-muted-foreground">
              Your message passed every check. This demo has no messaging service yet, so it wasn&apos;t sent
              anywhere. For anything urgent, email or call us directly.
            </p>
            <Button variant="outline" className="mt-8" onClick={() => setSentTo(null)}>
              Write another message
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" {...fade} onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Send a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">All fields are required.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Name" htmlFor="contact-name" error={errors.name}>
                <Input id="contact-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...form.register("name")} />
              </FormField>
              <FormField label="Email" htmlFor="contact-email" error={errors.email}>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...form.register("email")}
                />
              </FormField>
            </div>
            <FormField label="Subject" htmlFor="contact-subject" error={errors.subject}>
              <Controller
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contact-subject"
                      className="w-full"
                      aria-invalid={Boolean(errors.subject)}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="What's it about?" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Message" htmlFor="contact-message" error={errors.message}>
              <Textarea
                id="contact-message"
                rows={6}
                placeholder="How can we help?"
                aria-invalid={Boolean(errors.message)}
                {...form.register("message")}
              />
            </FormField>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Submitting…
                </>
              ) : (
                <>
                  Send message <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
