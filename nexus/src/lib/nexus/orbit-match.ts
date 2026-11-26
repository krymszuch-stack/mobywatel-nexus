import { DESTINATIONS, DOCUMENTS, LETTERS, type Dest, type LetterItem } from "./data";
import { getActivePersona } from "./demo-stories";
import { fold } from "./format";
import {
  letterStatus,
  selectDerivedCases,
  selectHomePriority,
  type OneFlowPersisted,
} from "./oneflow";
import { SERVICES } from "./registry";
import type { ActionPlan, ActionPlanTask, IntentId } from "./types";

export type OrbitNextAction = {
  id: string;
  label: string;
  meta: string;
  view: Dest["view"];
  selectedId?: string;
  glyph: Dest["glyph"];
};

export type OrbitAnalysis = {
  query: string;
  intents: IntentId[];
  actionPlan: ActionPlan | null;
  letterExplanation: LetterItem | null;
  nextActions: OrbitNextAction[];
  results: Dest[];
};

const INTENT_RULES: { id: IntentId; patterns: RegExp[] }[] = [
  {
    id: "studia",
    patterns: [/\bstudi/, /\buczelni/, /\blegitymacj/, /\bstypendi/, /\bakademik/, /\bstudent/],
  },
  {
    id: "przeprowadzka",
    patterns: [/\bprzeprowadz/, /\bmeldun/, /\bzameld/, /\bnajem/, /\bnowy adres/, /\bzmiana adresu/, /\bmieszkani/],
  },
  {
    id: "pierwsza-praca",
    patterns: [/\bpierwsz\w* prac/, /\bpodejmuj\w* prac/, /\bprac[aeiy]/, /\bzatrudni/, /\bumow[aeiy]/, /\bpit-?2/, /\bzus\b/],
  },
  {
    id: "utrata",
    patterns: [/\bzgubil/, /\bukrad/, /\butrat/, /\bportfel/, /\bzastrzez/, /\bpesel\b/, /\bkradziez/],
  },
  {
    id: "zdrowie",
    patterns: [/\bzdrow/, /\bikp\b/, /\bmojeikp/, /\brecept/, /\bskierow/, /\blekarz/, /\bkardiolog/, /\bwizyt/, /\bekuz\b/, /\bnfz\b/],
  },
  {
    id: "zaufana",
    patterns: [/\bzaufan/, /\bupowazni/, /\bpelnomocn/, /\bsyn\b/, /\bcork/, /\bmogl mi pomag/, /\bpomag\w* w spraw/],
  },
  {
    id: "pojazd",
    patterns: [/\bpojazd/, /\bsamochod/, /\baut[oa]/, /\bpunkt\w* karn/, /\bstluczk/, /\bdowod\w* rejestr/, /\brejestracyjn/, /\bbadani\w* techn/, /\bprawo jazdy/],
  },
  {
    id: "pisma",
    patterns: [/\bpism/, /\blist/, /\bskrzynk/, /\bdoreczen/, /\bwyjasnij/, /\bco oznacza/, /\bodpowiedz/, /\bkr\/2026/],
  },
  {
    id: "wsparcie",
    patterns: [/\bwsparci/, /\bswiadczen/, /\b800/, /\bulg[ai]/, /\bobiad/, /\bzasilek/, /\bkdr\b/],
  },
  {
    id: "szkola",
    patterns: [/\bszkol/, /\bzebrani/, /\bklas\w* 1b/, /\bdzieck/],
  },
  {
    id: "paszport",
    patterns: [/\bpaszport/, /\bpodroz/, /\bwyjazd/],
  },
  {
    id: "dokumenty",
    patterns: [/\bmdowod/, /\bdowod\b/, /\bdokument/, /\bportfel\b/],
  },
  {
    id: "ustawienia",
    patterns: [/\bmotyw/, /\bkontrast/, /\bwyglad/, /\bczcionk/, /\bdostepnosc/, /\btryb prosty/],
  },
];

export function detectIntents(query: string): IntentId[] {
  const q = fold(query.trim());
  if (!q) return [];
  const found: IntentId[] = [];
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((rx) => rx.test(q))) {
      found.push(rule.id);
    }
  }
  return found;
}

function detectCity(query: string): string {
  const q = fold(query);
  if (q.includes("krakow")) return "Kraków";
  if (q.includes("warszaw")) return "Warszawa";
  if (q.includes("gdansk")) return "Gdańsk";
  if (q.includes("wroclaw")) return "Wrocław";
  if (q.includes("poznan")) return "Poznań";
  return "Kraków";
}

function buildPlanId(intents: IntentId[], suffix: string): string {
  return `${[...intents].sort().join("-")}-${fold(suffix)}`;
}

export function buildActionPlan(
  query: string,
  intents: IntentId[],
  state?: Partial<
    Pick<
      OneFlowPersisted,
      "peselLocked" | "lost" | "replies" | "reminders" | "journeys" | "trustedOn" | "activePersona"
    >
  >,
): ActionPlan | null {
  const persona = getActivePersona(state?.activePersona);
  const lifeIntents = intents.filter((i) =>
    ["studia", "przeprowadzka", "pierwsza-praca"].includes(i),
  );
  const lostIntent = intents.includes("utrata");
  const seniorCareFlow =
    intents.includes("zdrowie") && (intents.includes("pisma") || intents.includes("zaufana"));
  const letterVehicleFlow = intents.includes("pisma") && intents.includes("pojazd");

  if (lifeIntents.length === 0 && !lostIntent && !seniorCareFlow && !letterVehicleFlow) {
    return null;
  }

  const city = detectCity(query);
  const reusedData = [
    { label: "Imiona i nazwisko", value: `${persona.given} ${persona.family}`, source: "mDowód (wzór)" },
    { label: "PESEL", value: persona.pesel, source: "mDowód (wzór)" },
    { label: "Data urodzenia", value: persona.birthLabel, source: "mDowód (wzór)" },
    { label: "Dotychczasowy adres", value: `${persona.address}, ${persona.city}`, source: "mDowód (wzór)" },
  ];

  // Story 4: Lost wallet / coordinated identity protection
  if (lostIntent && lifeIntents.length === 0) {
    const peselDone = Boolean(state?.peselLocked);
    const idLost = Boolean(state?.lost?.includes("dowod"));
    const tasks: ActionPlanTask[] = [
      {
        id: "lost-doc-status",
        intent: "utrata",
        category: "obowiązek",
        title: "Zgłoś utratę dokumentu tożsamości (mDowód / dowód)",
        purpose: "Oznaczenie utraty unieważnia dokument i chroni przed podszyciem się pod Twoje dane.",
        whyShown: "Wykryto utratę portfela z dokumentem — natychmiastowe zgłoszenie utraty to pierwszy krok bezpieczeństwa.",
        institution: "Urząd gminy / gov.pl (w prototypie: Ochrona tożsamości)",
        dependencies: ["Ustal, które dokumenty znajdowały się w portfelu"],
        requiredData: [`Seria i numer dokumentu z portfela wzorów (NXS 482913 · ${persona.pesel})`],
        missingInfo: idLost ? [] : ["Potwierdzenie w module Ochrona tożsamości, które dokumenty utracono"],
        status: idLost ? "gotowe" : "do zrobienia",
        officialUrl:
          "https://www.gov.pl/web/gov/zglos-utrate-lub-uszkodzenie-swojego-dowodu-osobistego-uniewaznij-dowod",
        officialLabel: "gov.pl — Zgłoś utratę dowodu osobistego",
        serviceId: "mdowod",
        targetView: "bezpieczenstwo",
        kind: "task",
        autoCompleteWhen: { type: "doc_lost", docId: "dowod" },
      },
      {
        id: "lost-pesel-lock",
        intent: "utrata",
        category: "zalecenie",
        title: "Zastrzeż numer PESEL",
        purpose: "Ogranicza ryzyko zaciągnięcia kredytu lub wyrobienia duplikatu karty SIM na Twoje dane.",
        whyShown: "Zalecane przy każdej utracie dowodu lub portfela, nawet zanim wydasz nowy dokument.",
        institution: "Rejestr zastrzeżeń PESEL / mObywatel (w prototypie: Ochrona tożsamości)",
        dependencies: ["Wymaga wyraźnego potwierdzenia przez obywatela"],
        requiredData: [`PESEL ${persona.pesel} (pobrany raz z mDowodu)`],
        missingInfo: [],
        status: peselDone ? "gotowe" : "do zrobienia",
        officialUrl: "https://www.gov.pl/web/gov/zastrzez-numer-pesel",
        officialLabel: "gov.pl — Zastrzeż numer PESEL",
        serviceId: "pesel",
        targetView: "bezpieczenstwo",
        kind: "task",
        autoCompleteWhen: { type: "pesel_locked" },
      },
      {
        id: "lost-banks",
        intent: "utrata",
        category: "obowiązek",
        title: "Zastrzeż karty płatnicze i zgłoś dokument w systemie bankowym",
        purpose: "Blokada kart płatniczych oraz wpis do systemu Dokumenty Zastrzeżone poza tym prototypem.",
        whyShown: "Wspomniano o utracie portfela/kart — administracja publiczna nie blokuje kart bankowych automatycznie.",
        institution: "Twój bank / Dokumenty Zastrzeżone (poza prototypem)",
        dependencies: ["Najlepiej wykonać po zgłoszeniu utraty dowodu i zastrzeżeniu PESEL"],
        blockedByTaskIds: ["lost-doc-status", "lost-pesel-lock"],
        requiredData: ["Numer infolinii Twojego banku"],
        missingInfo: ["Prototyp nie przechowuje danych kart ani numerów rachunków bankowych"],
        status: "wymaga danych",
        officialUrl: "https://dokumentyzastrzezone.pl/",
        officialLabel: "dokumentyzastrzezone.pl — informacja bankowa",
        targetView: "bezpieczenstwo",
        kind: "task",
      },
      {
        id: "lost-access-check",
        intent: "utrata",
        category: "możliwość",
        title: "Sprawdź rejestr „Dostęp do moich danych”",
        purpose: "Pozwala zweryfikować ostatnie lokalne zdarzenia i ewentualne odpytania rejestru.",
        whyShown: "Opcjonalna kontrola przejrzystości po zabezpieczeniu tożsamości.",
        institution: "mObywatel NEXUS — Rejestr przejrzystości dostępu",
        dependencies: ["Po zastrzeżeniu numeru PESEL"],
        blockedByTaskIds: ["lost-pesel-lock"],
        requiredData: ["Brak dodatkowych danych — historia jest już dostępna w aplikacji"],
        missingInfo: [],
        status: "do zrobienia",
        targetView: "dostepy",
        kind: "task",
      },
    ];

    return {
      id: buildPlanId(["utrata"], persona.id),
      query,
      title: "Utrata portfela i ochrona tożsamości",
      intents: ["utrata"],
      summary:
        "Skoordynowana kolejność działań: najpierw utrata dokumentu i zastrzeżenie PESEL, potem blokada bankowa i kontrola dostępu.",
      facts: [
        `W portfelu wzorów zapisane są: mDowód (NXS 482913), mPrawo jazdy (BNX 850314), Paszport (NX 184220) i Karta EKUZ.`,
        peselDone
          ? "Numer PESEL jest już oznaczony jako zastrzeżony w tym prototypie."
          : "Numer PESEL nie jest obecnie zastrzeżony w tym prototypie.",
        idLost
          ? "Utrata wzoru mDowodu została już zgłoszona lokalnie."
          : "Wzór mDowodu jest nadal aktywny w tym prototypie.",
      ],
      interpretations: [
        "W realnej sytuacji zgłoszenie utraty dowodu i zastrzeżenie PESEL należy wykonać w oficjalnych kanałach (gov.pl / mObywatel / bank) — prototyp wykonuje pełną symulację lokalną z potwierdzeniem UPO-WZÓR.",
      ],
      reusedData,
      deduplicatedRequirements: [
        `Dane tożsamości (${persona.pesel} i seria NXS 482913) pobrane raz z mDowodu dla wszystkich kroków ochrony`,
      ],
      missingInfo: ["Lista utraconych kart bankowych i kontakt do banku (poza zakresem prototypu)"],
      tasks,
      createdAt: new Date().toISOString(),
      personaId: persona.id,
    };
  }

  // Story 2: Senior managing healthcare referrals + administrative correspondence + trusted person
  if (seniorCareFlow && lifeIntents.length === 0) {
    const hasReminder = Boolean(state?.reminders?.some((r) => r.id === "skierowanie"));
    const letterDone = Boolean(state?.replies?.komunikacja);
    const trustedDone = Boolean(state?.trustedOn);
    const planIntents: IntentId[] = ["zdrowie", "pisma"];
    if (intents.includes("zaufana")) planIntents.push("zaufana");

    const tasks: ActionPlanTask[] = [
      {
        id: "senior-ikp-reminder",
        intent: "zdrowie",
        category: "zalecenie",
        title: "Ustaw przypomnienie dla skierowania do kardiologa (mojeIKP)",
        purpose: "Zapisanie własnej daty i godziny kontaktu z przychodnią, aby termin nie umknął.",
        whyShown: "Wykryto skierowanie do kardiologa (WZÓR-0419 w mojeIKP) — przypomnienie od razu pojawi się na Mojej osi czasu i ekranie Start.",
        institution: "mojeIKP / pacjent.gov.pl (w prototypie: hub Zdrowie)",
        dependencies: ["Skierowanie WZÓR-0419 jest już dostępne w hubie mojeIKP"],
        requiredData: [`PESEL ${persona.pesel} (pobrany raz z mDowodu)`],
        missingInfo: hasReminder ? [] : ["Wybrana data i godzina przypomnienia o rejestracji wizyty"],
        status: hasReminder ? "gotowe" : "wymaga danych",
        officialUrl: "https://pacjent.gov.pl/",
        officialLabel: "pacjent.gov.pl — mojeIKP i e-Skierowania",
        serviceId: "ikp",
        targetView: "zdrowie",
        targetId: "skierowania",
        kind: "health_info",
        autoCompleteWhen: { type: "reminder_exists", reminderId: "skierowanie" },
      },
      {
        id: "senior-letter-reply",
        intent: "pisma",
        category: "obowiązek",
        title: "Przeczytaj wyjaśnienie i odpowiedz na pilne pismo KR/2026/4412",
        purpose: "Udzielenie odpowiedzi na wezwanie urzędowe bez zgadywania języka prawniczego.",
        whyShown: "W Moich pismach (e-Doręczenia) czeka pismo wymagające odpowiedzi — przygotowaliśmy proste wyjaśnienie i propozycję szkicu.",
        institution: "Urząd Miasta Krakowa · e-Doręczenia",
        dependencies: ["Sprawdź sekcję „Wyjaśnij mi to prościej” przed zatwierdzeniem szkicu"],
        requiredData: ["Numer sprawy KR/2026/4412 (wstawiany automatycznie ze skrzynki)"],
        missingInfo: letterDone ? [] : ["Twoja akceptacja treści odpowiedzi w e-Doręczeniach"],
        status: letterDone ? "gotowe" : "do zrobienia",
        officialUrl: "https://www.gov.pl/web/e-doreczenia",
        officialLabel: "gov.pl — e-Doręczenia",
        serviceId: "doreczenia",
        targetView: "pismo",
        targetId: "komunikacja",
        kind: "task",
        autoCompleteWhen: { type: "letter_replied", letterId: "komunikacja" },
      },
      {
        id: "senior-trusted-person",
        intent: "zaufana",
        category: "możliwość",
        title: "Włącz Osobę zaufaną (oraz poznaj różnicę wobec mojeIKP)",
        purpose: "Umożliwienie bliskiej osobie pomocy przy pismach w tym prototypie za Twoją wyraźną zgodą.",
        whyShown: "Zapytałaś o pomoc bliskiej osoby — opcja jest dobrowolna i odwracalna jednym kliknięciem.",
        institution: "Osoba zaufana (oddzielnie od pełnomocnictwa w mojeIKP)",
        dependencies: ["Świadome potwierdzenie zakresu upoważnienia"],
        requiredData: ["Dane osoby zaufanej (Marek Julian Baran — zapisane we wzorze)"],
        missingInfo: ["Prawdziwe upoważnienie medyczne nadaje się osobno w oficjalnym mojeIKP"],
        status: trustedDone ? "gotowe" : "do zrobienia",
        officialUrl: "https://pacjent.gov.pl/aktualnosc/upowaznij-bliska-osobe-do-twoich-danych-medycznych",
        officialLabel: "pacjent.gov.pl — Upoważnienie bliskiej osoby",
        targetView: "zaufana",
        kind: "task",
        autoCompleteWhen: { type: "trusted_on" },
      },
      {
        id: "senior-timeline-review",
        intent: "zdrowie",
        category: "zalecenie",
        title: "Przejrzyj Moją oś czasu (zdrowie i korespondencja w jednym miejscu)",
        purpose: "Spokojny podgląd zapisanych przypomnień, potwierdzeń UPO-WZÓR i zmian uprawnień.",
        whyShown: "Po ustawieniu przypomnienia i obsłużeniu pisma wszystkie terminy zobaczysz na jednej chronologicznej liście.",
        institution: "OneFlow — Moja oś czasu",
        dependencies: ["Najpierw ustaw przypomnienie w mojeIKP"],
        blockedByTaskIds: ["senior-ikp-reminder"],
        requiredData: ["Brak — generowane automatycznie z Twoich działań"],
        missingInfo: [],
        status: "do zrobienia",
        targetView: "os",
        kind: "task",
      },
    ];

    return {
      id: buildPlanId(planIntents, persona.id),
      query,
      title: "Zdrowie, pisma urzędowe i wsparcie bliskiej osoby",
      intents: planIntents,
      summary:
        "Spokojny, skoordynowany plan łączący skierowanie z mojeIKP, pilne pismo z e-Doręczeń oraz dobrowolne upoważnienie osoby zaufanej.",
      facts: [
        `Profil: ${persona.given} ${persona.family} (PESEL ${persona.pesel}).`,
        "W hubie mojeIKP widnieje wzór skierowania do kardiologa (WZÓR-0419).",
        letterDone
          ? "Na pismo KR/2026/4412 zapisano już odpowiedź w prototypie."
          : "W e-Doręczeniach czeka pismo KR/2026/4412 wymagające odpowiedzi.",
      ],
      interpretations: [
        "Przypomnienie w prototypie nie rezerwuje terminu u lekarza — wizytę umawia się w przychodni lub przez pacjent.gov.pl.",
        "Osoba zaufana w tym prototypie nie nadaje formalnego pełnomocnictwa medycznego w mojeIKP ani pełnomocnictwa w urzędzie.",
      ],
      reusedData,
      deduplicatedRequirements: [
        `Dane tożsamości (${persona.given} ${persona.family}, PESEL ${persona.pesel}) pobrane raz z mDowodu dla zdrowia i korespondencji`,
      ],
      missingInfo: [
        ...(hasReminder ? [] : ["Preferowana data i godzina przypomnienia dla skierowania"]),
        "Formalne pełnomocnictwo medyczne (jeśli potrzebne — wymaga osobnego kroku w pacjent.gov.pl)",
      ],
      tasks,
      createdAt: new Date().toISOString(),
      personaId: persona.id,
    };
  }

  // Story 3: Official letter + vehicle registration coordinated plan
  if (letterVehicleFlow && lifeIntents.length === 0) {
    const letterDone = Boolean(state?.replies?.komunikacja);
    const journeyDone = Boolean(state?.journeys?.pojazd?.done);
    const tasks: ActionPlanTask[] = [
      {
        id: "letter-kr-reply",
        intent: "pisma",
        category: "obowiązek",
        title: "Odpowiedz na pismo KR/2026/4412 w e-Doręczeniach",
        purpose: "Przekazanie informacji o badaniu technicznym lub prośba o inny termin przed 18 grudnia 2026.",
        whyShown: "Pismo KR/2026/4412 wstrzymuje dokończenie wymiany dowodu rejestracyjnego dla pojazdu KR NX851.",
        institution: "Urząd Miasta Krakowa · Wydział Komunikacji",
        dependencies: ["Sprawdź wyjaśnienie po ludzku i edytuj proponowany szkic"],
        requiredData: ["Numer sprawy KR/2026/4412", "Numer rejestracyjny KR NX851 (z Moich pojazdów)"],
        missingInfo: letterDone ? [] : ["Treść Twojej odpowiedzi i potwierdzenie zapisu"],
        status: letterDone ? "gotowe" : "do zrobienia",
        officialUrl: "https://www.gov.pl/web/e-doreczenia",
        officialLabel: "gov.pl — e-Doręczenia",
        serviceId: "doreczenia",
        targetView: "pismo",
        targetId: "komunikacja",
        kind: "task",
        autoCompleteWhen: { type: "letter_replied", letterId: "komunikacja" },
      },
      {
        id: "letter-vehicle-check",
        intent: "pojazd",
        category: "zalecenie",
        title: "Zweryfikuj dane pojazdu KR NX851 i status badania technicznego",
        purpose: "Sprawdzenie daty ważności badania technicznego i polisy OC przed kontaktem z wydziałem.",
        whyShown: "Pismo odnosi się bezpośrednio do pojazdu KR NX851 zapisanego w Twoim hubie Kierowca.",
        institution: "CEPiK / mObywatel — Moje pojazdy (wzór)",
        dependencies: ["Dane pojazdu są gotowe do wglądu bez ponownego wpisywania"],
        requiredData: ["Numer rejestracyjny KR NX851 (pobrany raz z Moich pojazdów)"],
        missingInfo: ["Potwierdzenie aktualnego badania ze stacji kontroli pojazdów"],
        status: "do zrobienia",
        officialUrl: "https://www.gov.pl/web/gov/sprawdz-historie-pojazdu",
        officialLabel: "gov.pl — Historia pojazdu",
        serviceId: "pojazdy",
        targetView: "kierowca",
        targetId: "pojazdy",
        kind: "task",
      },
      {
        id: "letter-pickup-journey",
        intent: "pojazd",
        category: "możliwość",
        title: "Zaplanuj sposób odbioru dowodu rejestracyjnego",
        purpose: "Wybór punktu odbioru w Krakowie w ścieżce pojazdu po wysłaniu odpowiedzi.",
        whyShown: "Opcjonalny kolejny krok po załatwieniu wezwania KR/2026/4412 — aktualizuje tę samą sprawę pojazdu.",
        institution: "Urząd Miasta Krakowa — ścieżka „Odbierz dowód rejestracyjny”",
        dependencies: ["Najpierw wyślij odpowiedź na wezwanie KR/2026/4412"],
        blockedByTaskIds: ["letter-kr-reply"],
        requiredData: ["mDowód (do okazania przy odbiorze)"],
        missingInfo: journeyDone ? [] : ["Wybór dogodnego punktu odbioru"],
        status: journeyDone ? "gotowe" : "do zrobienia",
        targetView: "zdarzenie",
        targetId: "pojazd",
        kind: "task",
        autoCompleteWhen: { type: "journey_done", journeyId: "pojazd" },
      },
    ];

    return {
      id: buildPlanId(["pisma", "pojazd"], "kr4412"),
      query,
      title: "Pismo KR/2026/4412 i rejestracja pojazdu KR NX851",
      intents: ["pisma", "pojazd"],
      summary:
        "Łączy wezwanie z e-Doręczeń, dane pojazdu KR NX851 i sprawę rejestracji w jedną kolejność kroków.",
      facts: [
        "Pismo KR/2026/4412 z 20 listopada 2026 wskazuje brak aktualnego badania technicznego i datę 18 grudnia 2026.",
        "W hubie Kierowca widnieje pojazd KR NX851 powiązany ze sprawą „Rejestracja pojazdu”.",
      ],
      interpretations: [
        "Zatwierdzenie odpowiedzi w prototypie generuje lokalne potwierdzenie UPO-WZÓR i aktualizuje sprawę, ale nie wysyła prawdziwego pisma do urzędu.",
      ],
      reusedData,
      deduplicatedRequirements: [
        "Numer sprawy KR/2026/4412 oraz numer rejestracyjny KR NX851 połączone automatycznie między skrzynką, pojazdem i sprawą",
      ],
      missingInfo: [
        ...(letterDone ? [] : ["Potwierdzenie treści odpowiedzi w e-Doręczeniach"]),
        "Dokument aktualnego badania technicznego (do złożenia w prawdziwym urzędzie)",
      ],
      tasks,
      createdAt: new Date().toISOString(),
      personaId: persona.id,
    };
  }

  // Story 1: Unified multi-intent Life Event plan (Studia + Przeprowadzka + Pierwsza praca)
  const tasks: ActionPlanTask[] = [];
  const startJourneyDone = Boolean(state?.journeys?.["start-krakow"]?.done);
  const under26 = 2026 - persona.birthYear < 26;

  const deduplicatedRequirements: string[] = [
    `Dane osobowe i PESEL (${persona.pesel}) — pobrane raz z mDowodu dla uczelni, pracodawcy i urzędu miasta`,
    "Numer rachunku bankowego (IBAN) — wymagany raz do wynagrodzenia i ewentualnego stypendium",
  ];
  const missingInfo: string[] = [];
  const facts: string[] = [
    `Z mDowodu (wzór) znane są: imiona i nazwisko (${persona.given} ${persona.family}), PESEL (${persona.pesel}), data urodzenia (${persona.birthLabel}) oraz obecny adres (${persona.address}, ${persona.city}).`,
    `Rozpoznane zdarzenia życiowe: ${lifeIntents
      .map((i) =>
        i === "studia"
          ? "rozpoczęcie studiów"
          : i === "przeprowadzka"
            ? `przeprowadzka (${city})`
            : "pierwsza praca",
      )
      .join(", ")}.`,
  ];
  const interpretations: string[] = [
    "Plan łączy wymagania wielu instytucji w jedną kolejność, eliminując powtarzające się podawanie tych samych danych.",
    "Każde zadanie jest oznaczone jako obowiązek, zalecenie albo możliwość — prototyp nie wydaje decyzji urzędowych i nie wymyśla terminów ustawowych.",
  ];

  if (lifeIntents.includes("studia")) {
    missingInfo.push("Potwierdzenie przyjęcia na studia / statusu studenta z uczelni");
    tasks.push({
      id: "task-studia-status",
      intent: "studia",
      category: "zalecenie",
      title: "Potwierdź status studenta i aktywuj mLegitymację",
      purpose: "Uruchomienie uprawnień studenckich i dokumentu w aplikacji (jeśli uczelnia uczestniczy w programie).",
      whyShown: "Rozpoznano rozpoczęcie studiów — status studenta wpływa również na ZUS przy umowie zlecenia oraz na dostęp do zniżek.",
      institution: "Dziekanat wybranej uczelni / mObywatel",
      dependencies: ["Wpis na listę studentów przez uczelnię"],
      requiredData: ["Dane z mDowodu (użyte raz)", "Numer albumu i kod aktywacyjny z uczelni"],
      missingInfo: ["Brak danych uczelni i numeru albumu w profilu wzoru"],
      status: "wymaga danych",
      officialUrl: "https://info.mobywatel.gov.pl/dokumenty/mlegitymacja-studencka",
      officialLabel: "info.mobywatel.gov.pl — mLegitymacja studencka",
      serviceId: "mdowod",
      targetView: "dokumenty",
      kind: "task",
    });
  }

  if (lifeIntents.includes("pierwsza-praca")) {
    missingInfo.push("Rodzaj umowy w pierwszej pracy (umowa o pracę czy umowa zlecenie)");
    missingInfo.push("Numer rachunku bankowego do wypłaty wynagrodzenia");
    tasks.push({
      id: "task-praca-zus-pit",
      intent: "pierwsza-praca",
      category: "obowiązek",
      title: "Ustal formę umowy, zgłoszenie do ZUS (ZUA/ZZA) i oświadczenie PIT-2",
      purpose: "Prawidłowe zgłoszenie do ubezpieczeń przez płatnika oraz właściwe zaliczki na podatek.",
      whyShown: "Rozpoznano podjęcie pierwszej pracy — rodzaj umowy decyduje o zgłoszeniu ZUS i o tym, kto zgłasza Cię do NFZ.",
      institution: "Pracodawca / ZUS / Krajowa Administracja Skarbowa",
      dependencies: lifeIntents.includes("studia")
        ? ["Status studenta wpływa na zasady oskładkowania przy umowie zlecenia (zwłaszcza poniżej 26. r.ż.)"]
        : ["Podpisanie umowy z pracodawcą"],
      requiredData: [`PESEL ${persona.pesel} z mDowodu (użyty raz)`, "Numer rachunku bankowego", "Forma umowy"],
      missingInfo: startJourneyDone ? [] : ["Nie wybrano jeszcze rodzaju umowy w ścieżce „Ważne zmiany w życiu”"],
      status: startJourneyDone ? "gotowe" : "wymaga danych",
      officialUrl: "https://www.zus.pl/",
      officialLabel: "zus.pl — Ubezpieczenia i zgłoszenia",
      serviceId: "podatki",
      targetView: "zdarzenie",
      targetId: "start-krakow",
      kind: "task",
      autoCompleteWhen: { type: "journey_done", journeyId: "start-krakow" },
    });
    if (under26) {
      interpretations.push(
        `Uwaga podatkowa: dla profilu z rocznikiem ${persona.birthYear} (poniżej 26 lat) warto sprawdzić w oficjalnym serwisie podatki.gov.pl zasady „ulgi dla młodych” (PIT-0) oraz zwolnienia ZUS studenta na umowie zlecenia. Prototyp nie potwierdza automatycznie uprawnienia.`,
      );
    } else {
      interpretations.push(
        `Uwaga podatkowa: tzw. „ulga dla młodych” (zerowy PIT) dotyczy co do zasady osób do 26. roku życia. Ponieważ w danych wzoru widnieje rok urodzenia ${persona.birthYear}, ulga dla młodych nie dotyczy tego profilu wzoru — sprawdź rzeczywistą datę urodzenia i aktualne zasady na podatki.gov.pl.`,
      );
    }
  }

  if (lifeIntents.includes("studia") || lifeIntents.includes("pierwsza-praca")) {
    tasks.push({
      id: "task-zdrowie-nfz",
      intent: "zdrowie",
      category: "zalecenie",
      title: "Sprawdź tytuł do ubezpieczenia zdrowotnego (NFZ / eWUŚ)",
      purpose: "Upewnienie się, kto zgłasza Cię do ubezpieczenia zdrowotnego (pracodawca, członek rodziny lub uczelnia).",
      whyShown: "Połączenie studiów i pracy zmienia źródło ubezpieczenia zdrowotnego — warto sprawdzić tytuł po ustaleniu rodzaju umowy.",
      institution: "NFZ / mojeIKP / ZUS",
      dependencies: lifeIntents.includes("pierwsza-praca")
        ? ["Zależne od rodzaju umowy w pierwszej pracy"]
        : ["Zależne od statusu studenta i ewentualnego zgłoszenia przy rodzinie"],
      blockedByTaskIds: lifeIntents.includes("pierwsza-praca") ? ["task-praca-zus-pit"] : undefined,
      requiredData: [`PESEL ${persona.pesel} (użyty raz z mDowodu)`],
      missingInfo: ["Aktualny status eWUŚ jest sprawdzany wyłącznie w oficjalnym mojeIKP / placówce medycznej"],
      status: "do zrobienia",
      officialUrl: "https://pacjent.gov.pl/",
      officialLabel: "pacjent.gov.pl — mojeIKP i ubezpieczenie",
      serviceId: "ikp",
      targetView: "zdrowie",
      targetId: "ubezpieczenie",
      kind: "health_info",
    });
    interpretations.push(
      "Karta EKUZ z portfela nie potwierdza ubezpieczenia zdrowotnego w Polsce — służy wyłącznie do leczenia podczas czasowych wyjazdów do państw UE/EFTA.",
    );
  }

  if (lifeIntents.includes("przeprowadzka")) {
    deduplicatedRequirements.push(
      "Tytuł prawny do lokalu (umowa najmu lub potwierdzenie z akademika) — potrzebny raz przy zameldowaniu",
    );
    missingInfo.push(`Nowy adres zamieszkania w mieście ${city} oraz dokument potwierdzający prawo do lokalu`);
    tasks.push({
      id: "task-meldunek",
      intent: "przeprowadzka",
      category: "obowiązek",
      title: `Zamelduj się lub zaktualizuj adres zamieszkania (${city}) i dane w urzędzie skarbowym`,
      purpose: "Spójny adres dla spraw lokalnych, korespondencji urzędowej i rozliczeń podatkowych (ZAP-3 / e-Urząd Skarbowy).",
      whyShown: `Wykryto przeprowadzkę do miasta ${city} — jeden zaktualizowany adres porządkuje urząd miasta i urząd skarbowy.`,
      institution: `Urząd Miasta (${city}) · Krajowa Administracja Skarbowa`,
      dependencies: ["Posiadanie umowy najmu, zgody właściciela lub skierowania do akademika"],
      requiredData: ["Dane z mDowodu (użyte raz)", "Nowy adres zamieszkania", "Tytuł prawny do lokalu"],
      missingInfo: startJourneyDone ? [] : ["Brak nowego adresu oraz dokumentu prawa do lokalu"],
      status: startJourneyDone ? "gotowe" : "wymaga danych",
      officialUrl: "https://www.gov.pl/web/gov/zamelduj-sie-na-pobyt-czasowy-dla-obywateli-polskich",
      officialLabel: "gov.pl — Zamelduj się na pobyt czasowy",
      serviceId: "mdowod",
      targetView: "zdarzenie",
      targetId: "start-krakow",
      kind: "task",
      autoCompleteWhen: { type: "journey_done", journeyId: "start-krakow" },
    });
  }

  if (lifeIntents.includes("studia") || lifeIntents.includes("przeprowadzka")) {
    missingInfo.push("Informacja o dochodzie na osobę w rodzinie (jeśli rozważasz stypendium socjalne)");
    tasks.push({
      id: "task-mozliwe-wsparcie",
      intent: "wsparcie",
      category: "możliwość",
      title: under26
        ? "Sprawdź możliwe wsparcie: stypendium socjalne, ulgi studenckie i zasady PIT-0"
        : "Sprawdź możliwe wsparcie: stypendium socjalne, zapomoga lub ulgi lokalne",
      purpose: "Wstępne sprawdzenie programów wsparcia dla studentów lub nowych mieszkańców — bez wydawania decyzji.",
      whyShown: "Opcjonalna szansa na wsparcie finansowe przy starcie studiów i przeprowadzce; zależy od kryteriów uczelni i dochodu.",
      institution: "Uczelnia / samorząd lokalny / podatki.gov.pl (poza prototypem)",
      dependencies: ["Status studenta i udokumentowanie dochodu (dla stypendium socjalnego)"],
      blockedByTaskIds: lifeIntents.includes("studia") ? ["task-studia-status"] : undefined,
      requiredData: ["Status studenta", "Zaświadczenie o dochodach (z e-Urzędu Skarbowego)"],
      missingInfo: ["Brak danych o dochodzie — prototyp nie ocenia progu dochodowego"],
      status: "wymaga danych",
      officialUrl: "https://www.gov.pl/web/nauka/stypendia-i-wsparcie-dla-studentow",
      officialLabel: "gov.pl — Stypendia i wsparcie dla studentów",
      serviceId: "wsparcie",
      targetView: "wsparcie",
      kind: "potential_benefit",
    });
  }

  const labelMap: Record<string, string> = {
    studia: "Studia",
    "pierwsza-praca": "pierwsza praca",
    przeprowadzka: `przeprowadzka (${city})`,
  };
  const titleParts = lifeIntents.map((i) => labelMap[i]).filter(Boolean);
  const title =
    titleParts.length > 1
      ? `${titleParts.slice(0, -1).join(", ")} i ${titleParts[titleParts.length - 1]}`
      : `Plan: ${titleParts[0] ?? "Sytuacja życiowa"}`;

  return {
    id: buildPlanId(lifeIntents, `${city}-${persona.id}`),
    query,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    intents: lifeIntents,
    summary: `Zjednoczony plan dla ${lifeIntents.length} powiązanych zdarzeń życiowych. Wymagania powtarzające się w różnych urzędach zostały połączone w jedną listę.`,
    facts,
    interpretations,
    reusedData,
    deduplicatedRequirements,
    missingInfo,
    tasks,
    createdAt: new Date().toISOString(),
    personaId: persona.id,
  };
}

function findMatchingLetterForExplanation(query: string): LetterItem | null {
  const q = fold(query.trim());
  if (!q) return null;
  const asksExplain =
    q.includes("wyjasnij") ||
    q.includes("o co chodzi") ||
    q.includes("po ludzku") ||
    q.includes("co oznacza") ||
    q.includes("pismo") ||
    q.includes("kr/2026") ||
    q.includes("dowod rejestracyjny") ||
    q.includes("zebranie") ||
    q.includes("pit-37") ||
    q.includes("800");
  if (!asksExplain) return null;

  for (const letter of LETTERS) {
    const blob = fold(`${letter.subject} ${letter.from} ${letter.reference} ${letter.body.join(" ")}`);
    const tokens = q
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !["pismo", "wyjasnij", "ludzku", "chodzi", "oznacza"].includes(t));
    if (tokens.length > 0 && tokens.some((t) => blob.includes(t))) {
      return letter;
    }
  }
  if (q.includes("wyjasnij") || q.includes("po ludzku") || q.includes("pismo")) {
    return LETTERS[0] ?? null;
  }
  return null;
}

export function matchOrbit(query: string, unread: number): Dest[] {
  const q = fold(query.trim());
  if (!q) {
    const suggested = ["dowod", "pisma", "start-krakow", "zdrowie", "pojazdy-view", "bezp"];
    const base = suggested
      .map((id) => DESTINATIONS.find((d) => d.id === id))
      .filter((d): d is Dest => Boolean(d));
    if (unread > 0) {
      const inbox = DESTINATIONS.find((d) => d.id === "pisma");
      if (inbox) return [inbox, ...base.filter((d) => d.id !== "pisma")].slice(0, 6);
    }
    return base.slice(0, 6);
  }

  const tokens = q.split(/\s+/).filter((part) => part.length >= 2);
  const intents = detectIntents(q);

  const scored = DESTINATIONS.map((dest) => {
    const blob = fold([dest.title, dest.meta, ...dest.keys].join(" "));
    let score = 0;
    if (blob.includes(q)) score += 6;
    for (const part of tokens) {
      if (blob.includes(part)) score += 2;
    }
    if (intents.includes("studia") && dest.id === "start-krakow") score += 6;
    if (intents.includes("przeprowadzka") && dest.id === "start-krakow") score += 5;
    if (intents.includes("pierwsza-praca") && dest.id === "start-krakow") score += 5;
    if (intents.includes("utrata") && (dest.id === "pesel" || dest.id === "bezp")) score += 6;
    if (intents.includes("zdrowie") && dest.id === "zdrowie") score += 6;
    if (intents.includes("zaufana") && dest.id === "zaufana") score += 6;
    if (intents.includes("pojazd") && (dest.id === "pojazdy-view" || dest.id === "punkty-view" || dest.id === "stluczka-view")) score += 4;
    if (intents.includes("pisma") && dest.id === "pisma") score += 5;
    if (intents.includes("wsparcie") && dest.id === "wsparcie") score += 5;
    return { dest, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  const serviceHits: Dest[] = SERVICES.filter((service) => {
    const blob = fold(`${service.name} ${service.description} ${service.category} ${service.scopeNote}`);
    return blob.includes(q) || (tokens.length > 0 && tokens.some((part) => part.length >= 3 && blob.includes(part)));
  }).map((service) => ({
    id: `svc-${service.id}`,
    title: service.name,
    meta: service.description,
    glyph: service.glyph,
    view: service.view,
    selectedId: service.selectedId,
    keys: [],
  }));

  const docHits: Dest[] = DOCUMENTS.filter((doc) => {
    const blob = fold(`${doc.title} ${doc.kind} ${doc.series}`);
    return blob.includes(q) || (tokens.length > 0 && tokens.some((part) => part.length >= 3 && blob.includes(part)));
  }).map((doc) => ({
    id: `doc-${doc.id}`,
    title: doc.title,
    meta: `${doc.series} · ${doc.kind}`,
    glyph: doc.glyph,
    view: "dokument" as const,
    selectedId: doc.id,
    keys: [],
  }));

  const letterHits: Dest[] = LETTERS.filter((letter) => {
    const blob = fold(`${letter.subject} ${letter.from} ${letter.reference} ${letter.body.join(" ")}`);
    return blob.includes(q) || (tokens.length > 0 && tokens.some((part) => part.length >= 4 && blob.includes(part)));
  }).map((letter) => ({
    id: `letter-${letter.id}`,
    title: letter.subject,
    meta: `${letter.from} · ${letter.reference}`,
    glyph: "letter" as const,
    view: "pismo" as const,
    selectedId: letter.id,
    keys: [],
  }));

  const merged = [...scored.map((row) => row.dest), ...letterHits, ...docHits, ...serviceHits];
  const seen = new Set<string>();
  return merged
    .filter((item) => {
      const key = `${item.view}:${item.selectedId ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 7);
}

export function analyzeOrbitQuery(query: string, state: OneFlowPersisted): OrbitAnalysis {
  const intents = detectIntents(query);
  const actionPlan = buildActionPlan(query, intents, state);
  // Show letter explanation either standalone OR alongside a letter+vehicle coordinated plan
  const matchedLetter = findMatchingLetterForExplanation(query);
  const letterExplanation =
    !actionPlan || (intents.includes("pisma") && intents.includes("pojazd"))
      ? matchedLetter
      : null;

  const unread = LETTERS.filter(
    (l) => letterStatus(l, state.readIds, state.replies) === "wymaga odpowiedzi",
  ).length;

  const baseResults = matchOrbit(query, unread);

  const q = fold(query.trim());
  const caseHits: Dest[] = q
    ? selectDerivedCases(state)
        .filter((c) => {
          const blob = fold(`${c.title} ${c.office} ${c.summary}`);
          return blob.includes(q) || q.split(/\s+/).some((p) => p.length >= 4 && blob.includes(p));
        })
        .map((c) => ({
          id: `case-${c.id}`,
          title: c.title,
          meta: `Sprawa · ${c.status}`,
          glyph: "case" as const,
          view: "sprawa" as const,
          selectedId: c.id,
          keys: [],
        }))
    : [];

  const seen = new Set<string>();
  const results = [...caseHits, ...baseResults]
    .filter((item) => {
      const key = `${item.view}:${item.selectedId ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 7);

  const nextActions: OrbitNextAction[] = [];
  const priority = selectHomePriority(state);
  if (priority) {
    nextActions.push({
      id: `next-${priority.id}`,
      label: priority.title,
      meta: priority.kicker,
      view: priority.targetView,
      selectedId: priority.targetId,
      glyph: priority.kind === "letter" ? "letter" : "case",
    });
  }
  if (!state.reminders.some((r) => r.id === "skierowanie")) {
    nextActions.push({
      id: "next-ikp-skierowanie",
      label: "Skierowanie do kardiologa (mojeIKP)",
      meta: "Ustaw przypomnienie z datą i godziną",
      view: "zdrowie",
      selectedId: "skierowania",
      glyph: "health",
    });
  }
  if (!state.peselLocked) {
    nextActions.push({
      id: "next-pesel",
      label: "Zastrzeż PESEL — ochrona tożsamości",
      meta: "Zobacz jak działa zastrzeżenie w prototypie",
      view: "bezpieczenstwo",
      glyph: "key",
    });
  }

  return {
    query,
    intents,
    actionPlan,
    letterExplanation,
    nextActions: nextActions.slice(0, 3),
    results,
  };
}
