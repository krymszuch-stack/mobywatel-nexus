import type { GlyphName } from "@/components/nexus/glyph-paths";
import type { ViewId } from "./types";

export type Availability = "native" | "external" | "simulated" | "concept";

export type ServiceDef = {
  id: string;
  name: string;
  description: string;
  category: string;
  glyph: GlyphName;
  institution: string;
  availability: Availability;
  view: ViewId;
  selectedId?: string;
  source?: string;
  home?: boolean;
  simple?: boolean;
};

/** Familiar Polish service names. None of these calls a real government system. */
export const SERVICES: ServiceDef[] = [
  {
    id: "mdowod",
    name: "mDowód",
    description: "Pokaż dokument tożsamości",
    category: "Tożsamość",
    glyph: "identity",
    institution: "Prototyp NEXUS",
    availability: "native",
    view: "dokument",
    selectedId: "dowod",
    simple: true,
  },
  {
    id: "ikp",
    name: "mojeIKP",
    description: "Recepty, skierowania, wizyty",
    category: "Zdrowie",
    glyph: "health",
    institution: "mojeIKP / pacjent.gov.pl",
    availability: "simulated",
    view: "zdrowie",
    source: "https://pacjent.gov.pl/",
    home: true,
    simple: true,
  },
  {
    id: "prawo",
    name: "mPrawo jazdy",
    description: "Twoje uprawnienia",
    category: "Pojazdy",
    glyph: "vehicle",
    institution: "Prototyp NEXUS",
    availability: "native",
    view: "dokument",
    selectedId: "prawojazdy",
    home: true,
  },
  {
    id: "doreczenia",
    name: "e-Doręczenia",
    description: "Pisma z urzędów",
    category: "Pisma",
    glyph: "letter",
    institution: "e-Doręczenia — podgląd",
    availability: "simulated",
    view: "pisma",
    source: "https://www.gov.pl/web/e-doreczenia",
    home: true,
    simple: true,
  },
  {
    id: "pesel",
    name: "Zastrzeż PESEL",
    description: "Twoje bezpieczeństwo",
    category: "Bezpieczeństwo",
    glyph: "key",
    institution: "Prototyp NEXUS",
    availability: "simulated",
    view: "bezpieczenstwo",
    home: true,
  },
  {
    id: "pojazdy",
    name: "Moje pojazdy",
    description: "Pojazdy i polisy",
    category: "Pojazdy",
    glyph: "vehicle",
    institution: "Prototyp NEXUS",
    availability: "simulated",
    view: "kierowca",
    home: true,
  },
  {
    id: "punkty",
    name: "Punkty karne",
    description: "Aktualna liczba: 0",
    category: "Pojazdy",
    glyph: "alert",
    institution: "Prototyp NEXUS",
    availability: "simulated",
    view: "kierowca",
    home: true,
  },
  {
    id: "stluczka",
    name: "mStłuczka",
    description: "Zgłoszenie zdarzenia",
    category: "Pojazdy",
    glyph: "emergency",
    institution: "Prototyp NEXUS",
    availability: "concept",
    view: "kierowca",
  },
  {
    id: "wsparcie",
    name: "Emerytura i świadczenia",
    description: "Informacje i wnioski",
    category: "Rodzina",
    glyph: "support",
    institution: "ZUS — podgląd",
    availability: "simulated",
    view: "wsparcie",
    source: "https://www.zus.pl/",
    simple: true,
  },
  {
    id: "sprawy",
    name: "Moje sprawy",
    description: "To, co jest w toku",
    category: "Pisma",
    glyph: "case",
    institution: "Prototyp NEXUS",
    availability: "native",
    view: "sprawy",
  },
  {
    id: "zalatw",
    name: "Załatw sprawę",
    description: "Plany na ważne momenty",
    category: "Życie",
    glyph: "institution",
    institution: "Prototyp NEXUS",
    availability: "native",
    view: "zalatw",
  },
  {
    id: "os",
    name: "Oś czasu",
    description: "Porządek zdarzeń",
    category: "Życie",
    glyph: "timeline",
    institution: "Prototyp NEXUS",
    availability: "native",
    view: "os",
  },
];

export function servicesByCategory() {
  const groups: { category: string; items: ServiceDef[] }[] = [];
  for (const item of SERVICES) {
    const found = groups.find((group) => group.category === item.category);
    if (found) found.items.push(item);
    else groups.push({ category: item.category, items: [item] });
  }
  return groups;
}
