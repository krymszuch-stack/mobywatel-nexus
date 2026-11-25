import type { Motif } from "./types";
import type { GlyphName } from "@/components/nexus/glyph-paths";

export const CITIZEN = {
  given: "Zofia Helena",
  family: "Baran",
  vocative: "Zofio",
  pesel: "85031411247",
  birth: "1985-03-14",
  birthPlace: "Kraków",
  address: "ul. Cicha Polana 9 m. 4",
  city: "30-698 Kraków",
  child: "Maja Baran",
  childBirth: "2019-06-02",
};

export type DocStatus = "aktywny" | "wygasa" | "utrata";

export type DocumentItem = {
  id: string;
  title: string;
  kind: string;
  series: string;
  issued: string;
  expires?: string;
  issuer: string;
  glyph: GlyphName;
  motif: Motif;
  fields: { label: string; value: string }[];
};

export const DOCUMENTS: DocumentItem[] = [
  {
    id: "dowod",
    title: "mDowód",
    kind: "Dokument tożsamości",
    series: "NXS 482913",
    issued: "2022-08-12",
    expires: "2032-08-12",
    issuer: "Urząd Miasta Krakowa",
    glyph: "identity",
    motif: "rosette",
    fields: [
      { label: "Imiona i nazwisko", value: "Zofia Helena Baran" },
      { label: "PESEL", value: "85031411247" },
      { label: "Data urodzenia", value: "14 marca 1985" },
      { label: "Miejsce urodzenia", value: "Kraków" },
      { label: "Adres", value: "ul. Cicha Polana 9 m. 4, 30-698 Kraków" },
      { label: "Seria i numer", value: "NXS 482913" },
    ],
  },
  {
    id: "prawojazdy",
    title: "mPrawo jazdy",
    kind: "Twoje uprawnienia",
    series: "BNX 850314",
    issued: "2021-04-02",
    expires: "2035-03-14",
    issuer: "Urząd Miasta Krakowa",
    glyph: "vehicle",
    motif: "lattice",
    fields: [
      { label: "Posiadacz", value: "Zofia Helena Baran" },
      { label: "Numer", value: "BNX 850314" },
      { label: "Kategorie", value: "B" },
      { label: "Ważne do", value: "14 marca 2035" },
    ],
  },
  {
    id: "paszport",
    title: "Paszport",
    kind: "Podróż",
    series: "NX 184220",
    issued: "2017-04-14",
    expires: "2027-04-14",
    issuer: "Wojewoda Małopolski — wzór",
    glyph: "passport",
    motif: "fan",
    fields: [
      { label: "Imiona i nazwisko", value: "Zofia Helena Baran" },
      { label: "Numer", value: "NX 184220" },
      { label: "Obywatelstwo", value: "polskie" },
      { label: "Ważny do", value: "14 kwietnia 2027" },
    ],
  },
  {
    id: "ekuz",
    title: "Karta ubezpieczenia",
    kind: "Zdrowie",
    series: "EKUZ-NX-44821",
    issued: "2025-01-08",
    expires: "2027-12-31",
    issuer: "Narodowy Fundusz Zdrowia — wzór",
    glyph: "health",
    motif: "lab",
    fields: [
      { label: "Ubezpieczona", value: "Zofia Helena Baran" },
      { label: "Numer karty", value: "EKUZ-NX-44821" },
      { label: "Uprawnienie", value: "ubezpieczenie zdrowotne" },
      { label: "Ważna do", value: "31 grudnia 2027" },
    ],
  },
];

export type LetterItem = {
  id: string;
  from: string;
  office: string;
  subject: string;
  date: string;
  needsReply: boolean;
  motif: Motif;
  body: string[];
};

export const LETTERS: LetterItem[] = [
  {
    id: "komunikacja",
    from: "Urząd Miasta Krakowa",
    office: "Wydział Komunikacji",
    subject: "Uzupełnij wniosek o dowód rejestracyjny",
    date: "2026-11-20",
    needsReply: true,
    motif: "manuscript",
    body: [
      "Dzień dobry,",
      "w sprawie pojazdu KR NX851 brakuje aktualnego badania technicznego. Bez tego dokumentu nie dokończymy wymiany dowodu rejestracyjnego.",
      "Prosimy o odpowiedź w aplikacji albo wizytę w wydziale do 18 grudnia 2026. Jeżeli ten termin jest za krótki, napisz — zaproponujemy inny.",
      "Sprawa ma numer KR/2026/4412.",
    ],
  },
  {
    id: "zus800",
    from: "Zakład Ubezpieczeń Społecznych",
    office: "Świadczenia rodzinne",
    subject: "Przyznano świadczenie wychowawcze",
    date: "2026-11-12",
    needsReply: false,
    motif: "orbits",
    body: [
      "Przyznaliśmy świadczenie wychowawcze na Maję Baran.",
      "Kwota 800 zł będzie wpływać do 15. dnia każdego miesiąca, począwszy od grudnia 2026.",
      "Nie musisz nic robić, chyba że zmienią się dane dziecka albo rachunek do wypłaty.",
      "Znak pisma: DS-800-2026-11847.",
    ],
  },
  {
    id: "pit",
    from: "Urząd Skarbowy Kraków-Śródmieście",
    office: "Podatki dochodowe",
    subject: "Przyjęto zeznanie PIT-37 za 2025",
    date: "2026-11-02",
    needsReply: false,
    motif: "lattice",
    body: [
      "Przyjęliśmy zeznanie PIT-37 za rok 2025.",
      "Nie wykazaliśmy dopłaty ani zwrotu. Ulga na dziecko została uwzględniona.",
      "Numer referencyjny: US-KRA-2026-33018.",
    ],
  },
  {
    id: "szkola",
    from: "Szkoła Podstawowa nr 48",
    office: "Sekretariat",
    subject: "Zebranie rodziców klasy 1b",
    date: "2026-11-18",
    needsReply: true,
    motif: "staff",
    body: [
      "Zapraszamy na zebranie rodziców klasy 1b.",
      "2 grudnia 2026, godzina 17:00, sala 12.",
      "Potwierdź obecność albo nieobecność krótką odpowiedzią. Jeżeli nie możesz przyjść, wychowawczyni prześle notatkę.",
    ],
  },
];

export type CaseItem = {
  id: string;
  title: string;
  office: string;
  status: "w toku" | "przyznana" | "zakończona";
  updated: string;
  summary: string;
  steps: { label: string; state: "done" | "now" | "next" }[];
  journeyId?: string;
};

export const CASES: CaseItem[] = [
  {
    id: "rejestracja",
    title: "Wymiana dowodu rejestracyjnego",
    office: "Urząd Miasta Krakowa",
    status: "w toku",
    updated: "2026-11-20",
    summary: "Czekamy na badanie techniczne pojazdu KR NX851. Bez niego wniosek stoi w miejscu.",
    journeyId: "pojazd",
    steps: [
      { label: "Wniosek przyjęty", state: "done" },
      { label: "Brak badania technicznego", state: "now" },
      { label: "Odbiór dokumentu", state: "next" },
    ],
  },
  {
    id: "osiemset",
    title: "Świadczenie wychowawcze",
    office: "ZUS",
    status: "przyznana",
    updated: "2026-11-12",
    summary: "Decyzja przyznająca na Maję Baran. Najbliższa wypłata 15 grudnia 2026.",
    steps: [
      { label: "Wniosek", state: "done" },
      { label: "Decyzja", state: "done" },
      { label: "Wypłata", state: "now" },
    ],
  },
  {
    id: "meldunek",
    title: "Potwierdzenie adresu",
    office: "Urząd Miasta Krakowa",
    status: "zakończona",
    updated: "2026-06-03",
    summary: "Adres ul. Cicha Polana 9 m. 4 jest zgodny z rejestrem. Nie trzeba nic poprawiać.",
    steps: [
      { label: "Zgłoszenie", state: "done" },
      { label: "Sprawdzenie", state: "done" },
      { label: "Zamknięcie", state: "done" },
    ],
  },
];

export type Journey = {
  id: string;
  title: string;
  lede: string;
  glyph: GlyphName;
  motif: Motif;
  steps: {
    id: string;
    title: string;
    body: string;
    options?: { id: string; label: string; meta?: string }[];
  }[];
};

export const JOURNEYS: Journey[] = [
  {
    id: "pojazd",
    title: "Dowód rejestracyjny",
    lede: "Dokończ wymianę dokumentu pojazdu KR NX851. To wzór ścieżki — nic nie trafia do urzędu.",
    glyph: "vehicle",
    motif: "civic",
    steps: [
      {
        id: "dane",
        title: "Dane pojazdu",
        body: "Samochód osobowy, numer rejestracyjny KR NX851. Wniosek KR/2026/4412 czeka na badanie techniczne nie starsze niż 30 dni.",
      },
      {
        id: "wydzial",
        title: "Gdzie załatwisz odbiór",
        body: "Wybierz punkt. Godziny są przykładowe.",
        options: [
          { id: "centralny", label: "Wydział Komunikacji", meta: "ul. Centralna 12 · wt.–czw. 8:00–16:00" },
          { id: "nadbrzeze", label: "Punkt przy Nadbrzeżu", meta: "ul. Nadbrzeżna 3 · pon. i pt. 9:00–15:00" },
        ],
      },
      {
        id: "termin",
        title: "Termin",
        body: "Wybierz dzień. W prawdziwej usłudze termin byłby rezerwowany. Tutaj zostaje tylko w prototypie.",
        options: [
          { id: "d2", label: "2 grudnia 2026", meta: "10:20" },
          { id: "d9", label: "9 grudnia 2026", meta: "12:40" },
          { id: "d16", label: "16 grudnia 2026", meta: "8:50" },
        ],
      },
      {
        id: "koniec",
        title: "Potwierdzenie",
        body: "Sprawdź wybór i zapisz go na tym urządzeniu. Nikt nie dostanie wiadomości.",
      },
    ],
  },
  {
    id: "szkola",
    title: "Dziecko w szkole",
    lede: "Zebranie klasy 1b i krótkie potwierdzenie obecności.",
    glyph: "school",
    motif: "staff",
    steps: [
      {
        id: "info",
        title: "Zebranie",
        body: "Szkoła Podstawowa nr 48, klasa 1b, 2 grudnia 2026 o 17:00, sala 12. Maja Baran jest uczennicą tej klasy w danych prototypu.",
      },
      {
        id: "obecnosc",
        title: "Czy będziesz",
        body: "Odpowiedź zostaje w szkicu na telefonie.",
        options: [
          { id: "tak", label: "Będę", meta: "Poproś o miejsce z brzegu, jeśli potrzebujesz" },
          { id: "nie", label: "Nie dam rady", meta: "Szkoła przyśle notatkę po zebraniu" },
        ],
      },
      {
        id: "koniec",
        title: "Zapis odpowiedzi",
        body: "Potwierdź. W prawdziwej usłudze sekretariat dostałby wiadomość. Tutaj zobaczysz tylko potwierdzenie w aplikacji.",
      },
    ],
  },
  {
    id: "paszport",
    title: "Paszport traci ważność",
    lede: "Dokument NX 184220 jest ważny do 14 kwietnia 2027. Warto zaplanować wymianę wcześniej.",
    glyph: "passport",
    motif: "fan",
    steps: [
      {
        id: "stan",
        title: "Co wygasa",
        body: "Paszport jest jeszcze ważny. Część państw wymaga, żeby dokument był ważny co najmniej 3 miesiące po powrocie.",
      },
      {
        id: "przygotuj",
        title: "Co zwykle potrzebne",
        body: "Zdjęcie, dotychczasowy paszport i opłata. W tym prototypie nie zbieramy zdjęcia ani płatności.",
      },
      {
        id: "koniec",
        title: "Przypomnienie",
        body: "Możesz zostawić przypomnienie w aplikacji. Nie dodamy go do kalendarza telefonu.",
      },
    ],
  },
];

export type Benefit = {
  id: string;
  title: string;
  amount?: string;
  state: "przysługuje" | "warto sprawdzić" | "nie widzimy podstaw";
  detail: string;
  expires?: string;
};

export const BENEFITS: Benefit[] = [
  {
    id: "800",
    title: "Świadczenie wychowawcze",
    amount: "800 zł",
    state: "przysługuje",
    detail: "Na Maję Baran. Najbliższa wypłata 15 grudnia 2026. Decyzja DS-800-2026-11847.",
    expires: "2026-12-15",
  },
  {
    id: "ulga",
    title: "Ulga na dziecko",
    state: "przysługuje",
    detail: "Uwzględniona w przyjętym zeznaniu PIT-37 za 2025. Nie ma dopłaty ani zwrotu.",
  },
  {
    id: "obiad",
    title: "Dofinansowanie obiadów w szkole",
    state: "warto sprawdzić",
    detail:
      "Szkoła prowadzi taki program. Z danych prototypu nie wynika, czy spełniasz próg dochodu. Możesz zostawić pytanie — nie wyślemy go.",
  },
  {
    id: "kdr",
    title: "Karta Dużej Rodziny",
    state: "nie widzimy podstaw",
    detail: "W danych jest jedno dziecko. Karta zwykle dotyczy rodzin z co najmniej trojgiem dzieci. To nie jest odmowa urzędu, tylko podpowiedź prototypu.",
  },
];

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  meta: string;
  glyph: GlyphName;
};

export const TIMELINE: TimelineEvent[] = [
  { id: "t1", date: "2026-11-20", title: "Pismo z wydziału komunikacji", meta: "Sprawa KR/2026/4412", glyph: "letter" },
  { id: "t2", date: "2026-11-18", title: "Zaproszenie na zebranie", meta: "Szkoła Podstawowa nr 48", glyph: "school" },
  { id: "t3", date: "2026-11-12", title: "Decyzja o 800 zł", meta: "ZUS · Maja Baran", glyph: "support" },
  { id: "t4", date: "2026-11-02", title: "Przyjęto PIT-37", meta: "Urząd Skarbowy Kraków-Śródmieście", glyph: "institution" },
  { id: "t5", date: "2026-06-03", title: "Potwierdzono adres", meta: "ul. Cicha Polana 9 m. 4", glyph: "housing" },
  { id: "t6", date: "2025-01-08", title: "Wydano kartę ubezpieczenia", meta: "ważna do końca 2027", glyph: "health" },
  { id: "t7", date: "2022-08-12", title: "Wydano dowód osobisty", meta: "seria NXS 482913", glyph: "identity" },
];

export type AccessEvent = {
  id: string;
  at: string;
  who: string;
  what: string;
  why: string;
};

export const ACCESS: AccessEvent[] = [
  {
    id: "a1",
    at: "24 listopada 2026, 19:42",
    who: "Zofia Baran",
    what: "Podgląd dowodu osobistego",
    why: "Urządzenie „Telefon domowy”",
  },
  {
    id: "a2",
    at: "20 listopada 2026, 08:11",
    who: "Urząd Miasta Krakowa",
    what: "Dane pojazdu KR NX851",
    why: "Sprawa KR/2026/4412",
  },
  {
    id: "a3",
    at: "12 listopada 2026, 11:05",
    who: "ZUS",
    what: "Dane dziecka i rachunek do wypłaty",
    why: "Świadczenie wychowawcze",
  },
  {
    id: "a4",
    at: "2 listopada 2026, 14:20",
    who: "Przychodnia Salwator — wzór",
    what: "Potwierdzenie ubezpieczenia",
    why: "Wizyta pediatryczna Mai",
  },
  {
    id: "a5",
    at: "3 czerwca 2026, 09:16",
    who: "Urząd Miasta Krakowa",
    what: "Adres zamieszkania",
    why: "Potwierdzenie meldunku",
  },
];

export const TRUSTED = {
  name: "Marek Julian Baran",
  relation: "mąż",
  phone: "600 000 148",
  note: "Może odebrać pismo i potwierdzić odbiór dokumentu w twoim imieniu. Nie widzi treści odpowiedzi, dopóki sama tego nie włączysz.",
};

export const DEVICE = {
  name: "Telefon domowy",
  place: "Kraków",
  since: "ostatnie wejście dzisiaj",
};

export const ALARMS = [
  { id: "112", name: "112", meta: "Numer alarmowy", href: "tel:112" },
  { id: "999", name: "999", meta: "Pogotowie", href: "tel:999" },
  { id: "998", name: "998", meta: "Straż pożarna", href: "tel:998" },
  { id: "997", name: "997", meta: "Policja", href: "tel:997" },
];

export type Dest = {
  id: string;
  title: string;
  meta: string;
  glyph: GlyphName;
  view: import("./types").ViewId;
  selectedId?: string;
  keys: string[];
};

export const DESTINATIONS: Dest[] = [
  { id: "start", title: "Start", meta: "Ekran główny", glyph: "start", view: "start", keys: ["start", "pulpit", "home", "glowny"] },
  { id: "dokumenty", title: "Dokumenty", meta: "Portfel wzorów", glyph: "documents", view: "dokumenty", keys: ["dokument", "portfel", "dowod", "paszport", "prawo jazdy"] },
  { id: "dowod", title: "mDowód", meta: "Pokaż dokument tożsamości", glyph: "identity", view: "dokument", selectedId: "dowod", keys: ["mdowod", "dowod", "tozsamosc", "pokaz dowod"] },
  { id: "prawo", title: "mPrawo jazdy", meta: "Twoje uprawnienia", glyph: "vehicle", view: "dokument", selectedId: "prawojazdy", keys: ["prawo jazdy", "mprawo", "kategoria b"] },
  { id: "zdrowie", title: "mojeIKP", meta: "Recepty, skierowania, wizyty", glyph: "health", view: "zdrowie", keys: ["ikp", "zdrowie", "recepta", "skierowanie", "wizyta", "nfz"] },
  { id: "kierowca", title: "Pojazdy i uprawnienia", meta: "Pojazdy, punkty, mStłuczka", glyph: "vehicle", view: "kierowca", keys: ["pojazd", "pojazdy", "punkty karne", "stluczka", "mstluczka"] },
  { id: "uslugi", title: "Usługi", meta: "Wszystko w jednym miejscu", glyph: "institution", view: "uslugi", keys: ["uslugi", "katalog", "wszystkie uslugi"] },
  { id: "profil", title: "Profil", meta: "Wygląd, dane, osoba zaufana", glyph: "trusted", view: "profil", keys: ["profil", "konto", "ustawienia"] },
  { id: "pesel", title: "Zastrzeż PESEL", meta: "Ochrona numeru — wzór", glyph: "key", view: "bezpieczenstwo", keys: ["pesel", "zastrzez", "kradziez tozsamosci"] },
  { id: "paszport-doc", title: "Paszport", meta: "wygasa 14 kwietnia 2027", glyph: "passport", view: "dokument", selectedId: "paszport", keys: ["paszport", "podroz"] },
  { id: "pisma", title: "Moje pisma", meta: "Skrzynka urzędowa", glyph: "letter", view: "pisma", keys: ["pismo", "pisma", "list", "skrzynka", "korespondencja", "wiadomosc"] },
  { id: "sprawy", title: "Sprawy", meta: "To, co jest w toku", glyph: "case", view: "sprawy", keys: ["sprawa", "sprawy", "wniosek"] },
  { id: "zalatw", title: "Załatw sprawę", meta: "Ścieżki życiowe", glyph: "institution", view: "zalatw", keys: ["zalatw", "usluga", "sciezka", "urzad"] },
  { id: "pojazd", title: "Dowód rejestracyjny", meta: "Ścieżka pojazdu", glyph: "vehicle", view: "zdarzenie", selectedId: "pojazd", keys: ["rejestracyjny", "pojazd", "samochod", "kr nx"] },
  { id: "wsparcie", title: "Możliwe wsparcie", meta: "Świadczenia i podpowiedzi", glyph: "support", view: "wsparcie", keys: ["swiadczenie", "wsparcie", "800", "zasilek", "benefit", "ulga"] },
  { id: "os", title: "Oś czasu", meta: "Co działo się w sprawach", glyph: "timeline", view: "os", keys: ["os czasu", "historia", "kalendarz", "termin"] },
  { id: "bezp", title: "Bezpieczeństwo", meta: "Utrata dokumentu i alarm", glyph: "shield", view: "bezpieczenstwo", keys: ["bezpieczenstwo", "112", "alarm", "utrata", "kradziez"] },
  { id: "dostep", title: "Kto widział dane", meta: "Historia wglądu", glyph: "eye", view: "dostepy", keys: ["dostep", "wglad", "kto widzial", "prywatnosc"] },
  { id: "zaufana", title: "Osoba zaufana", meta: "Marek Baran", glyph: "trusted", view: "zaufana", keys: ["osoba zaufana", "pelnomocnik", "maz", "zaufana"] },
  { id: "wyglad", title: "Wygląd i dostępność", meta: "Motyw, tekst, ruch", glyph: "sliders", view: "wyglad", keys: ["motyw", "wyglad", "kontrast", "czcionka", "dostepnosc", "ciemny", "porcelana"] },
];
