import { IntroGate } from "@/components/motion/intro-gate";
import { IntroPreloader } from "@/components/motion/intro-preloader";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

// Same motion setup as the public site, so the demos behave like the real pages.
export default function StyleGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <IntroGate />
      <IntroPreloader />
      {children}
    </SmoothScrollProvider>
  );
}
