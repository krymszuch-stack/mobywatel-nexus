import { CITIZEN } from "./data";
import type { OneFlowPersisted } from "./oneflow";
import type { CitizenPersona, DemoStoryId, HomeMode, PersonaId, ViewId } from "./types";

export const PERSONAS: Record<PersonaId, CitizenPersona> = {
  default: {
    id: "default",
    given: CITIZEN.given,
    family: CITIZEN.family,
    vocative: CITIZEN.vocative,
    pesel: CITIZEN.pesel,
    birth: CITIZEN.birth,
    birthYear: 1985,
    birthLabel: "14 marca 1985",
    address: CITIZEN.address,
    city: CITIZEN.city,
    roleLabel: "Profil podstawowy (wzór)",
    note: "Dane fikcyjne do prezentacji prototypu mObywatel NEXUS.",
  },
  student: {
    id: "student",
    given: "Kacper Jan",
    family: "Nowak",
    vocative: "Kacprze",
    pesel: "06251109412",
    birth: "2006-05-11",
    birthYear: 2006,
    birthLabel: "11 maja 2006",
    address: "ul. Kwiatowa 14",
    city: "33-100 Tarnów",
    roleLabel: "Student (fikcyjna persona · 20 lat)",
    note: "Persona demonstracyjna dla historii: studia, pierwsza praca i przeprowadzka do Krakowa.",
  },
  senior: {
    id: "senior",
    given: "Stanisława Maria",
    family: "Kowalczyk",
    vocative: "Stanisławo",
    pesel: "51082204826",
    birth: "1951-08-22",
    birthYear: 1951,
    birthLabel: "22 sierpnia 1951",
    address: "os. Słoneczne 6 m. 11",
    city: "31-956 Kraków",
    roleLabel: "Seniorka (fikcyjna persona · 75 lat)",
    note: "Persona demonstracyjna w trybie „Prosto i wygodnie” i większym tekście (125%).",
  },
};

export function getActivePersona(personaId?: PersonaId): CitizenPersona {
  if (personaId && PERSONAS[personaId]) return PERSONAS[personaId];
  return PERSONAS.default;
}

export type DemoStepAction =
  | { type: "orbit"; query: string }
  | { type: "view"; view: ViewId; selectedId?: string }
  | { type: "saved_plan"; intentMatch: string };

export type DemoStep = {
  id: string;
  label: string;
  hint: string;
  actionLabel: string;
  action: DemoStepAction;
  isDone: (state: OneFlowPersisted) => boolean;
};

export type DemoStory = {
  id: DemoStoryId;
  order: number;
  shortLabel: string;
  title: string;
  personaId: PersonaId;
  seconds: number;
  recommendedMode: HomeMode;
  recommendedScale: number;
  prompt: string;
  summary: string;
  steps: DemoStep[];
};

function findSavedPlanByIntent(state: OneFlowPersisted, intent: string) {
  return Object.values(state.savedPlans).find((plan) =>
    plan.intents.includes(intent as never),
  );
}

export const DEMO_STORIES: DemoStory[] = [
  {
    id: "student",
    order: 1,
    shortLabel: "1. Student",
    title: "Studia, pierwsza praca i przeprowadzka",
    personaId: "student",
    seconds: 25,
    recommendedMode: "daily",
    recommendedScale: 1,
    prompt:
      "Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę. Co muszę załatwić?",
    summary:
      "Jedno zdanie uruchamia 3 wątki życiowe, łączy wymagania ZUS/PIT/meldunku/uczelni i zapisuje żywy plan sprawy.",
    steps: [
      {
        id: "student-plan",
        label: "Ułóż i zapisz plan wielowątkowy w „W czym mogę pomóc?”",
        hint: "Zobacz podział na obowiązki, zalecenia i możliwości oraz dlaczego pojawia się każde zadanie.",
        actionLabel: "Otwórz „W czym mogę pomóc?”",
        action: {
          type: "orbit",
          query:
            "Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę. Co muszę załatwić?",
        },
        isDone: (state) => Boolean(findSavedPlanByIntent(state, "studia")),
      },
      {
        id: "student-journey",
        label: "Ukończ ścieżkę „Studia, pierwsza praca i przeprowadzka”",
        hint: "Wybierz formę umowy i sytuację mieszkaniową — zapis zaktualizuje plan automatycznie.",
        actionLabel: "Otwórz ścieżkę",
        action: { type: "view", view: "zdarzenie", selectedId: "start-krakow" },
        isDone: (state) => Boolean(state.journeys["start-krakow"]?.done),
      },
      {
        id: "student-sync",
        label: "Sprawdź zaktualizowany plan sprawy i odblokowane kroki",
        hint: "Zadania powiązane ze ścieżką zmieniły status na „zrealizowane w usłudze”.",
        actionLabel: "Otwórz zapisany plan",
        action: { type: "saved_plan", intentMatch: "studia" },
        isDone: (state) => {
          const plan = findSavedPlanByIntent(state, "studia");
          return Boolean(
            plan &&
              state.journeys["start-krakow"]?.done &&
              state.view === "sprawa" &&
              state.selectedId === plan.id,
          );
        },
      },
    ],
  },
  {
    id: "senior",
    order: 2,
    shortLabel: "2. Senior",
    title: "Skierowanie lekarskie, pismo i osoba zaufana",
    personaId: "senior",
    seconds: 25,
    recommendedMode: "simple",
    recommendedScale: 1.25,
    prompt:
      "Mam skierowanie do kardiologa, dostałam ważne pismo urzędowe i chcę, żeby syn mógł mi pomagać w sprawach",
    summary:
      "Spokojny tryb „Prosto i wygodnie” + większy tekst: łączy mojeIKP, e-Doręczenia i osobę zaufaną w jeden plan.",
    steps: [
      {
        id: "senior-plan",
        label: "Ułóż i zapisz spokojny plan w „W czym mogę pomóc?”",
        hint: "Asystent łączy zdrowie, pismo i pomoc bliskiej osoby, jasno odróżniając upoważnienie w mojeIKP.",
        actionLabel: "Otwórz „W czym mogę pomóc?”",
        action: {
          type: "orbit",
          query:
            "Mam skierowanie do kardiologa, dostałam ważne pismo urzędowe i chcę, żeby syn mógł mi pomagać w sprawach",
        },
        isDone: (state) =>
          Boolean(
            Object.values(state.savedPlans).find(
              (p) => p.intents.includes("zdrowie") && p.intents.includes("pisma"),
            ),
          ),
      },
      {
        id: "senior-ikp",
        label: "Ustaw przypomnienie o skierowaniu w mojeIKP",
        hint: "Wybierz datę i godzinę — przypomnienie trafi od razu na Moją oś czasu i zaktualizuje plan.",
        actionLabel: "Przejdź do mojeIKP",
        action: { type: "view", view: "zdrowie", selectedId: "skierowania" },
        isDone: (state) => state.reminders.some((r) => r.id === "skierowanie"),
      },
      {
        id: "senior-trusted",
        label: "Włącz osobę zaufaną lub odpowiedz na pismo",
        hint: "Każda decyzja wymaga jawnego potwierdzenia i natychmiast aktualizuje zapisany plan.",
        actionLabel: "Otwórz Osobę zaufaną",
        action: { type: "view", view: "zaufana" },
        isDone: (state) =>
          state.trustedOn || Boolean(state.replies.komunikacja || state.replies.szkola),
      },
    ],
  },
  {
    id: "letter",
    order: 3,
    shortLabel: "3. Pismo",
    title: "Odpowiedź na pismo KR/2026/4412 z UPO-WZÓR",
    personaId: "default",
    seconds: 20,
    recommendedMode: "daily",
    recommendedScale: 1,
    prompt:
      "Wyjaśnij pismo KR/2026/4412 i powiedz, co muszę zrobić z dowodem rejestracyjnym",
    summary:
      "Jedna atomowa transakcja: wyjaśnienie po ludzku, edytowalny szkic, UPO-WZÓR, aktualizacja sprawy i zniknięcie starego priorytetu.",
    steps: [
      {
        id: "letter-plan",
        label: "Sprawdź wyjaśnienie i zapisz plan dla sprawy pojazdu",
        hint: "Asystent wyjaśnia pismo po ludzku, cytuje źródło i tworzy plan powiązany z pojazdem KR NX851.",
        actionLabel: "Otwórz „W czym mogę pomóc?”",
        action: {
          type: "orbit",
          query:
            "Wyjaśnij pismo KR/2026/4412 i powiedz, co muszę zrobić z dowodem rejestracyjnym",
        },
        isDone: (state) =>
          Boolean(findSavedPlanByIntent(state, "pisma")) || state.readIds.includes("komunikacja"),
      },
      {
        id: "letter-reply",
        label: "Edytuj szkic i zatwierdź odpowiedź w e-Doręczeniach",
        hint: "Wstaw propozycję szkicu lub wpisz własną treść i zatwierdź — powstanie potwierdzenie UPO-WZÓR.",
        actionLabel: "Otwórz pismo KR/2026/4412",
        action: { type: "view", view: "pismo", selectedId: "komunikacja" },
        isDone: (state) => Boolean(state.replies.komunikacja),
      },
      {
        id: "letter-verify",
        label: "Zobacz zaktualizowaną sprawę i czysty priorytet na ekranie Start",
        hint: "Sprawa pojazdu zmieniła status, a odpowiedziane pismo nie wraca już jako pilne.",
        actionLabel: "Otwórz sprawę pojazdu",
        action: { type: "view", view: "sprawa", selectedId: "rejestracja" },
        isDone: (state) =>
          Boolean(state.replies.komunikacja) &&
          (state.view === "sprawa" || state.view === "start"),
      },
    ],
  },
  {
    id: "wallet",
    order: 4,
    shortLabel: "4. Portfel",
    title: "Utrata portfela i skoordynowana ochrona tożsamości",
    personaId: "default",
    seconds: 20,
    recommendedMode: "daily",
    recommendedScale: 1,
    prompt: "Zgubiłam portfel z dowodem osobistym i kartami. Co robić po kolei?",
    summary:
      "Zależności kroków bezpieczeństwa: zgłoszenie utraty mDowodu i zastrzeżenie PESEL automatycznie odblokowują dalsze kroki w planie.",
    steps: [
      {
        id: "wallet-plan",
        label: "Utwórz i zapisz plan ochrony tożsamości w „W czym mogę pomóc?”",
        hint: "Plan rozdziela obowiązki, zalecenia i kroki bankowe z jawnymi zależnościami.",
        actionLabel: "Otwórz „W czym mogę pomóc?”",
        action: {
          type: "orbit",
          query: "Zgubiłam portfel z dowodem osobistym i kartami. Co robić po kolei?",
        },
        isDone: (state) => Boolean(findSavedPlanByIntent(state, "utrata")),
      },
      {
        id: "wallet-loss",
        label: "Zgłoś utratę mDowodu (symulacja z potwierdzeniem)",
        hint: "W Ochronie tożsamości oznacz utratę mDowodu — lokalny podgląd zostanie natychmiast wyłączony.",
        actionLabel: "Otwórz Ochronę tożsamości",
        action: { type: "view", view: "bezpieczenstwo" },
        isDone: (state) => state.lost.includes("dowod"),
      },
      {
        id: "wallet-pesel",
        label: "Zastrzeż numer PESEL (symulacja z UPO-WZÓR)",
        hint: "Po zastrzeżeniu PESEL zapisany plan automatycznie odhaczy krok i odblokuje zadanie bankowe.",
        actionLabel: "Zastrzeż PESEL",
        action: { type: "view", view: "bezpieczenstwo" },
        isDone: (state) => state.peselLocked,
      },
    ],
  },
];

export function demoStoryById(id: DemoStoryId | null | undefined): DemoStory | undefined {
  if (!id) return undefined;
  return DEMO_STORIES.find((story) => story.id === id);
}
