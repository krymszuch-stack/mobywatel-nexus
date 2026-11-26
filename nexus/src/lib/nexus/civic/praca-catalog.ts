import { workOffice, type FormField, type FormSpec } from "./forms";

export const pracaPortal = "https://www.praca.gov.pl/eurzad/uslugi-elektroniczne";
export const workGroups = [
  "Rejestracja i wyrejestrowanie",
  "Oferty pracy, staże i praktyki",
  "Pomoc dla Ukrainy",
  "Zatrudnianie cudzoziemców",
  "Usługi i świadczenia",
  "Usługi dla psychologów",
];
type CatalogItem = {
  id: string;
  code: string;
  title: string;
  official: string;
  group: number;
  mode?: string;
  organizationsOnly?: boolean;
  form?: boolean;
  shortcut?: boolean;
};
export const workCatalog: CatalogItem[] = [
  {
    id: "krb",
    code: "KRB",
    title: "Zarejestruj się w urzędzie pracy",
    official: "Zgłoszenie do rejestracji jako osoba bezrobotna lub poszukująca pracy",
    group: 0,
    mode: "Rejestracja",
    form: true,
    shortcut: true,
  },
  {
    id: "krb-re",
    code: "KRB",
    title: "Zarejestruj się ponownie",
    official: "Ponowna rejestracja osoby bezrobotnej lub poszukującej pracy",
    group: 0,
    mode: "Ponowna rejestracja",
  },
  {
    id: "krb-change",
    code: "KRB",
    title: "Zmień dane w urzędzie",
    official: "Zmiana danych osoby zarejestrowanej",
    group: 0,
    mode: "Zmiana danych",
  },
  {
    id: "krbu",
    code: "PSZ-KRBU",
    title: "Uzupełnij załączniki do rejestracji",
    official: "Uzupełnienie załączników do rejestracji",
    group: 0,
    form: true,
    shortcut: true,
  },
  {
    id: "zpp",
    code: "PSZ-ZPP",
    title: "Zgłoś podjęcie pracy",
    official: "Zgłoszenie podjęcia pracy",
    group: 0,
    form: true,
    shortcut: true,
  },
  {
    id: "zrdg",
    code: "PSZ-ZRDG",
    title: "Zgłoś rozpoczęcie lub wznowienie działalności",
    official: "Zgłoszenie rozpoczęcia lub wznowienia działalności gospodarczej",
    group: 0,
  },
  {
    id: "zbg",
    code: "PSZ-ZBG",
    title: "Zgłoś wyjazd lub brak gotowości",
    official: "Zgłoszenie wyjazdu lub braku gotowości do podjęcia pracy",
    group: 0,
  },
  {
    id: "wpsb",
    code: "PSZ-WPSB",
    title: "Złóż wniosek o pozbawienie statusu bezrobotnego",
    official: "Wniosek o pozbawienie statusu osoby bezrobotnej",
    group: 0,
  },
  {
    id: "wpd",
    code: "PSZ-WPD",
    title: "Przenieś dokumenty do innego urzędu",
    official: "Wniosek o przeniesienie dokumentów",
    group: 0,
  },
  {
    id: "wpspp",
    code: "PSZ-WPSPP",
    title: "Złóż wniosek o pozbawienie statusu poszukującego pracy",
    official: "Wniosek o pozbawienie statusu osoby poszukującej pracy",
    group: 0,
  },
  {
    id: "pu",
    code: "PSZ-PU",
    title: "Napisz pismo do urzędu",
    official: "Pismo do urzędu",
    group: 4,
    form: true,
    shortcut: true,
  },
  {
    id: "wwz",
    code: "PSZ-WWZ",
    title: "Uzyskaj zaświadczenie",
    official: "Wniosek o wydanie zaświadczenia",
    group: 4,
    form: true,
    shortcut: true,
  },
  {
    id: "wpda",
    code: "PSZ-WPDA",
    title: "Wnioskuj o dodatek aktywizacyjny",
    official: "Wniosek o przyznanie dodatku aktywizacyjnego",
    group: 4,
  },
  {
    id: "wsi",
    code: "PSZ-WSI",
    title: "Wnioskuj o sfinansowanie szkolenia",
    official: "Wniosek o sfinansowanie szkolenia lub potwierdzenia wiedzy i umiejętności",
    group: 4,
    shortcut: true,
  },
  {
    id: "wbnz",
    code: "PSZ-WBNZ",
    title: "Wnioskuj o bon na zasiedlenie",
    official: "Wniosek o przyznanie bonu na zasiedlenie",
    group: 4,
  },
  {
    id: "wzkp",
    code: "PSZ-WZKP",
    title: "Wnioskuj o zwrot kosztów przejazdu",
    official: "Wniosek o zwrot kosztów przejazdu",
    group: 4,
  },
  {
    id: "wzkzw",
    code: "PSZ-WZKZW",
    title: "Wnioskuj o zwrot kosztów zakwaterowania i wyżywienia",
    official: "Wniosek o zwrot kosztów zakwaterowania i wyżywienia",
    group: 4,
  },
  {
    id: "psk",
    code: "PSZ-PSK",
    title: "Wskaż rachunek do przelewu świadczenia",
    official: "Wniosek o przekazywanie świadczenia na rachunek bankowy",
    group: 4,
  },
  {
    id: "kfs",
    code: "PSZ-KFS",
    title: "Wnioskuj o środki KFS",
    official: "Wniosek o przyznanie środków Krajowego Funduszu Szkoleniowego",
    group: 4,
    organizationsOnly: true,
  },
  {
    id: "fgsp",
    code: "VIA-WI",
    title: "Złóż wniosek w sprawie roszczeń pracowniczych",
    official: "Wniosek o wypłatę niezaspokojonych roszczeń pracowniczych z FGŚP",
    group: 4,
  },
  {
    id: "fgsp-z",
    code: "VIA-WIZ",
    title: "Złóż wniosek o zaliczkę z FGŚP",
    official: "Wniosek o wypłatę zaliczki na poczet niezaspokojonych roszczeń pracowniczych",
    group: 4,
  },
  {
    id: "pno-ua",
    code: "PSZ-PNO",
    title: "Sprawdź finansowanie nostryfikacji",
    official:
      "Wniosek o sfinansowanie kosztów postępowania nostryfikacyjnego lub potwierdzenia ukończenia studiów",
    group: 2,
  },
  {
    id: "pno",
    code: "PSZ-PNO",
    title: "Wnioskuj o środki na nostryfikację",
    official:
      "Wniosek o sfinansowanie kosztów postępowania nostryfikacyjnego lub potwierdzenia ukończenia studiów",
    group: 4,
  },
  {
    id: "zopp",
    code: "PSZ-ZOPP",
    title: "Zgłoś ofertę pracy",
    official: "Zgłoszenie oferty pracy, stażu lub praktyk",
    group: 1,
    organizationsOnly: true,
  },
  {
    id: "psych",
    code: "SP-ZGL",
    title: "Zgłoś się do spisu psychologów",
    official: "Zgłoszenie do spisu psychologów",
    group: 5,
  },
  ...(
    [
      ["ppwpu-ua", "PSZ-PPWPU", "Powiadomienie o powierzeniu pracy cudzoziemcowi", 2],
      ["ppwpu", "PSZ-PPWPU", "Powiadomienie o powierzeniu pracy cudzoziemcowi", 3],
      ["uzc", "PGP-UZC", "Przekazanie kopii umowy zawartej z cudzoziemcem", 3],
      ["oppc", "PSZ-OPPC", "Oświadczenie o powierzeniu pracy cudzoziemcowi", 3],
      ["pnpc", "PSZ-PNPC", "Powiadomienie o niepodjęciu pracy przez cudzoziemca", 3],
      ["pppc", "PSZ-PPPC", "Powiadomienie o podjęciu pracy przez cudzoziemca", 3],
      [
        "pzpc",
        "PSZ-PZPC",
        "Powiadomienie o zakończeniu lub niepodjęciu pracy przez cudzoziemca",
        3,
      ],
      [
        "pppo",
        "PSZ-PPPO",
        "Powiadomienie o podjęciu lub niepodjęciu pracy na podstawie oświadczenia wpisanego do ewidencji",
        3,
      ],
      [
        "pzpo",
        "PSZ-PZPO",
        "Powiadomienie o zakończeniu pracy na podstawie oświadczenia wpisanego do ewidencji",
        3,
      ],
      ["wzpsc", "PSZ-WZPSC", "Wniosek o wydanie zezwolenia na pracę sezonową", 3],
      ["wpzpsc", "PSZ-WPZPSC", "Wniosek o przedłużenie zezwolenia na pracę sezonową", 3],
      ["ozps", "PSZ-OZPS", "Oświadczenie o zgłoszeniu się do pracy sezonowej", 3],
      ["ozpsc", "PSZ-OZPSC", "Oświadczenie o zgłoszeniu się cudzoziemca do pracy sezonowej", 3],
      ["wwzpp", "ZC-WWZPP", "Wniosek o wydanie zezwolenia na pracę na rzecz polskiego podmiotu", 3],
      ["zc-pnpc", "ZC-PNPC", "Powiadomienie o niepodjęciu pracy na podstawie zezwolenia", 3],
      ["zc-pppc", "ZC-PPPC", "Powiadomienie o przerwie w pracy na podstawie zezwolenia", 3],
      ["zc-pzpc", "ZC-PZPC", "Powiadomienie o zakończeniu pracy na podstawie zezwolenia", 3],
      [
        "bz-6",
        "PSZ-BZASOZ",
        "Informacja o sześciu miesiącach zatrudnienia w związku z bonem na zasiedlenie",
        4,
      ],
      [
        "bz-pu",
        "PSZ-BZASPUZ",
        "Informacja o podjęciu lub utracie zatrudnienia w związku z bonem na zasiedlenie",
        4,
      ],
      [
        "bz-i",
        "PSZ-IBNZ",
        "Informacja o zatrudnieniu, innej pracy lub działalności w związku z bonem na zasiedlenie",
        4,
      ],
    ] as const
  ).map(([id, code, title, group]) => ({
    id,
    code,
    title,
    official: title,
    group,
    organizationsOnly: group === 3,
  })),
];

export function workForm(id: string): FormSpec | undefined {
  const item = workCatalog.find((entry) => entry.id === id && entry.form);
  if (!item) return undefined;
  const office = {
    title: "Urząd",
    fields: [
      {
        key: "office",
        label: "Urząd",
        kind: "select",
        options: [workOffice, "Filia Urzędu Pracy Demo"],
      } satisfies FormField,
    ],
  };
  const details: Record<string, FormField[]> = {
    pu: [
      { key: "subject", label: "Temat" },
      { key: "body", label: "Treść pisma", kind: "textarea" },
    ],
    wwz: [
      {
        key: "subject",
        label: "Rodzaj zaświadczenia",
        kind: "select",
        options: ["Zaświadczenie o rejestracji", "Zaświadczenie o okresach rejestracji"],
      },
      { key: "body", label: "Cel wydania", kind: "textarea" },
    ],
    krbu: [
      { key: "subject", label: "Numer rejestracji demo" },
      { key: "body", label: "Co uzupełniasz?", kind: "textarea" },
    ],
    zpp: [
      { key: "started", label: "Data rozpoczęcia pracy w scenariuszu", kind: "date" },
      { key: "body", label: "Informacja o pracy demo", kind: "textarea" },
    ],
  };
  const krb: FormSpec["phases"] = [
    {
      title: "Ankieta i potrzebne dokumenty",
      fields: [
        {
          key: "category",
          label: "Kontekst rejestracji demonstracyjnej",
          kind: "select",
          options: ["Osoba bezrobotna", "Osoba poszukująca pracy"],
        },
        { key: "papers", label: "Zapoznałem się z informacją o załącznikach demo", kind: "check" },
      ],
    },
    {
      title: "Dane osoby i dane szczegółowe",
      fields: [
        { key: "name", label: "Fikcyjne imię i nazwisko" },
        { key: "education", label: "Wykształcenie w scenariuszu" },
        { key: "details", label: "Informacje dodatkowe", optional: true },
      ],
    },
    {
      title: "Kontakt, prawa i obowiązki",
      fields: [
        { key: "contact", label: "Fikcyjny kontakt" },
        { key: "rights", label: "Zapoznałem się z opisem praw i obowiązków", kind: "check" },
      ],
    },
    {
      title: "Oświadczenia demonstracyjne",
      fields: [
        {
          key: "statement",
          label: "Potwierdzam użycie danych fikcyjnych w tym zgłoszeniu",
          kind: "check",
        },
      ],
    },
  ];
  return {
    id,
    code: item.code,
    title: item.title,
    office: workOffice,
    phases: [
      office,
      ...(id === "krb" ? krb : [{ title: "Dane formularza", fields: details[id] ?? [] }]),
    ],
    attachmentLimit: id === "krb" ? 4_000_000 : id === "krbu" ? 8_000_000 : undefined,
    attachmentRequired: id === "krbu",
    signatures:
      id === "krb"
        ? ["Podpis zaufany (demo)", "Podpis kwalifikowany (demo)"]
        : ["Podpis zaufany (demo)"],
  };
}
