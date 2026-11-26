import type { Motif, ViewId } from "./types";
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
  scopeWarning?: string;
  relatedServiceId?: string;
  relatedCaseIds?: string[];
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
    relatedServiceId: "mdowod",
    relatedCaseIds: ["meldunek"],
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
    kind: "Twoje uprawnienia kierowcy",
    series: "BNX 850314",
    issued: "2021-04-02",
    expires: "2035-03-14",
    issuer: "Urząd Miasta Krakowa",
    glyph: "wheel",
    motif: "lattice",
    relatedServiceId: "prawo",
    relatedCaseIds: ["rejestracja"],
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
    relatedServiceId: "zalatw",
    fields: [
      { label: "Imiona i nazwisko", value: "Zofia Helena Baran" },
      { label: "Numer", value: "NX 184220" },
      { label: "Obywatelstwo", value: "polskie" },
      { label: "Ważny do", value: "14 kwietnia 2027" },
    ],
  },
  {
    id: "ekuz",
    title: "Karta EKUZ",
    kind: "Zdrowie — wyjazdy UE/EFTA",
    series: "EKUZ-NX-44821",
    issued: "2025-01-08",
    expires: "2027-12-31",
    issuer: "Narodowy Fundusz Zdrowia — wzór",
    glyph: "health",
    motif: "lab",
    scopeWarning:
      "Karta EKUZ potwierdza prawo do niezbędnego leczenia podczas pobytu w krajach UE/EFTA. Nie jest potwierdzeniem ubezpieczenia zdrowotnego w Polsce — w kraju status potwierdzają systemy eWUŚ, NFZ i ZUS.",
    relatedServiceId: "ikp",
    fields: [
      { label: "Ubezpieczona", value: "Zofia Helena Baran" },
      { label: "Numer karty", value: "EKUZ-NX-44821" },
      { label: "Zakres", value: "wyjazdy czasowe UE/EFTA (nie zastępuje eWUŚ w kraju)" },
      { label: "Ważna do", value: "31 grudnia 2027" },
    ],
  },
];

export type LetterPlainSummary = {
  whatItMeans: string;
  facts: string[];
  ambiguities: string[];
  requiredItems: string[];
  sourceExcerpt: string;
  suggestedDraft?: string;
};

export type LetterItem = {
  id: string;
  from: string;
  office: string;
  subject: string;
  date: string;
  reference: string;
  needsReply: boolean;
  motif: Motif;
  relatedCaseId?: string;
  relatedServiceId?: string;
  relatedDocIds?: string[];
  deadlineNote?: string;
  body: string[];
  plain: LetterPlainSummary;
};

export const LETTERS: LetterItem[] = [
  {
    id: "komunikacja",
    from: "Urząd Miasta Krakowa",
    office: "Wydział Komunikacji",
    subject: "Uzupełnij wniosek o dowód rejestracyjny",
    date: "2026-11-20",
    reference: "KR/2026/4412",
    needsReply: true,
    motif: "manuscript",
    relatedCaseId: "rejestracja",
    relatedServiceId: "pojazdy",
    relatedDocIds: ["prawojazdy", "dowod"],
    deadlineNote: "W treści pisma podano datę 18 grudnia 2026",
    body: [
      "Dzień dobry,",
      "w sprawie pojazdu KR NX851 brakuje aktualnego badania technicznego. Bez tego dokumentu nie dokończymy wymiany dowodu rejestracyjnego.",
      "Prosimy o odpowiedź w aplikacji albo wizytę w wydziale do 18 grudnia 2026. Jeżeli ten termin jest za krótki, napisz — zaproponujemy inny.",
      "Sprawa ma numer KR/2026/4412.",
    ],
    plain: {
      whatItMeans:
        "Urząd wstrzymał wymianę dowodu rejestracyjnego dla pojazdu KR NX851, ponieważ potrzebuje potwierdzenia aktualnego badania technicznego.",
      facts: [
        "Dotyczy pojazdu KR NX851 i sprawy KR/2026/4412.",
        "Pismo wskazuje datę 18 grudnia 2026 na odpowiedź lub wizytę.",
        "Urząd dopuszcza prośbę o inny termin, jeśli podana data nie wystarczy.",
      ],
      ambiguities: [
        "Pismo nie określa dokładnego formatu załącznika ani konsekwencji prawnych po 18 grudnia — nie wyliczamy terminu urzędowego za urząd.",
        "W tym prototypie odpowiedź jest symulacją lokalną i nie zastępuje złożenia dokumentu w urzędzie.",
      ],
      requiredItems: [
        "Zaświadczenie o aktualnym badaniu technicznym pojazdu KR NX851 (do okazania w realnym urzędzie).",
        "Numer sprawy KR/2026/4412 w treści odpowiedzi.",
      ],
      sourceExcerpt:
        "„w sprawie pojazdu KR NX851 brakuje aktualnego badania technicznego. Prosimy o odpowiedź w aplikacji albo wizytę w wydziale do 18 grudnia 2026.”",
      suggestedDraft:
        "Dotyczy sprawy KR/2026/4412 (pojazd KR NX851). Potwierdzam otrzymanie wezwania. Dostarczę aktualne badanie techniczne przed 18 grudnia 2026 lub proszę o wyznaczenie terminu wizyty.",
    },
  },
  {
    id: "zus800",
    from: "Zakład Ubezpieczeń Społecznych",
    office: "Świadczenia rodzinne",
    subject: "Przyznano świadczenie wychowawcze",
    date: "2026-11-12",
    reference: "DS-800-2026-11847",
    needsReply: false,
    motif: "orbits",
    relatedCaseId: "osiemset",
    relatedServiceId: "wsparcie",
    body: [
      "Przyznaliśmy świadczenie wychowawcze na Maję Baran.",
      "Kwota 800 zł będzie wpływać do 15. dnia każdego miesiąca, począwszy od grudnia 2026.",
      "Nie musisz nic robić, chyba że zmienią się dane dziecka albo rachunek do wypłaty.",
      "Znak pisma: DS-800-2026-11847.",
    ],
    plain: {
      whatItMeans:
        "Informacja o przyznaniu świadczenia 800 zł na Maję Baran. Nie wymaga odpowiedzi, jeśli dane są aktualne.",
      facts: [
        "Znak pisma: DS-800-2026-11847.",
        "Wskazany dzień wypłaty: do 15. dnia miesiąca od grudnia 2026.",
      ],
      ambiguities: [
        "Zmiany rachunku bankowego lub danych dziecka wymagają osobnego zgłoszenia w oficjalnym PUE/eZUS.",
      ],
      requiredItems: ["Brak wymaganych działań, o ile dane dziecka i rachunek się nie zmieniły."],
      sourceExcerpt:
        "„Kwota 800 zł będzie wpływać do 15. dnia każdego miesiąca, począwszy od grudnia 2026. Nie musisz nic robić...”",
    },
  },
  {
    id: "pit",
    from: "Urząd Skarbowy Kraków-Śródmieście",
    office: "Podatki dochodowe",
    subject: "Przyjęto zeznanie PIT-37 za 2025",
    date: "2026-11-02",
    reference: "US-KRA-2026-33018",
    needsReply: false,
    motif: "lattice",
    relatedServiceId: "podatki",
    body: [
      "Przyjęliśmy zeznanie PIT-37 za rok 2025.",
      "Nie wykazaliśmy dopłaty ani zwrotu. Ulga na dziecko została uwzględniona.",
      "Numer referencyjny: US-KRA-2026-33018.",
    ],
    plain: {
      whatItMeans: "Potwierdzenie przyjęcia zeznania rocznego PIT-37 za 2025 bez dopłaty i bez zwrotu.",
      facts: [
        "Numer referencyjny: US-KRA-2026-33018.",
        "Ulga na dziecko została uwzględniona w rozliczeniu ze wzoru.",
      ],
      ambiguities: [
        "Pełna historia rozliczeń i ewentualne korekty są dostępne wyłącznie w oficjalnym e-Urzędzie Skarbowym.",
      ],
      requiredItems: ["Brak działań — zachowaj numer referencyjny do wglądu."],
      sourceExcerpt: "„Przyjęliśmy zeznanie PIT-37 za rok 2025. Nie wykazaliśmy dopłaty ani zwrotu.”",
    },
  },
  {
    id: "szkola",
    from: "Szkoła Podstawowa nr 48",
    office: "Sekretariat",
    subject: "Zebranie rodziców klasy 1b",
    date: "2026-11-18",
    reference: "SP48/1B/2026",
    needsReply: true,
    motif: "staff",
    relatedCaseId: "zebranie-szkola",
    relatedServiceId: "zalatw",
    deadlineNote: "Zebranie 2 grudnia 2026, godz. 17:00",
    body: [
      "Zapraszamy na zebranie rodziców klasy 1b.",
      "2 grudnia 2026, godzina 17:00, sala 12.",
      "Potwierdź obecność albo nieobecność krótką odpowiedzią. Jeżeli nie możesz przyjść, wychowawczyni prześle notatkę.",
    ],
    plain: {
      whatItMeans: "Szkoła prosi o krótką informację, czy przyjdziesz na zebranie klasy 1b.",
      facts: [
        "Termin wskazany w zaproszeniu: 2 grudnia 2026, godz. 17:00, sala 12.",
        "W razie nieobecności wychowawczyni deklaruje przesłanie notatki.",
      ],
      ambiguities: [
        "Pismo nie podaje dokładnej godziny końcowej na wysłanie potwierdzenia — warto odpowiedzieć przed dniem zebrania.",
      ],
      requiredItems: ["Krótka odpowiedź: obecność albo nieobecność."],
      sourceExcerpt:
        "„2 grudnia 2026, godzina 17:00, sala 12. Potwierdź obecność albo nieobecność krótką odpowiedzią.”",
      suggestedDraft: "Potwierdzam obecność na zebraniu rodziców klasy 1b w dniu 2 grudnia 2026 o godz. 17:00.",
    },
  },
];

export type CaseItem = {
  id: string;
  title: string;
  office: string;
  status: "w toku" | "przyznana" | "zakończona" | "odpowiedź zapisana (wzór)";
  updated: string;
  summary: string;
  steps: { label: string; state: "done" | "now" | "next" }[];
  journeyId?: string;
  relatedLetterIds?: string[];
  relatedDocIds?: string[];
  relatedServiceId?: string;
  dependencies?: string[];
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
    relatedLetterIds: ["komunikacja"],
    relatedDocIds: ["prawojazdy", "dowod"],
    relatedServiceId: "pojazdy",
    dependencies: [
      "Odpowiedź na pismo KR/2026/4412 z Wydziału Komunikacji",
      "Wybór punktu odbioru i terminu w ścieżce pojazdu",
    ],
    steps: [
      { label: "Wniosek przyjęty", state: "done" },
      { label: "Brak badania technicznego (pismo KR/2026/4412)", state: "now" },
      { label: "Odbiór dokumentu w wydziale", state: "next" },
    ],
  },
  {
    id: "osiemset",
    title: "Świadczenie wychowawcze",
    office: "ZUS",
    status: "przyznana",
    updated: "2026-11-12",
    summary: "Decyzja przyznająca na Maję Baran. Najbliższa wypłata 15 grudnia 2026.",
    relatedLetterIds: ["zus800"],
    relatedServiceId: "wsparcie",
    steps: [
      { label: "Wniosek", state: "done" },
      { label: "Decyzja DS-800-2026-11847", state: "done" },
      { label: "Wypłata od grudnia 2026", state: "now" },
    ],
  },
  {
    id: "meldunek",
    title: "Potwierdzenie adresu",
    office: "Urząd Miasta Krakowa",
    status: "zakończona",
    updated: "2026-06-03",
    summary: "Adres ul. Cicha Polana 9 m. 4 jest zgodny z rejestrem. Nie trzeba nic poprawiać.",
    relatedDocIds: ["dowod"],
    relatedServiceId: "mdowod",
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
  caseId: string;
  office: string;
  relatedServiceId: string;
  relatedLetterId?: string;
  relatedDocIds?: string[];
  dependencies?: string[];
  steps: {
    id: string;
    title: string;
    body: string;
    options?: { id: string; label: string; meta?: string }[];
  }[];
};

export const JOURNEYS: Journey[] = [
  {
    id: "start-krakow",
    title: "Studia, pierwsza praca i przeprowadzka",
    lede: "Jeden wspólny plan dla trzech zmian naraz: uczelnia, zatrudnienie i nowy adres. Dane z mDowodu wpisujesz raz.",
    glyph: "education",
    motif: "orbits",
    caseId: "plan-start-krakow",
    office: "Uczelnia · ZUS · Urząd Miasta Krakowa",
    relatedServiceId: "zalatw",
    relatedDocIds: ["dowod", "ekuz"],
    dependencies: [
      "Dane z mDowodu używane raz we wszystkich krokach (bez powielania formularzy)",
      "Ubezpieczenie zdrowotne zależy od rodzaju umowy w pierwszej pracy",
    ],
    steps: [
      {
        id: "dane-wspolne",
        title: "Wspólne dane z mDowodu (raz dla trzech spraw)",
        body: "W prototypie ponownie wykorzystujemy fikcyjne dane Zofii Heleny Baran (PESEL 85031411247, Kraków), żeby nie wypełniać ich osobno na uczelni, u pracodawcy i w urzędzie miasta.",
      },
      {
        id: "umowa",
        title: "Forma pierwszej pracy",
        body: "Od rodzaju umowy zależy zgłoszenie do ZUS (ZUA/ZZA) i tytuł do ubezpieczenia zdrowotnego.",
        options: [
          { id: "uop", label: "Umowa o pracę", meta: "Pracodawca zgłasza do ZUS; sprawdź PIT-2" },
          { id: "zlecenie", label: "Umowa zlecenie", meta: "Zasady składek zależą m.in. od statusu studenta i wieku" },
          { id: "nie-wiem", label: "Jeszcze nie wiem", meta: "Zapiszemy brakującą informację do uzupełnienia później" },
        ],
      },
      {
        id: "lokal",
        title: "Tytuł prawny do mieszkania w Krakowie",
        body: "Do zameldowania czasowego lub stałego w urzędzie potrzebny jest dokument potwierdzający prawo do lokalu.",
        options: [
          { id: "najem", label: "Mam umowę najmu", meta: "Przygotuj umowę do okazania przy meldunku na gov.pl" },
          { id: "akademik", label: "Dom studencki / akademik", meta: "Potwierdzenie wydaje administracja akademika" },
          { id: "brak", label: "Jeszcze bez umowy", meta: "Meldunek odłożymy jako zadanie zależne od umowy" },
        ],
      },
      {
        id: "koniec",
        title: "Zapisz wspólny plan jako sprawę",
        body: "Zapiszesz plan zadań, zależności i możliwe wsparcie do sprawdzenia w „Moich sprawach” oraz na osi czasu. Prototyp nie wysyła wniosków ani nie przyznaje świadczeń.",
      },
    ],
  },
  {
    id: "pojazd",
    title: "Dowód rejestracyjny",
    lede: "Dokończ wymianę dokumentu pojazdu KR NX851. To wzór ścieżki — nic nie trafia do urzędu.",
    glyph: "vehicle",
    motif: "civic",
    caseId: "rejestracja",
    office: "Urząd Miasta Krakowa",
    relatedServiceId: "pojazdy",
    relatedLetterId: "komunikacja",
    relatedDocIds: ["prawojazdy", "dowod"],
    dependencies: ["Aktualne badanie techniczne pojazdu KR NX851", "Sprawa KR/2026/4412"],
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
    caseId: "zebranie-szkola",
    office: "Szkoła Podstawowa nr 48",
    relatedServiceId: "doreczenia",
    relatedLetterId: "szkola",
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
    caseId: "wymiana-paszportu",
    office: "Małopolski Urząd Wojewódzki",
    relatedServiceId: "zalatw",
    relatedDocIds: ["paszport", "dowod"],
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
        title: "Zapis planu wymiany",
        body: "Możesz zapisać sprawę i przypomnienie w aplikacji. Nie rezerwujemy wizyty w urzędzie wojewódzkim.",
      },
    ],
  },
];

export const VEHICLE_SAMPLE = {
  plate: "KR NX851",
  model: "Samochód osobowy — wzór",
  year: "2020",
  vin: "NXS0000KR8512020",
  inspectionStatus: "Wymaga aktualizacji przed wymianą dowodu rejestracyjnego (sprawa KR/2026/4412)",
  policyStatus: "Polisa OC nie jest podłączona w prototypie (w mObywatelu dane pochodzą z UFG/CEPiK)",
};

export const PENALTY_POINTS_SAMPLE = {
  activePoints: 0,
  temporaryPoints: 0,
  checkedNote: "Stan przykładowy w prototypie. Oficjalny rejestr prowadzi Policja / CEPiK.",
  officialUrl: "https://info.mobywatel.gov.pl/uslugi/punkty-karne",
};

export const HEALTH_REFERRAL_SAMPLE = {
  id: "skierowanie-kardiolog",
  title: "Skierowanie do poradni kardiologicznej",
  code: "WZÓR-0419",
  issuedDate: "2026-11-22",
  issuer: "Przychodnia POZ Salwator — wzór",
  note: "Przykładowe skierowanie w prototypie. Nie jest poradą medyczną i nie rezerwuje terminu wizyty.",
};

export type Benefit = {
  id: string;
  title: string;
  amount?: string;
  state: "przysługuje" | "warto sprawdzić" | "nie widzimy podstaw";
  detail: string;
  expires?: string;
  officialUrl?: string;
  officialLabel?: string;
};

export const BENEFITS: Benefit[] = [
  {
    id: "800",
    title: "Świadczenie wychowawcze",
    amount: "800 zł",
    state: "przysługuje",
    detail: "Na Maję Baran. Najbliższa wypłata 15 grudnia 2026. Decyzja ze wzoru DS-800-2026-11847.",
    expires: "2026-12-15",
    officialUrl: "https://www.zus.pl/",
    officialLabel: "ZUS — świadczenia dla rodziny",
  },
  {
    id: "ulga",
    title: "Ulga na dziecko",
    state: "przysługuje",
    detail: "Uwzględniona w przyjętym zeznaniu PIT-37 za 2025. Nie ma dopłaty ani zwrotu.",
    officialUrl: "https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-na-dziecko/",
    officialLabel: "podatki.gov.pl — Ulga na dziecko",
  },
  {
    id: "obiad",
    title: "Dofinansowanie obiadów w szkole",
    state: "warto sprawdzić",
    detail:
      "Szkoła prowadzi taki program. Z danych prototypu nie wynika, czy spełniasz próg dochodu. Możesz zostawić pytanie — nie wyślemy go.",
  },
  {
    id: "stypendium-start",
    title: "Stypendium socjalne / wsparcie studenckie (przy rozpoczęciu studiów)",
    state: "warto sprawdzić",
    detail:
      "Potencjalne wsparcie zależne od statusu studenta i kryterium dochodowego uczelni. Prototyp nie wylicza uprawnień ani nie wydaje decyzji.",
    officialUrl: "https://www.gov.pl/web/nauka/stypendia-i-wsparcie-dla-studentow",
    officialLabel: "gov.pl — Stypendia dla studentów",
  },
  {
    id: "kdr",
    title: "Karta Dużej Rodziny",
    state: "nie widzimy podstaw",
    detail:
      "W danych jest jedno dziecko. Karta zwykle dotyczy rodzin z co najmniej trojgiem dzieci. To nie jest odmowa urzędu, tylko podpowiedź prototypu.",
    officialUrl: "https://www.gov.pl/web/rodzina/karta-duzej-rodziny-ogolne",
    officialLabel: "gov.pl — Karta Dużej Rodziny",
  },
];

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  meta: string;
  glyph: GlyphName;
  targetView: ViewId;
  targetId?: string;
};

export const TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    date: "2026-11-20",
    title: "Pismo z wydziału komunikacji",
    meta: "Sprawa KR/2026/4412",
    glyph: "letter",
    targetView: "pismo",
    targetId: "komunikacja",
  },
  {
    id: "t2",
    date: "2026-11-18",
    title: "Zaproszenie na zebranie",
    meta: "Szkoła Podstawowa nr 48",
    glyph: "school",
    targetView: "pismo",
    targetId: "szkola",
  },
  {
    id: "t3",
    date: "2026-11-12",
    title: "Decyzja o 800 zł",
    meta: "ZUS · Maja Baran",
    glyph: "support",
    targetView: "sprawa",
    targetId: "osiemset",
  },
  {
    id: "t4",
    date: "2026-11-02",
    title: "Przyjęto PIT-37",
    meta: "Urząd Skarbowy Kraków-Śródmieście",
    glyph: "institution",
    targetView: "pismo",
    targetId: "pit",
  },
  {
    id: "t5",
    date: "2026-06-03",
    title: "Potwierdzono adres",
    meta: "ul. Cicha Polana 9 m. 4",
    glyph: "housing",
    targetView: "sprawa",
    targetId: "meldunek",
  },
  {
    id: "t6",
    date: "2025-01-08",
    title: "Wydano kartę EKUZ",
    meta: "ważna do końca 2027 (wyjazdy UE/EFTA)",
    glyph: "health",
    targetView: "dokument",
    targetId: "ekuz",
  },
  {
    id: "t7",
    date: "2022-08-12",
    title: "Wydano dowód osobisty",
    meta: "seria NXS 482913",
    glyph: "identity",
    targetView: "dokument",
    targetId: "dowod",
  },
];

export type AccessEvent = {
  id: string;
  at: string;
  who: string;
  what: string;
  why: string;
  source?: "sample" | "local";
};

export const ACCESS: AccessEvent[] = [
  {
    id: "a1",
    at: "24 listopada 2026, 19:42",
    who: "Zofia Baran",
    what: "Podgląd dowodu osobistego",
    why: "Urządzenie „Telefon domowy”",
    source: "sample",
  },
  {
    id: "a2",
    at: "20 listopada 2026, 08:11",
    who: "Urząd Miasta Krakowa",
    what: "Dane pojazdu KR NX851",
    why: "Sprawa KR/2026/4412",
    source: "sample",
  },
  {
    id: "a3",
    at: "12 listopada 2026, 11:05",
    who: "ZUS",
    what: "Dane dziecka i rachunek do wypłaty",
    why: "Świadczenie wychowawcze",
    source: "sample",
  },
  {
    id: "a4",
    at: "2 listopada 2026, 14:20",
    who: "Przychodnia Salwator — wzór",
    what: "Potwierdzenie ubezpieczenia",
    why: "Wizyta pediatryczna Mai",
    source: "sample",
  },
  {
    id: "a5",
    at: "3 czerwca 2026, 09:16",
    who: "Urząd Miasta Krakowa",
    what: "Adres zamieszkania",
    why: "Potwierdzenie meldunku",
    source: "sample",
  },
];

export const TRUSTED = {
  name: "Marek Julian Baran",
  relation: "mąż",
  phone: "600 000 148",
  note: "Dotyczy wyłącznie uprawnień w tym prototypie (odbiór pisma i potwierdzenie odbioru dokumentu). Nie jest upoważnieniem medycznym w Internetowym Koncie Pacjenta (mojeIKP).",
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
  view: ViewId;
  selectedId?: string;
  keys: string[];
};

export const DESTINATIONS: Dest[] = [
  { id: "start", title: "Start", meta: "Ekran główny", glyph: "start", view: "start", keys: ["start", "pulpit", "home", "glowny"] },
  { id: "dokumenty", title: "Dokumenty", meta: "Portfel wzorów", glyph: "documents", view: "dokumenty", keys: ["dokument", "portfel", "dowod", "paszport", "prawo jazdy"] },
  { id: "dowod", title: "mDowód", meta: "Pokaż dokument tożsamości", glyph: "identity", view: "dokument", selectedId: "dowod", keys: ["mdowod", "dowod", "tozsamosc", "pokaz dowod"] },
  { id: "prawo", title: "mPrawo jazdy", meta: "Twoje uprawnienia kierowcy", glyph: "wheel", view: "dokument", selectedId: "prawojazdy", keys: ["prawo jazdy", "mprawo", "kategoria b"] },
  { id: "zdrowie", title: "Zdrowie (mojeIKP)", meta: "Recepty, skierowania, wizyty", glyph: "health", view: "zdrowie", keys: ["ikp", "zdrowie", "recepta", "skierowanie", "wizyta", "nfz", "kardiolog", "lekarz"] },
  { id: "pojazdy-view", title: "Moje pojazdy", meta: "KR NX851 i badanie techniczne", glyph: "vehicle", view: "kierowca", selectedId: "pojazdy", keys: ["moje pojazdy", "pojazd", "pojazdy", "samochod", "kr nx851", "oc"] },
  { id: "punkty-view", title: "Punkty karne", meta: "Aktualna liczba we wzorze: 0", glyph: "points", view: "kierowca", selectedId: "punkty", keys: ["punkty karne", "punkty", "mandat", "wykroczenie"] },
  { id: "stluczka-view", title: "mStłuczka", meta: "Koncepcja w prototypie", glyph: "emergency", view: "kierowca", selectedId: "stluczka", keys: ["stluczka", "mstluczka", "kolizja", "wypadek"] },
  { id: "uslugi", title: "Wszystkie usługi", meta: "Katalog usług w jednym miejscu", glyph: "more", view: "uslugi", keys: ["uslugi", "katalog", "wszystkie uslugi"] },
  { id: "profil", title: "Mój profil", meta: "Wygląd, dane, osoba zaufana", glyph: "profile", view: "profil", keys: ["profil", "konto", "ustawienia"] },
  { id: "pesel", title: "Zastrzeż PESEL", meta: "Ochrona numeru — wzór", glyph: "lock", view: "bezpieczenstwo", keys: ["pesel", "zastrzez", "kradziez tozsamosci", "portfel", "zgubilam", "zgubilem"] },
  { id: "paszport-doc", title: "Paszport", meta: "wygasa 14 kwietnia 2027", glyph: "passport", view: "dokument", selectedId: "paszport", keys: ["paszport", "podroz"] },
  { id: "pisma", title: "Moje pisma (e-Doręczenia)", meta: "Skrzynka urzędowa i wyjaśnienia", glyph: "letter", view: "pisma", keys: ["pismo", "pisma", "list", "skrzynka", "korespondencja", "wiadomosc", "edoreczenia", "doreczenia"] },
  { id: "sprawy", title: "Moje sprawy", meta: "To, co jest w toku", glyph: "case", view: "sprawy", keys: ["sprawa", "sprawy", "wniosek"] },
  { id: "zalatw", title: "Ważne zmiany w życiu", meta: "Ścieżki życiowe krok po kroku", glyph: "signpost", view: "zalatw", keys: ["zalatw", "usluga", "sciezka", "urzad", "studia", "przeprowadzka", "praca", "zmiany"] },
  { id: "start-krakow", title: "Studia, pierwsza praca i przeprowadzka", meta: "Wspólny plan życiowy", glyph: "education", view: "zdarzenie", selectedId: "start-krakow", keys: ["studia", "student", "uczelnia", "pierwsza praca", "przeprowadzka", "meldunek"] },
  { id: "pojazd", title: "Dowód rejestracyjny", meta: "Ścieżka pojazdu KR NX851", glyph: "vehicle", view: "zdarzenie", selectedId: "pojazd", keys: ["rejestracyjny", "badanie techniczne", "kr nx"] },
  { id: "wsparcie", title: "Możliwe wsparcie", meta: "Świadczenia i podpowiedzi", glyph: "support", view: "wsparcie", keys: ["swiadczenie", "wsparcie", "800", "zasilek", "benefit", "ulga", "stypendium"] },
  { id: "os", title: "Moja oś czasu", meta: "Co działo się w sprawach", glyph: "timeline", view: "os", keys: ["os czasu", "historia", "kalendarz", "termin", "przypomnienie"] },
  { id: "bezp", title: "Ochrona tożsamości", meta: "Utrata dokumentu, PESEL i alarm", glyph: "shield", view: "bezpieczenstwo", keys: ["bezpieczenstwo", "ochrona", "tozsamosc", "112", "alarm", "utrata", "kradziez"] },
  { id: "dostep", title: "Dostęp do moich danych", meta: "Historia wglądu", glyph: "eye", view: "dostepy", keys: ["dostep", "wglad", "kto widzial", "prywatnosc"] },
  { id: "zaufana", title: "Osoba zaufana", meta: "Marek Baran (poza mojeIKP)", glyph: "trusted", view: "zaufana", keys: ["osoba zaufana", "pelnomocnik", "maz", "zaufana"] },
  { id: "wyglad", title: "Wygląd i wielkość liter", meta: "Motyw, wielkość tekstu, prosty ekran", glyph: "sliders", view: "wyglad", keys: ["motyw", "wyglad", "kontrast", "czcionka", "litery", "dostepnosc", "ciemny", "porcelana"] },
];
