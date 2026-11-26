import {
  demoDate,
  demoNow,
  doc,
  eventFor,
  initialData,
  patch,
  publish,
  repository,
  visible,
  type CivicCase,
  type CivicData,
  type CivicDocument,
  type CivicEvent,
  type RecordBase,
} from "./model";

export const courtPortal = "https://portal.wroclaw.sa.gov.pl";
export const courtOffices = ["Sąd Rejonowy w Brzozowie Demo", "Sąd Okręgowy w Nadlesiu Demo"];
export type CourtCase = CivicCase & {
  sourceId: string;
  division: string;
  appeal: string;
  filedOn: string;
  postedOn: string;
  closedOn?: string;
  clerk?: string;
  resolution?: string;
  participants: { name: string; role: string }[];
  relatedIds: string[];
  recordings: { id: string; title: string; at: string; minutes?: number }[];
};
export type CourtDocument = CivicDocument & {
  sourceRead?: "Odczytane" | "Nieodczytane" | (string & {});
};
export type CaseActivity = CivicEvent & { occurredOn: string };
export type CourtDelivery = RecordBase & {
  caseId: string;
  documentIds: string[];
  type: string;
  status: string | null;
  publishedOn: string;
  sender: string;
  recipient: string;
  deliveredOn?: string;
  returnedOn?: string;
  formalOn?: string;
  attachments: string[];
};
export type CourtHearing = RecordBase & {
  caseId: string;
  at: string;
  title: string;
  place: string;
  room?: string;
  mode?: "stacjonarne" | "zdalne";
  status: "Aktualne" | "Odwołane";
  history: { at: string; previous: string; change: "przesunięte" | "odwołane" }[];
};
export type CaseAccess = {
  id: string;
  caseId: string;
  actorId: string;
  scope: "summary" | "full";
  startedAt: string;
  endsAt?: string;
  revokedAt?: string;
};
export type AccessRequest = {
  id: string;
  office: string;
  signature: string;
  role: string;
  submittedAt: string;
  state: "Zapisany demonstracyjnie" | "Zaakceptowany";
  consideredAt?: string;
  caseId?: string;
};
export type PersonalReminder = {
  id: string;
  hearingId: string;
  at: string;
  state: "active" | "cancelled";
  reason?: string;
};
export type CourtData = CivicData<
  CourtCase,
  {
    hearings: CourtHearing[];
    deliveries: CourtDelivery[];
    accesses: CaseAccess[];
    requests: AccessRequest[];
    reminders: PersonalReminder[];
    deliveriesAvailable: boolean;
  }
>;

function makeCase(key: string, title: string, overrides: Partial<CourtCase> = {}): CourtCase {
  return {
    id: `DEMO-sady-${key}`,
    sourceId: `DEMO-Portal-${key}`,
    number: `DEMO-C-${key}/2026`,
    source: "sady",
    scope: "personal",
    title,
    office: courtOffices[0],
    division: "Wydział Cywilny Demo",
    appeal: "Apelacja Pilotażowa Demo",
    sourceStatus: "W toku",
    updatedAt: demoNow,
    filedOn: demoDate(-20).slice(0, 10),
    postedOn: demoDate(-17).slice(0, 10),
    clerk: "Referent Demo",
    summary: "Przykładowy przebieg postępowania cywilnego.",
    version: 1,
    participants: [
      { name: "Osoba A Demo", role: "Strona powodowa" },
      { name: "Osoba B Demo", role: "Strona pozwana" },
    ],
    relatedIds: [],
    recordings: [],
    ...overrides,
  };
}

function access(item: CourtCase): CaseAccess {
  return {
    id: `${item.id}-access`,
    caseId: item.id,
    actorId: "DEMO-ACTOR",
    scope: "full",
    startedAt: demoDate(-16),
  };
}

function courtDoc(
  item: CourtCase,
  key: string,
  title: string,
  overrides: Partial<CourtDocument> = {},
): CourtDocument {
  return doc(item, key, title, {
    sourceRead: "Nieodczytane",
    authoredOn: demoDate(-2).slice(0, 10),
    publishedAt: demoDate(-1),
    kind: "Dokument sądowy",
    body: "Fikcyjna informacja o przebiegu sprawy cywilnej. Treść należy do scenariusza demonstracyjnego.",
    ...overrides,
  });
}

export function seedCourt(): CourtData {
  const first = makeCase("101", "Spór o zapłatę — przykład");
  const second = makeCase("202", "Sprawa cywilna — przykład", {
    office: courtOffices[1],
    summary: "W danych demonstracyjnych zmieniono termin posiedzenia.",
  });
  const old = makeCase("303", "Sprawa zakończona — przykład", {
    sourceStatus: "Zakończona",
    closedOn: demoDate(-5).slice(0, 10),
    resolution: "Zakończono w scenariuszu demo.",
  });
  const pending = makeCase("404", "Sprawa udostępniana — przykład", {
    sourceStatus: "Status weryfikowany przez źródło",
  });
  const newDoc = courtDoc(first, "n1", "Informacja o przebiegu sprawy");
  const secondDoc = courtDoc(first, "n2", "Informacja o przebiegu sprawy", {
    body: "Drugi odrębny rekord o takiej samej dacie i tytule.",
  });
  const noFile = courtDoc(first, "metadata", "Wzmianka bez pliku", {
    body: undefined,
    format: undefined,
    sourceRead: "Odczytane",
    readAt: demoDate(-1),
  });
  const archived = courtDoc(old, "archive", "Archiwalna informacja sądowa", {
    publishedAt: demoDate(-7),
    sourceRead: "Odczytane",
    readAt: demoDate(-6),
  });
  const hearing = (item: CourtCase, days: number, room?: string): CourtHearing => ({
    id: `${item.id}-hearing`,
    source: "sady",
    scope: "personal",
    caseId: item.id,
    at: demoDate(days, "11:00"),
    title: "Posiedzenie",
    place: item.office,
    room,
    mode: room ? "stacjonarne" : undefined,
    status: "Aktualne",
    history: [],
  });
  const a = hearing(first, 7);
  const b = hearing(second, 14, "Sala D-2");
  b.history = [{ at: demoDate(-1), previous: demoDate(9, "11:00"), change: "przesunięte" }];
  const c = hearing(old, -7, "Sala D-1");
  const deliveries: CourtDelivery[] = [
    {
      id: "DEMO-sady-delivery-1",
      caseId: first.id,
      source: "sady",
      scope: "personal",
      status: "Niedoręczone",
      type: "Pismo",
      documentIds: [newDoc.id],
      publishedOn: demoDate(-1).slice(0, 10),
      sender: first.office,
      recipient: "Osoba Demo",
      attachments: [],
    },
    {
      id: "DEMO-sady-delivery-2",
      caseId: old.id,
      source: "sady",
      scope: "personal",
      status: "Doręczone",
      type: "Pismo",
      documentIds: [archived.id],
      publishedOn: demoDate(-8).slice(0, 10),
      deliveredOn: demoDate(-7).slice(0, 10),
      formalOn: demoDate(-7).slice(0, 10),
      sender: old.office,
      recipient: "Osoba Demo",
      attachments: [],
    },
    {
      id: "DEMO-sady-delivery-3",
      caseId: second.id,
      source: "sady",
      scope: "personal",
      status: "Zwrot",
      type: "Pismo",
      documentIds: [],
      publishedOn: demoDate(-5).slice(0, 10),
      returnedOn: demoDate(-2).slice(0, 10),
      sender: second.office,
      recipient: "Osoba Demo",
      attachments: [],
    },
    {
      id: "DEMO-sady-delivery-4",
      caseId: first.id,
      source: "sady",
      scope: "personal",
      status: null,
      type: "Informacja",
      documentIds: [secondDoc.id],
      publishedOn: demoDate(-1).slice(0, 10),
      sender: first.office,
      recipient: "Osoba Demo",
      attachments: [],
    },
  ];
  const data = initialData(
    "sady",
    [first, second, old, pending],
    [
      newDoc,
      secondDoc,
      noFile,
      archived,
      courtDoc(pending, "access", "Informacja w udostępnionej sprawie"),
    ],
    {
      hearings: [a, b, c],
      deliveries,
      accesses: [first, second, old].map(access),
      reminders: [{ id: `${b.id}-reminder`, hearingId: b.id, at: b.at, state: "active" }],
      requests: [
        {
          id: "DEMO-sady-request-1",
          office: pending.office,
          signature: pending.number!,
          role: "Strona",
          submittedAt: demoDate(-1),
          state: "Zapisany demonstracyjnie",
          caseId: pending.id,
        },
      ],
      deliveriesAvailable: true,
    } as CourtData["extra"],
  );
  const events = [
    eventFor(
      first,
      "court.activity",
      "Zarejestrowano sprawę",
      { kind: "case", id: first.id },
      first.id,
      { occurredOn: first.filedOn, at: demoDate(-17) },
    ),
    eventFor(
      newDoc,
      "court.document",
      "Opublikowano nowy dokument",
      { kind: "document", id: newDoc.id },
      first.id,
      { occurredOn: newDoc.authoredOn, at: newDoc.publishedAt },
    ),
    eventFor(
      secondDoc,
      "court.document",
      "Opublikowano nowy dokument",
      { kind: "document", id: secondDoc.id },
      first.id,
      { occurredOn: secondDoc.authoredOn, at: secondDoc.publishedAt },
    ),
    eventFor(
      a,
      "court.hearing",
      "Dodano posiedzenie",
      { kind: "module", id: `sady/hearing/${a.id}` },
      first.id,
    ),
    eventFor(
      b,
      "court.hearing_changed",
      "Zmieniono termin posiedzenia",
      { kind: "module", id: `sady/hearing/${b.id}` },
      second.id,
      { at: demoDate(-1) },
    ),
    eventFor(
      deliveries[2],
      "court.delivery",
      "Nowa informacja o doręczeniu",
      { kind: "module", id: `sady/delivery/${deliveries[2].id}` },
      second.id,
      { at: demoDate(-2) },
    ),
  ];
  return events.reduce((current, item) => publish(current, item), data);
}

export const useCourt = repository("sady", seedCourt);

export function hasCaseAccess(data: CourtData, id: string, full = false) {
  return data.extra.accesses.some(
    (entry) =>
      entry.caseId === id &&
      entry.actorId === "DEMO-ACTOR" &&
      !entry.revokedAt &&
      Date.parse(entry.startedAt) <= Date.parse(demoNow) &&
      (!entry.endsAt || Date.parse(entry.endsAt) > Date.parse(demoNow)) &&
      (!full || entry.scope === "full"),
  );
}

export function courtProjection(data: CourtData): CourtData {
  const keep = (id: string | null) => !id || hasCaseAccess(data, id);
  const keepFull = (id: string | null) => !id || hasCaseAccess(data, id, true);
  return {
    ...data,
    cases: data.cases.filter((item) => keep(item.id)),
    documents: data.documents.filter((item) => keepFull(item.caseId)),
    events: data.events.filter((item) =>
      item.target.kind === "document" ? keepFull(item.caseId) : keep(item.caseId),
    ),
  };
}

export function courtHearings(data: CourtData, caseId?: string) {
  return data.extra.hearings.filter(
    (item) =>
      visible(data, item) &&
      hasCaseAccess(data, item.caseId) &&
      (!caseId || caseId === item.caseId),
  );
}

export function courtDeliveries(data: CourtData, caseId?: string) {
  return data.extra.deliveries.filter(
    (item) =>
      data.extra.deliveriesAvailable &&
      visible(data, item) &&
      hasCaseAccess(data, item.caseId, true) &&
      (!caseId || caseId === item.caseId),
  );
}

export function setCourtReminder(data: CourtData, id: string, enabled: boolean): CourtData {
  const item = courtHearings(data).find(
    (entry) =>
      entry.id === id && entry.status === "Aktualne" && Date.parse(entry.at) > Date.parse(demoNow),
  );
  if (!item) return data;
  const reminders = data.extra.reminders.filter((entry) => entry.hearingId !== id);
  if (enabled)
    reminders.push({ id: `${id}-reminder`, hearingId: id, at: item.at, state: "active" });
  return { ...data, extra: { ...data.extra, reminders } };
}

export function changeHearing(data: CourtData, id: string, at: string | null): CourtData {
  const item = courtHearings(data).find((entry) => entry.id === id);
  if (!item || item.status === "Odwołane" || item.at === at || data.health !== "ready") return data;
  const history: CourtHearing["history"] = [
    ...item.history,
    { at: demoNow, previous: item.at, change: at ? "przesunięte" : "odwołane" },
  ];
  const updated = {
    ...data,
    extra: {
      ...data.extra,
      hearings: patch(data.extra.hearings, id, {
        at: at ?? item.at,
        history,
        status: at ? "Aktualne" : "Odwołane",
      }),
      reminders: data.extra.reminders.map((entry): PersonalReminder =>
        entry.hearingId !== id || entry.state !== "active"
          ? entry
          : at
            ? { ...entry, at }
            : { ...entry, state: "cancelled", reason: "Posiedzenie zostało odwołane." },
      ),
    },
  };
  return publish(
    { ...updated, cases: patch(data.cases, item.caseId, { updatedAt: demoNow }) },
    eventFor(
      item,
      at ? "court.hearing_changed" : "court.hearing_cancelled",
      at ? "Zmieniono termin posiedzenia" : "Odwołano posiedzenie",
      { kind: "module", id: `sady/hearing/${item.id}` },
      item.caseId,
      { version: history.length + 1 },
    ),
  );
}

export function addCourtDocument(data: CourtData): CourtData {
  const item = data.cases.find(
    (entry) =>
      entry.id === "DEMO-sady-101" && visible(data, entry) && hasCaseAccess(data, entry.id, true),
  );
  if (!item || data.health !== "ready") return data;
  const published = courtDoc(item, "new-demo", "Nowy dokument w sprawie", { publishedAt: demoNow });
  if (data.documents.some((entry) => entry.id === published.id)) return data;
  return publish(
    {
      ...data,
      documents: [published, ...data.documents],
      cases: patch(data.cases, item.id, { updatedAt: demoNow }),
    },
    eventFor(
      published,
      "court.document",
      "Opublikowano nowy dokument",
      { kind: "document", id: published.id },
      item.id,
      { occurredOn: published.authoredOn },
    ),
  );
}

export function acceptRequest(data: CourtData, id: string): CourtData {
  const request = data.extra.requests.find((item) => item.id === id);
  if (!request || request.state === "Zaakceptowany") return data;
  const resource: RecordBase = { id, source: "sady", scope: "personal" };
  return publish(
    {
      ...data,
      extra: {
        ...data.extra,
        requests: patch(data.extra.requests, id, { state: "Zaakceptowany", consideredAt: demoNow }),
      },
    },
    eventFor(
      resource,
      "court.access_accepted",
      "Zmieniono status wniosku o dostęp",
      { kind: "module", id: "sady/access" },
      null,
    ),
  );
}

export function shareCourtData(data: CourtData, requestId: string): CourtData {
  const request = data.extra.requests.find(
    (item) => item.id === requestId && item.state === "Zaakceptowany",
  );
  const item = data.cases.find((entry) => entry.id === request?.caseId);
  if (!item || hasCaseAccess(data, item.id)) return data;
  return publish(
    {
      ...data,
      extra: {
        ...data.extra,
        accesses: [
          ...data.extra.accesses.filter((entry) => entry.caseId !== item.id),
          access(item),
        ],
      },
    },
    eventFor(
      item,
      "court.access_granted",
      "Udostępniono dane sprawy",
      { kind: "case", id: item.id },
      item.id,
    ),
  );
}

export function revokeCourtData(data: CourtData, id: string): CourtData {
  if (!hasCaseAccess(data, id)) return data;
  const resource: RecordBase = { id, source: "sady", scope: "personal" };
  return publish(
    {
      ...data,
      extra: {
        ...data.extra,
        accesses: data.extra.accesses.map((entry) =>
          entry.caseId === id ? { ...entry, revokedAt: demoNow } : entry,
        ),
      },
    },
    eventFor(
      resource,
      "court.access_revoked",
      "Zmieniono dostęp do sprawy",
      { kind: "module", id: "sady/access" },
      null,
    ),
  );
}
