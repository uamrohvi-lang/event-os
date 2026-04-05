import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Workload signal based on active thread count and blocked count */
export function workloadSignal(
  activeThreads: number,
  blockedThreads: number
): "green" | "amber" | "red" {
  if (activeThreads >= 8 || blockedThreads >= 2) return "red";
  if (activeThreads >= 4 || blockedThreads >= 1) return "amber";
  return "green";
}

/** Format a date string as DD MMM YYYY */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Format a time string (HH:MM:SS) as HH:MM */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5);
}

/** Returns initials from a full name (max 2 chars) */
export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/** Department colour map */
export const DEPT_COLOURS: Record<string, string> = {
  stage:       "#0F6E56",
  av:          "#534AB7",
  hospitality: "#854F0B",
  security:    "#185FA5",
  media:       "#993C1D",
  ops:         "#3B6D11",
  production:  "#0F6E56",
  other:       "#6B7280",
};
