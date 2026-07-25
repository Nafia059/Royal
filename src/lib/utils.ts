import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1);
  return date.toLocaleString("en-US", { month: "long" });
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}
