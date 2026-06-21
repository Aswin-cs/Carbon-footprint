import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Baseline calculation utility extracted for testing purposes
export function calculateCarbonEmissions(category: string, value: number): number {
  if (value <= 0) return 0;
  
  if (category === 'transportation' || category === 'Transport') {
    return +(value * 0.2).toFixed(1); // Baseline car emission
  } else if (category === 'food' || category === 'Food') {
    return +(value * 3.5).toFixed(1); // Baseline beef emission
  } else if (category === 'energy' || category === 'Energy') {
    return +(value * 0.6).toFixed(1); // Baseline grid emission
  }
  return 0;
}
