import { DESTINATIONS, LETTERS, type Dest } from "./data";
import { fold } from "./format";
import { SERVICES } from "./registry";

export function matchOrbit(query: string, unread: number): Dest[] {
  const q = fold(query.trim());
  if (!q) {
    const suggested = ["dowod", "pisma", "pojazd", "wsparcie", "bezp", "wyglad"];
    const base = suggested
      .map((id) => DESTINATIONS.find((d) => d.id === id))
      .filter((d): d is Dest => Boolean(d));
    if (unread > 0) {
      const inbox = DESTINATIONS.find((d) => d.id === "pisma");
      if (inbox) return [inbox, ...base.filter((d) => d.id !== "pisma")].slice(0, 6);
    }
    return base.slice(0, 6);
  }
  const scored = DESTINATIONS.map((dest) => {
    const blob = fold([dest.title, dest.meta, ...dest.keys].join(" "));
    let score = 0;
    if (blob.includes(q)) score += 5;
    for (const part of q.split(/\s+/)) {
      if (part && blob.includes(part)) score += 2;
    }
    return { dest, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const serviceHits: Dest[] = SERVICES.filter((service) => {
    const blob = fold(`${service.name} ${service.description} ${service.category}`);
    return q.split(/\s+/).every((part) => part && blob.includes(part)) || blob.includes(q);
  }).map((service) => ({
    id: `svc-${service.id}`,
    title: service.name,
    meta: service.description,
    glyph: service.glyph,
    view: service.view,
    selectedId: service.selectedId,
    keys: [],
  }));

  const letterHits: Dest[] = LETTERS.filter((letter) => {
    const blob = fold(`${letter.subject} ${letter.from} ${letter.body.join(" ")}`);
    return q.split(/\s+/).every((part) => part && blob.includes(part)) || blob.includes(q);
  }).map((letter) => ({
    id: `letter-${letter.id}`,
    title: letter.subject,
    meta: letter.from,
    glyph: "letter" as const,
    view: "pismo" as const,
    selectedId: letter.id,
    keys: [],
  }));

  const merged = [...letterHits, ...serviceHits, ...scored.map((row) => row.dest)];
  const seen = new Set<string>();
  return merged.filter((item) => {
    const key = `${item.view}:${item.selectedId ?? ""}:${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 7);
}
