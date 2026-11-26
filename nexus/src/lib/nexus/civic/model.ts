import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Agency = "pfron" | "zus" | "praca" | "sady";
export const agencyNames: Record<Agency, string> = {
  pfron: "Wsparcie PFRON",
  zus: "ZUS",
  praca: "Praca i urząd pracy",
  sady: "Sądy",
};
export const demoNow = "2026-11-26T10:00:00+01:00";

export function demoDate(days: number, time = "10:00") {
  const date = new Date(Date.UTC(2026, 10, 26 + days)).toISOString().slice(0, 10);
  return `${date}T${time}:00+01:00`;
}

const warsawClock = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Warsaw",
  timeZoneName: "longOffset",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function warsawDateTime(date: string, time: string): string | null {
  const local = `${date}T${time}:00`;
  const noon = Date.parse(`${date}T12:00:00Z`);
  if (!Number.isFinite(noon) || !Number.isFinite(Date.parse(`${local}Z`))) return null;
  const offset = warsawClock
    .formatToParts(noon)
    .find((part) => part.type === "timeZoneName")
    ?.value.slice(3);
  if (!offset) return null;
  const at = `${local}${offset}`;
  const formatted = warsawClock.format(Date.parse(at));
  return formatted.startsWith(`${date} ${time}`) ? at : null;
}

export function warsaw(value: string, time = false) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    ...(time ? { timeStyle: "short" } : {}),
    timeZone: "Europe/Warsaw",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00+01:00` : value));
}

export const searchKey = (value: string) =>
  value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ł", "l");

export type Scope = "personal" | "dependent" | "organization";
export type Context = {
  actorId: string;
  subjectId: string;
  recipientId: string;
  representation: "self" | "guardian" | "organization";
};
export const contexts: Record<Scope, Context> = {
  personal: {
    actorId: "DEMO-ACTOR",
    subjectId: "DEMO-ACTOR",
    recipientId: "DEMO-ACTOR",
    representation: "self",
  },
  dependent: {
    actorId: "DEMO-ACTOR",
    subjectId: "DEMO-DEPENDENT",
    recipientId: "DEMO-DEPENDENT",
    representation: "guardian",
  },
  organization: {
    actorId: "DEMO-ACTOR",
    subjectId: "DEMO-ORGANIZATION",
    recipientId: "DEMO-ORGANIZATION",
    representation: "organization",
  },
};
export type RecordBase = { id: string; source: Agency; scope: Scope };
export type CivicCase = RecordBase & {
  title: string;
  number?: string;
  office: string;
  sourceStatus: string | null;
  updatedAt: string;
  summary: string;
  version: number;
};
export type Attachment = { name: string; size: number; type: string };
export type Receipt = { id: string; type: "UPP" | "UPD" | "wzór"; at: string };
export type CivicDocument = RecordBase & {
  caseId: string | null;
  title: string;
  office: string;
  body?: string;
  publishedAt: string;
  authoredOn?: string;
  kind: string;
  direction: "incoming" | "outgoing";
  formCode?: string;
  version: string;
  submission?: "draft" | "ready" | "pending" | "sent" | "failed";
  signature?: { required: number; completed: number };
  delivery?: "waiting" | "received" | "deemed" | "other";
  deliveryAt?: string;
  readAt?: string;
  sourceRead?: string;
  attachments?: Attachment[];
  receipts?: Receipt[];
  requiresReceipt?: boolean;
  canContinue?: boolean;
  expiryAt?: string;
  format?: "pdf" | "txt";
};
export type Target = { kind: "case" | "document" | "module"; id: string };
export type CivicEvent = RecordBase & {
  type: string;
  title: string;
  at: string;
  version: number;
  target: Target;
  caseId: string | null;
  evidence: "ui" | "documentation" | "design";
  occurredOn?: string;
};
export type CivicNotice = RecordBase & {
  eventId: string;
  recipientId: string;
  channel: "inbox";
  readAt?: string;
  category: string;
  priority: "action" | "info";
};
export type CivicTask = RecordBase & {
  caseId: string | null;
  title: string;
  detail: string;
  action: string;
  target: Target;
  dueAt: string | null;
  dueSource?: "demo";
  completedAt?: string;
};
export type CivicAppointment = RecordBase & {
  title: string;
  at: string;
  office: string;
  location: string;
  mode: "online" | "stacjonarna";
  state: "booked" | "cancelled";
  cancellable: boolean;
  position?: string;
  history?: string[];
};
export type Draft = RecordBase & {
  serviceId: string;
  caseId: string | null;
  step: number;
  values: Record<string, string>;
  attachments: Attachment[];
  baseVersion?: number;
  resultId?: string;
  pending?: boolean;
};
export type SourceHealth =
  "ready" | "loading" | "empty" | "error" | "stale" | "expired" | "forbidden";
export type CivicData<C extends CivicCase = CivicCase, Extra = unknown> = {
  source: Agency;
  scope: Scope;
  health: SourceHealth;
  fetchedAt: string;
  sourceUpdatedAt: string;
  cases: C[];
  documents: CivicDocument[];
  events: CivicEvent[];
  notices: CivicNotice[];
  tasks: CivicTask[];
  drafts: Draft[];
  appointments: CivicAppointment[];
  extra: Extra;
};
export type CivicRepository<D extends CivicData> = {
  data: D;
  change: (update: (data: D) => D) => void;
  reset: () => void;
};

export function repository<D extends CivicData>(source: Agency, initial: () => D) {
  return create<CivicRepository<D>>()(
    persist(
      (set) => ({
        data: initial(),
        change: (update) => set(({ data }) => ({ data: update(data) })),
        reset: () => set({ data: initial() }),
      }),
      {
        name: `nexus-civic-${source}`,
        version: 2,
        partialize: ({ data }) => ({ data }),
        migrate: (persisted, version) => {
          const data = (persisted as { data?: D } | undefined)?.data;
          if (version !== 1 || !data || !Array.isArray(data.appointments))
            return { data: initial() };
          const appointments = data.appointments.map((item) => {
            // Version 1 stored the selected Warsaw wall time with a fixed winter offset.
            if (!item.at.endsWith("+01:00")) return item;
            const at = warsawDateTime(item.at.slice(0, 10), item.at.slice(11, 16));
            return at && at !== item.at ? { ...item, at } : item;
          });
          return { data: { ...data, appointments } };
        },
      },
    ),
  );
}

export function initialData<C extends CivicCase, E>(
  source: Agency,
  cases: C[],
  documents: CivicDocument[],
  extra: E,
): CivicData<C, E> {
  return {
    source,
    scope: "personal",
    health: "ready",
    fetchedAt: demoNow,
    sourceUpdatedAt: demoNow,
    cases,
    documents,
    extra,
    events: [],
    notices: [],
    tasks: [],
    drafts: [],
    appointments: [],
  };
}

export function publish<D extends CivicData>(
  data: D,
  event: CivicEvent,
  priority: CivicNotice["priority"] = "info",
  notify = true,
): D {
  if (data.events.some((item) => item.id === event.id)) return data;
  const recipientId = contexts[event.scope].recipientId;
  const notice: CivicNotice = {
    id: `${event.id}/${recipientId}/inbox`,
    eventId: event.id,
    source: event.source,
    scope: event.scope,
    channel: "inbox",
    recipientId,
    category: event.type.split(".")[0],
    priority,
  };
  return {
    ...data,
    events: [event, ...data.events],
    notices: notify ? [notice, ...data.notices] : data.notices,
  };
}

export function eventFor(
  resource: RecordBase,
  type: string,
  title: string,
  target: Target,
  caseId: string | null,
  details: Partial<Pick<CivicEvent, "at" | "version" | "evidence" | "occurredOn">> = {},
): CivicEvent {
  const version = details.version ?? 1;
  return {
    id: `${resource.id}/${type}/${version}`,
    scope: resource.scope,
    source: resource.source,
    type,
    title,
    at: demoNow,
    version,
    target,
    caseId,
    evidence: "design",
    ...details,
  };
}

export function visible(data: CivicData, item: RecordBase) {
  return (
    data.source === item.source &&
    data.scope === item.scope &&
    !["empty", "forbidden", "expired", "loading"].includes(data.health)
  );
}

export function saveDraft<D extends CivicData>(data: D, draft: Draft): D {
  const previous = data.drafts.find((item) => item.id === draft.id);
  if (!visible(data, draft) || previous?.resultId || previous?.pending) return data;
  return { ...data, drafts: [...data.drafts.filter((item) => item.id !== draft.id), draft] };
}

export function patch<T extends { id: string }>(items: T[], id: string, update: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...update } : item));
}

export function complete<D extends CivicData>(data: D, id: string): D {
  return { ...data, tasks: patch(data.tasks, id, { completedAt: demoNow }) };
}

export function demoId(source: Agency, kind: string) {
  return `DEMO-${source}-${kind}-${globalThis.crypto.randomUUID()}`;
}

export function doc(
  item: CivicCase,
  key: string,
  title: string,
  overrides: Partial<CivicDocument> = {},
): CivicDocument {
  return {
    id: `${item.id}-${key}`,
    caseId: item.id,
    source: item.source,
    scope: item.scope,
    office: item.office,
    title,
    kind: "Pismo",
    body: "Wzór treści przygotowany do scenariusza demonstracyjnego.",
    version: "1.0",
    direction: "incoming",
    publishedAt: demoDate(-1),
    format: "txt",
    ...overrides,
  };
}

export function task(
  item: CivicCase,
  key: string,
  title: string,
  detail: string,
  action: string,
  target: Target = { kind: "case", id: item.id },
  dueAt: string | null = null,
): CivicTask {
  return {
    id: `${item.id}-${key}`,
    caseId: item.id,
    source: item.source,
    scope: item.scope,
    title,
    detail,
    action,
    target,
    dueAt,
    ...(dueAt ? { dueSource: "demo" as const } : {}),
  };
}
