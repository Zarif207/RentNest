// Re-mounts when switching between log in and register: the form panel
// fades and rises in (CSS only; the global reduced-motion rule stops it).
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in duration-500 ease-out fade-in slide-in-from-bottom-3">{children}</div>;
}
