import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function PaymentLayout({ children }: LayoutProps<"/payment">) {
  return (
    <div className="flex min-h-svh flex-col bg-surface">
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <BrandLogo />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
