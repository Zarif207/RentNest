import { cn } from "@/lib/utils";

const LEVELS = [
  { label: "Too short", tone: "bg-destructive" },
  { label: "Weak", tone: "bg-destructive" },
  { label: "Fair", tone: "bg-[#c2953c]" },
  { label: "Good", tone: "bg-gold" },
  { label: "Strong", tone: "bg-[#5d7a4a]" },
];

/** 0–4: length 6+ is required by the backend; the rest are suggestions. */
function score(password: string) {
  if (password.length < 6) return 0;
  let points = 1;
  if (password.length >= 10) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) points += 1;
  return points;
}

/** Four-bar strength hint under the password field (a hint, not a rule). */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const level = score(password);
  const { label, tone } = LEVELS[level];

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn("h-1 rounded-full transition-colors duration-300", index < Math.max(level, 1) ? tone : "bg-border")}
          />
        ))}
      </div>
      <p className="w-28 text-right text-xs text-muted-foreground">
        <span className="sr-only">Password strength: </span>
        {label}
      </p>
    </div>
  );
}
