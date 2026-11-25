export type Commemoration = "nov11" | "may3" | "aug15";
export type DayMode = "auto" | "off" | Commemoration;

const MONTHS = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];

const WEEKDAYS = [
  "niedziela",
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
];

export function civicDay(date: Date, mode: DayMode): Commemoration | null {
  if (mode === "off") return null;
  if (mode !== "auto") return mode;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if (m === 11 && d === 11) return "nov11";
  if (m === 5 && d === 3) return "may3";
  if (m === 8 && d === 15) return "aug15";
  return null;
}

export function dayNote(day: Commemoration | null): string | null {
  if (day === "nov11") return "11 listopada. Cienka linia pod nagłówkiem — i nic więcej.";
  if (day === "aug15") return "15 sierpnia. Święto jest zaznaczone tylko linią, bez ozdobników.";
  if (day === "may3") return "3 maja. W tle trochę mocniejszy ślad rękopisu.";
  return null;
}

export function longDate(date = new Date()): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5 || h >= 18) return "Dobry wieczór";
  if (h < 12) return "Dzień dobry";
  return "Dzień dobry";
}

export function plDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function daysUntil(iso: string, now = new Date()): number {
  const target = new Date(`${iso}T12:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function untilLabel(iso: string, now = new Date()): string {
  const days = daysUntil(iso, now);
  if (days === 0) return "dziś";
  if (days === 1) return "jutro";
  if (days > 1) return `za ${days} dni`;
  if (days === -1) return "wczoraj";
  return `${Math.abs(days)} dni temu`;
}

export function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function minutesLeft(until: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((until - now) / 60_000));
}
