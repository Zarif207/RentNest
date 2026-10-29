// Re-mounts on every public route change: a soft CSS fade-in for the new page
// (no JS, so it never delays content; the global reduced-motion rule stops it).
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in duration-500 ease-out fade-in">{children}</div>;
}
