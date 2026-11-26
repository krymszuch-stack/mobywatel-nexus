import type { GlyphName } from "@/components/nexus/glyph-paths";
import type { HubId, ViewId } from "./types";

export type Availability = "native" | "external" | "simulated" | "concept";

export type ServiceDef = {
  id: string;
  name: string;
  description: string;
  category: string;
  hub: HubId;
  glyph: GlyphName;
  institution: string;
  availability: Availability;
  scopeNote: string;
  view: ViewId;
  selectedId?: string;
  source?: string;
  sourceLabel?: string;
  relatedCaseIds?: string[];
  relatedLetterIds?: string[];
  relatedDocIds?: string[];
  home?: boolean;
  simple?: boolean;
};

export type HubMeta = {
  id: HubId;
  name: string;
  summary: string;
  glyph: GlyphName;
  view: ViewId;
  patternNote: string;
};

export const HUBS: HubMeta[] = [
  {
    id: "zdrowie",
    name: "Zdrowie",
    summary: "mojeIKP, recepty, skierowania, przypomnienia i przejście do pacjent.gov.pl",
    glyph: "health",
    view: "zdrowie",
    patternNote: "Spójny widok zdrowia z jasnym rozdziałem symulacji i oficjalnego mojeIKP",
  },
  {
    id: "kierowca",
    name: "Kierowca",
    summary: "mPrawo jazdy, Moje pojazdy, Punkty karne i koncepcja mStłuczka",
    glyph: "vehicle",
    view: "kierowca",
    patternNote: "Osobne podglądy dla uprawnień, pojazdu, punktów karnych i zdarzeń drogowych",
  },
  {
    id: "dokumenty",
    name: "Dokumenty i tożsamość",
    summary: "mDowód, portfel wzorów, czasowy podgląd, utrata dokumentu i Zastrzeż PESEL",
    glyph: "identity",
    view: "dokumenty",
    patternNote: "Szybki dostęp do dokumentów i ochrony tożsamości z pełną przejrzystością",
  },
  {
    id: "sprawy",
    name: "Moje sprawy",
    summary: "e-Doręczenia, szkice, wyjaśnienia po ludzku, potwierdzenia i oś czasu",
    glyph: "case",
    view: "sprawy",
    patternNote: "Jedno źródło stanu spraw, pism, potwierdzeń i terminów",
  },
  {
    id: "wsparcie",
    name: "Wsparcie i sytuacje życiowe",
    summary: "Możliwe świadczenia, plany życiowe i uporządkowane ścieżki krok po kroku",
    glyph: "support",
    view: "wsparcie",
    patternNote: "Odkrywanie potencjalnego wsparcia bez fałszywych decyzji urzędowych",
  },
];

/**
 * Central NEXUS service registry.
 * Preserves recognizable Polish mObywatel service names and separates real
 * official scope from local prototype simulations and conceptual modules.
 */
export const SERVICES: ServiceDef[] = [
  {
    id: "sady", name: "Sprawy sądowe", description: "Udostępnione sprawy, dokumenty i posiedzenia",
    category: "Moje sprawy", hub: "sprawy", glyph: "court", institution: "Sądy",
    availability: "simulated", scopeNote: "Dane fikcyjne. Doręczenia urzędowe obsługuje Portal Informacyjny.",
    view: "urzad", selectedId: "sady/home", source: "https://portal.wroclaw.sa.gov.pl/",
  },
  {
    id: "praca", name: "Praca i urząd pracy", description: "Sprawy, dokumenty, wizyty i oferty",
    category: "Życie i praca", hub: "sprawy", glyph: "work", institution: "praca.gov.pl",
    availability: "simulated", scopeNote: "Lokalne scenariusze e-Urzędu i osobne oferty demo ePraca.",
    view: "urzad", selectedId: "praca/home", source: "https://www.praca.gov.pl/eurzad/strona-glowna",
  },
  {
    id: "zus", name: "ZUS — ubezpieczenia i świadczenia", description: "Składki, świadczenia, pisma i wizyty",
    category: "Emerytura i wsparcie", hub: "wsparcie", glyph: "institution", institution: "ZUS",
    availability: "simulated", scopeNote: "Dane demonstracyjne. Odbiór urzędowy odbywa się w eZUS.",
    view: "urzad", selectedId: "zus/home", source: "https://www.zus.pl/ezus/logowanie",
  },
  {
    id: "pfron", name: "Wsparcie PFRON", description: "Wnioski, dokumenty i informacje o wsparciu",
    category: "Emerytura i wsparcie", hub: "wsparcie", glyph: "support", institution: "SOW PFRON",
    availability: "simulated", scopeNote: "Dane fikcyjne. Poprawki, wiadomości i podpisy są symulowane.",
    view: "urzad", selectedId: "pfron/home", source: "https://www.pfron.org.pl/",
  },
  {
    id: "mdowod",
    name: "mDowód",
    description: "Pokaż dokument tożsamości",
    category: "Dokumenty i tożsamość",
    hub: "dokumenty",
    glyph: "identity",
    institution: "mObywatel — wzór w prototypie",
    availability: "native",
    scopeNote: "Lokalny wzór dokumentu z oznaczeniem WZÓR i czasowym podglądem na tym urządzeniu.",
    view: "dokument",
    selectedId: "dowod",
    source: "https://info.mobywatel.gov.pl/dokumenty/mdowod",
    sourceLabel: "info.mobywatel.gov.pl — mDowód",
    relatedDocIds: ["dowod"],
    simple: true,
  },
  {
    id: "ikp",
    name: "mojeIKP",
    description: "Zdrowie, recepty, skierowania",
    category: "Zdrowie",
    hub: "zdrowie",
    glyph: "health",
    institution: "mojeIKP / pacjent.gov.pl",
    availability: "simulated",
    scopeNote: "Podgląd przykładowego skierowania i lokalne przypomnienia. Wizyty i recepty realizujesz w mojeIKP / pacjent.gov.pl.",
    view: "zdrowie",
    source: "https://pacjent.gov.pl/",
    sourceLabel: "pacjent.gov.pl — Internetowe Konto Pacjenta",
    relatedDocIds: ["ekuz"],
    home: true,
    simple: true,
  },
  {
    id: "prawo",
    name: "mPrawo jazdy",
    description: "Twoje uprawnienia kierowcy",
    category: "Kierowca",
    hub: "kierowca",
    glyph: "wheel",
    institution: "mObywatel — wzór w prototypie",
    availability: "native",
    scopeNote: "Lokalny wzór dokumentu kategorii B bez połączenia z centralnym rejestrem kierowców.",
    view: "dokument",
    selectedId: "prawojazdy",
    source: "https://info.mobywatel.gov.pl/dokumenty/mprawo-jazdy",
    sourceLabel: "info.mobywatel.gov.pl — mPrawo jazdy",
    relatedDocIds: ["prawojazdy"],
    home: true,
  },
  {
    id: "doreczenia",
    name: "e-Doręczenia",
    description: "Pisma z urzędów",
    category: "Moje sprawy",
    hub: "sprawy",
    glyph: "letter",
    institution: "e-Doręczenia — symulacja skrzynki",
    availability: "simulated",
    scopeNote: "Fikcyjne pisma urzędowe z wyjaśnieniem po ludzku, szkicami i lokalnym potwierdzeniem zapisu.",
    view: "pisma",
    source: "https://www.gov.pl/web/e-doreczenia",
    sourceLabel: "gov.pl — e-Doręczenia",
    relatedLetterIds: ["komunikacja", "zus800", "pit", "szkola"],
    relatedCaseIds: ["rejestracja", "osiemset"],
    home: true,
    simple: true,
  },
  {
    id: "pesel",
    name: "Zastrzeż PESEL",
    description: "Chroń swój numer PESEL",
    category: "Dokumenty i tożsamość",
    hub: "dokumenty",
    glyph: "lock",
    institution: "Rejestr zastrzeżeń PESEL — symulacja",
    availability: "simulated",
    scopeNote: "Symulowana zmiana statusu po wyraźnym potwierdzeniu. Prawdziwe zastrzeżenie wykonasz na gov.pl lub w mObywatelu.",
    view: "bezpieczenstwo",
    source: "https://www.gov.pl/web/gov/zastrzez-numer-pesel",
    sourceLabel: "gov.pl — Zastrzeż numer PESEL",
    relatedDocIds: ["dowod"],
    home: true,
  },
  {
    id: "pojazdy",
    name: "Moje pojazdy",
    description: "Pojazdy, badania i OC",
    category: "Kierowca",
    hub: "kierowca",
    glyph: "vehicle",
    institution: "CEPiK — podgląd wzoru",
    availability: "simulated",
    scopeNote: "Przykładowe dane pojazdu KR NX851 powiązane ze sprawą dowodu rejestracyjnego. Nie pobiera danych z CEPiK.",
    view: "kierowca",
    selectedId: "pojazdy",
    source: "https://info.mobywatel.gov.pl/uslugi/moje-pojazdy",
    sourceLabel: "info.mobywatel.gov.pl — Moje pojazdy",
    relatedCaseIds: ["rejestracja"],
    relatedLetterIds: ["komunikacja"],
    home: true,
  },
  {
    id: "punkty",
    name: "Punkty karne",
    description: "Aktualna liczba: 0",
    category: "Kierowca",
    hub: "kierowca",
    glyph: "points",
    institution: "CEPiK / Policja — podgląd wzoru",
    availability: "simulated",
    scopeNote: "Osobny podgląd przykładowego stanu 0 punktów karnych. Oficjalny stan sprawdzisz w aplikacji mObywatel lub na gov.pl.",
    view: "kierowca",
    selectedId: "punkty",
    source: "https://info.mobywatel.gov.pl/uslugi/punkty-karne",
    sourceLabel: "info.mobywatel.gov.pl — Punkty karne",
    home: true,
  },
  {
    id: "stluczka",
    name: "mStłuczka",
    description: "Koncepcja zgłoszenia zdarzenia",
    category: "Kierowca",
    hub: "kierowca",
    glyph: "emergency",
    institution: "Prototyp mObywatel NEXUS — koncepcja",
    availability: "concept",
    scopeNote: "Nazwa realnej usługi mObywatela, lecz w tym prototypie wyłącznie opis zakresu — bez zgłaszania kolizji do ubezpieczyciela ani służb.",
    view: "kierowca",
    selectedId: "stluczka",
    source: "https://www.gov.pl/web/mobywatel",
    sourceLabel: "gov.pl — mObywatel",
  },
  {
    id: "wsparcie",
    name: "Emerytura i świadczenia",
    description: "Informacje i możliwe wsparcie",
    category: "Wsparcie i sytuacje życiowe",
    hub: "wsparcie",
    glyph: "support",
    institution: "ZUS — podgląd wzoru",
    availability: "simulated",
    scopeNote: "Oddziela już przyznane świadczenia ze wzoru od podpowiedzi do samodzielnego sprawdzenia. Nie wydaje decyzji.",
    view: "wsparcie",
    source: "https://www.zus.pl/",
    sourceLabel: "zus.pl — Zakład Ubezpieczeń Społecznych",
    relatedCaseIds: ["osiemset"],
    relatedLetterIds: ["zus800"],
    simple: true,
  },
  {
    id: "sprawy",
    name: "Moje sprawy",
    description: "Sprawy w toku, szkice i potwierdzenia",
    category: "Moje sprawy",
    hub: "sprawy",
    glyph: "case",
    institution: "OneFlow",
    availability: "native",
    scopeNote: "Jedno źródło stanu spraw aktualizowane na bieżąco po odpowiedziach, krokach i zapisanych planach.",
    view: "sprawy",
    relatedCaseIds: ["rejestracja", "osiemset", "meldunek"],
  },
  {
    id: "zalatw",
    name: "Ważne zmiany w życiu",
    description: "Plany na ważne sytuacje życiowe",
    category: "Wsparcie i sytuacje życiowe",
    hub: "wsparcie",
    glyph: "signpost",
    institution: "OneFlow",
    availability: "native",
    scopeNote: "Ścieżki życiowe krok po kroku ze wspólnym planem, zależnościami i zapisem sprawy na urządzeniu.",
    view: "zalatw",
  },
  {
    id: "os",
    name: "Moja oś czasu",
    description: "Zdarzenia, terminy i przypomnienia",
    category: "Moje sprawy",
    hub: "sprawy",
    glyph: "timeline",
    institution: "OneFlow",
    availability: "native",
    scopeNote: "Wspólna oś historii spraw, odpowiedzi, przypomnień i lokalnych operacji z bezpośrednimi skrótami.",
    view: "os",
  },
  {
    id: "podatki",
    name: "e-Urząd Skarbowy",
    description: "PIT, rozliczenia i aktualizacja adresu (ZAP-3)",
    category: "Moje sprawy",
    hub: "sprawy",
    glyph: "institution",
    institution: "Krajowa Administracja Skarbowa",
    availability: "external",
    scopeNote: "Oficjalny serwis podatkowy poza prototypem. W prototypie widzisz tylko wzór potwierdzenia PIT-37.",
    view: "pismo",
    selectedId: "pit",
    source: "https://www.podatki.gov.pl/e-urzad-skarbowy/",
    sourceLabel: "podatki.gov.pl — e-Urząd Skarbowy",
    relatedLetterIds: ["pit"],
  },
];

export function serviceById(id: string): ServiceDef | undefined {
  return SERVICES.find((item) => item.id === id);
}

export function servicesByHub(hub: HubId): ServiceDef[] {
  return SERVICES.filter((item) => item.hub === hub);
}

export function servicesByCategory() {
  const groups: { category: string; items: ServiceDef[] }[] = [];
  for (const item of SERVICES) {
    const found = groups.find((group) => group.category === item.category);
    if (found) found.items.push(item);
    else groups.push({ category: item.category, items: [item] });
  }
  return groups;
}
