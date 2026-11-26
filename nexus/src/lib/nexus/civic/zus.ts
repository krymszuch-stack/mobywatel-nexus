import { zusOffice } from "./forms";
import {
  demoDate,
  demoNow,
  doc,
  eventFor,
  initialData,
  publish,
  repository,
  task,
  type CivicCase,
  type CivicData,
} from "./model";

export type InsuranceEnrollment = {
  payer: string;
  start: string;
  types: string[];
  healthBranch: string;
  family: string[];
  at: string;
};
export type Contribution = {
  year: string;
  month: string;
  payer: string;
  base?: number;
  due?: number;
  paid?: number;
};
export type Pension = {
  account: number;
  subaccount: number;
  initial?: number;
  indexation: string;
  reportYear: number;
  ofe?: string;
  ria?: string;
  special?: string;
};
export type ZusBenefit = { id: string; title: string; detail: string; variants?: string[] };
export type Preparation = {
  id: string;
  state: "preparing" | "ready" | "error";
  scope: string;
  kind: "certificate" | "archive";
};
export type ZusData = CivicData<
  CivicCase,
  {
    preparation: Preparation[];
    preferences: Record<string, string>;
    archiveError: boolean;
    urgent: boolean;
  }
>;

export const ezus = "https://www.zus.pl/ezus/logowanie";
export const insurance: InsuranceEnrollment = {
  payer: "Zakład Przykładowy Demo",
  start: "2026-01-01",
  types: ["Emerytalne", "Rentowe", "Chorobowe", "Zdrowotne"],
  healthBranch: "Oddział NFZ Demo",
  family: ["Członek rodziny Demo"],
  at: demoNow,
};
export const contributions: Contribution[] = [
  { year: "2026", month: "Październik", payer: insurance.payer, base: 5300, due: 720, paid: 720 },
  { year: "2026", month: "Wrzesień", payer: insurance.payer, base: 5100, due: 699 },
  { year: "2025", month: "Grudzień", payer: insurance.payer, base: 4950, due: 652, paid: 652 },
];
export const pension: Pension = {
  account: 26300,
  subaccount: 7800,
  initial: 0,
  indexation: "Roczna waloryzacja z danych demo",
  reportYear: 2025,
  ofe: "Brak danych",
  ria: "Brak raportów w tym scenariuszu",
  special: "Brak informacji o pracy w szczególnych warunkach",
};
export const zusBenefits: ZusBenefit[] = [
  {
    id: "wspierajace",
    title: "Świadczenie wspierające",
    detail:
      "Przygotuj decyzję WZON o poziomie potrzeby wsparcia. Świadczenie rozpatruje ZUS. Dofinansowania PFRON mają własne sprawy.",
  },
  {
    id: "800",
    title: "Rodzina 800+",
    detail: "Sprawdź informacje dotyczące świadczenia wychowawczego w eZUS.",
  },
  {
    id: "aktywny",
    title: "Aktywny Rodzic",
    detail: "Sprawdź wariant właściwy dla swojej sytuacji w eZUS.",
    variants: ["Aktywni rodzice w pracy", "Aktywnie w żłobku", "Aktywnie w domu"],
  },
  {
    id: "start",
    title: "Dobry Start",
    detail: "Kontakty do powiadomień mogą pochodzić z wniosku DS.",
  },
];

export const certificationScopes = [
  "Aktualne zgłoszenia",
  "Podstawy składek",
  "Przerwy w pracy",
  "Członkowie rodziny",
];
export const zusSettings = ["Pisma i sprawy", "Zaświadczenia", "Wizyty", "Dostęp i pełnomocnictwa"];
export const zusCatalog = [
  ["POG", "Pismo ogólne do ZUS"],
  ["SWN", "Wniosek o świadczenie wspierające"],
  ["SWN-INF", "Zgłoszenie zmiany"],
  ["USW-1–USW-7", "Ubezpieczenia opiekuna i rodziny"],
  ["A1", "Zaświadczenie A1"],
  ["RUD", "Zgłoszenie umowy o dzieło, korekta i wycofanie"],
  ["RUD", "Rejestr umów o dzieło"],
  ["USP", "Zaświadczenie o okresach ubezpieczenia do stażu pracy"],
  ["", "Wnioski emerytalno-rentowe"],
  ["", "Zasiłki"],
  ["", "Wyjaśnienia, odwołania, korekty i wycofania"],
  ["", "Pełnomocnictwa"],
  ["", "Sprawy międzynarodowe"],
  ["", "Operacje do potwierdzenia"],
];

export function seedZus(): ZusData {
  const support: CivicCase = {
    id: "DEMO-zus-support",
    source: "zus",
    scope: "personal",
    title: "Świadczenie wspierające – uzupełnienie",
    number: "DEMO-ZUS-SWN/2026",
    sourceStatus: "Wymaga uzupełnienia",
    office: zusOffice,
    updatedAt: demoDate(-1),
    version: 1,
    summary: "Uzupełnij oznaczenie decyzji WZON i opis brakującego dokumentu.",
  };
  const noticeCase: CivicCase = {
    ...support,
    id: "DEMO-zus-inbox",
    title: "Pismo z ZUS do odbioru",
    number: "DEMO-ZUS-PIS/2026",
    sourceStatus: "W toku",
    summary: "Pismo oczekuje na odbiór w eZUS.",
  };
  const letter = doc(noticeCase, "pismo", "Informacja z ZUS o sprawie", {
    delivery: "waiting",
    requiresReceipt: true,
    kind: "Pismo do odbioru w eZUS",
  });
  const data = initialData(
    "zus",
    [support, noticeCase],
    [
      letter,
      doc(support, "braki", "Lista braków do uzupełnienia", { body: support.summary }),
      {
        ...doc(support, "ezla", "Zaświadczenie lekarskie (e-ZLA)", {
          body: "Okres: 16–20 listopada 2026 r.\nWystawiono: 16 listopada 2026 r.\nStatus: anulowane. Dokument zastępczy jest dostępny w demonstracji.",
          kind: "e-ZLA",
        }),
        caseId: null,
      },
      {
        ...doc(support, "ezla-replace", "Zaświadczenie lekarskie zastępcze (e-ZLA)", {
          body: "Okres: 16–19 listopada 2026 r.\nWystawiono: 17 listopada 2026 r.\nStatus: zastępuje zaświadczenie anulowane.",
          kind: "e-ZLA",
        }),
        caseId: null,
      },
    ],
    { preparation: [], preferences: {}, archiveError: false, urgent: false } as ZusData["extra"],
  );
  data.tasks = [
    task(
      support,
      "supplement",
      "Uzupełnij dane do świadczenia",
      support.summary,
      "Zobacz listę braków",
      undefined,
      demoDate(8),
    ),
    task(
      noticeCase,
      "receipt",
      "Pismo czeka na odbiór w eZUS",
      "Otwórz informacje o kanale odbioru.",
      "Zobacz pismo",
      { kind: "document", id: letter.id },
    ),
  ];
  return publish(
    publish(
      data,
      eventFor(
        support,
        "case.supplement",
        "Sprawa świadczenia wymaga uzupełnienia",
        { kind: "case", id: support.id },
        support.id,
        { at: demoDate(-1) },
      ),
      "action",
    ),
    eventFor(
      letter,
      "document.waiting",
      "Nowe pismo z ZUS czeka na odbiór",
      { kind: "document", id: letter.id },
      noticeCase.id,
      { at: demoNow },
    ),
    "action",
  );
}

export const useZus = repository("zus", seedZus);
