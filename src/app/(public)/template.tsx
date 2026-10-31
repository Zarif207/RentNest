import { PageFade } from "@/components/motion/page-fade";

// Re-mounts on every public route change: a soft CSS fade-in for the new page,
// skipped on the first load so it never delays the first paint (the global
// reduced-motion rule stops it too).
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
