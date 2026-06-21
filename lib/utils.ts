import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Baseline calculation utility extracted for testing purposes
export function calculateCarbonEmissions(category: string, value: number): number {
  if (value <= 0) return 0;

  const multipliers: Record<string, number> = {
    transportation: 0.2,
    transport: 0.2,
    food: 3.5,
    energy: 0.6,
  };

  const multiplier = multipliers[category.toLowerCase()] || 0;
  return +(value * multiplier).toFixed(1);
}
