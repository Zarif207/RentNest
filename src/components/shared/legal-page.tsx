/** Simple long-form layout for the privacy and terms pages. */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-medium tracking-[0.25em] text-bronze uppercase">Legal</p>
      <h1 className="mt-4 text-5xl leading-[1.02] font-medium tracking-tighter sm:text-6xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated {updated}</p>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-xl font-medium tracking-tight">{section.heading}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
