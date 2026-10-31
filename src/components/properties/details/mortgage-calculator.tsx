"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/format";

const TERMS = [15, 20, 30] as const;

/** Monthly principal and interest on a fixed-rate loan (no taxes or insurance). */
export function monthlyPayment(principal: number, annualRatePercent: number, years: number) {
  const months = years * 12;
  if (principal <= 0 || months <= 0) return 0;
  const rate = annualRatePercent / 100 / 12;
  if (rate <= 0) return principal / months;
  return (principal * rate) / (1 - (1 + rate) ** -months);
}

/**
 * Mortgage estimate for a home for sale: price, down payment (5–50 %), rate
 * and term → estimated monthly principal and interest.
 */
export function MortgageCalculator({ price: askingPrice }: { price: number }) {
  const id = useId();
  const [price, setPrice] = useState(String(Math.round(askingPrice)));
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState<(typeof TERMS)[number]>(30);

  const homePrice = Math.max(0, Number(price) || 0);
  const down = Math.round((homePrice * downPercent) / 100);
  const loan = homePrice - down;
  const monthly = monthlyPayment(loan, Math.max(0, Number(rate) || 0), term);

  return (
    <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`${id}-price`}>Home price</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              id={`${id}-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              className="pl-6"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Label id={`${id}-down-label`}>Down payment</Label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {downPercent}% · {formatCurrency(down)}
            </span>
          </div>
          <Slider
            min={5}
            max={50}
            step={1}
            value={[downPercent]}
            onValueChange={([value]) => setDownPercent(value)}
            aria-labelledby={`${id}-down-label`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${id}-rate`}>Interest rate (%)</Label>
            <Input
              id={`${id}-rate`}
              type="number"
              inputMode="decimal"
              min={0}
              max={20}
              step={0.05}
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-term`}>Loan term</Label>
            <Select value={String(term)} onValueChange={(value) => setTerm(Number(value) as (typeof TERMS)[number])}>
              <SelectTrigger id={`${id}-term`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((years) => (
                  <SelectItem key={years} value={String(years)}>
                    {years} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-2xl bg-surface p-6">
        <div aria-live="polite">
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Estimated monthly</p>
          <p className="mt-2 font-serif text-5xl leading-none lining-nums tabular-nums">
            {formatCurrency(Math.round(monthly))}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Principal and interest</p>
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Loan amount</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(loan)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Down payment</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(down)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          Estimate only. Not a loan offer. Taxes, insurance and fees aren&apos;t included.
        </p>
      </div>
    </div>
  );
}
