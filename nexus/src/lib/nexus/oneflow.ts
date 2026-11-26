import {
  ACCESS,
  CASES,
  DOCUMENTS,
  JOURNEYS,
  LETTERS,
  TIMELINE,
  type AccessEvent,
  type CaseItem,
  type LetterItem,
} from "./data";
import { minutesLeft, plDate, type DayMode } from "./format";
import { serviceById } from "./registry";
import { demoStoryById } from "./demo-stories";
import type {
  ActionPlan,
  ActionPlanTask,
  ContextualNotification,
  Crumb,
  DemoStoryId,
  EntityLink,
  HomeMode,
  MotionPref,
  OneFlowEvent,
  PersonaId,
  ReminderItem,
  SavedPlanCase,
  SimulatedReceipt,
  ThemeName,
  ViewId,
} from "./types";
import type { GlyphName } from "@/components/nexus/glyph-paths";

export type JourneyProgress = {
  step: number;
  choices: Record<string, string>;
  done: boolean;
  updatedAt?: string;
};

export type OneFlowPersisted = {
  onboarded: boolean;
  theme: ThemeName;
  mode: HomeMode;
  textScale: number;
  motion: MotionPref;
  dayMode: DayMode;
  view: ViewId;
  selectedId?: string;
  stack: Crumb[];
  readIds: string[];
  drafts: Record<string, string>;
  replies: Record<string, string>;
  shares: Record<string, number>;
  lost: string[];
  caseNotes: Record<string, string>;
  journeys: Record<string, JourneyProgress>;
  trustedOn: boolean;
  mealAsk: string;
  mealSent: boolean;
  peselLocked: boolean;
  reminders: ReminderItem[];
  events: OneFlowEvent[];
  receipts: SimulatedReceipt[];
  savedPlans: Record<string, SavedPlanCase>;
  processedActionKeys: string[];
  activePersona: PersonaId;
  demoStoryId: DemoStoryId | null;
};

export type EvaluatedPlanTask = ActionPlanTask & {
  done: boolean;
  completedByService: boolean;
  blockedByTitles: string[];
  isBlocked: boolean;
};

export type DerivedCase = CaseItem & {
  receipts: SimulatedReceipt[];
  events: OneFlowEvent[];
  relatedLinks: EntityLink[];
  isPlanCase?: boolean;
  planCase?: SavedPlanCase;
  evaluatedTasks?: EvaluatedPlanTask[];
  evaluatedFacts?: string[];
};

export type HomePriority = {
  id: string;
  kicker: string;
  title: string;
  meta: string;
  targetView: ViewId;
  targetId?: string;
  kind: "letter" | "plan";
};

export type UnifiedTimelineItem = {
  id: string;
  sortAt: string;
  dateLabel: string;
  title: string;
  meta: string;
  glyph: GlyphName;
  source: "event" | "reminder" | "baseline";
  targetView: ViewId;
  targetId?: string;
  receiptCode?: string;
  reminderId?: string;
};

export const STORE_VERSION = 3;

const VALID_THEMES = new Set<ThemeName>(["porcelain", "midnight", "contrast"]);
const VALID_PERSONAS = new Set<PersonaId>(["default", "student", "senior"]);
const VALID_DEMO_STORIES = new Set<DemoStoryId>(["student", "senior", "letter", "wallet"]);
const VALID_MODES = new Set<HomeMode>(["simple", "daily", "dense"]);
const VALID_MOTIONS = new Set<MotionPref>(["system", "reduce"]);
const VALID_DAYS = new Set<DayMode>(["auto", "off", "nov11", "may3", "aug15"]);
const VALID_VIEWS = new Set<ViewId>([
  "start",
  "dokumenty",
  "dokument",
  "pisma",
  "pismo",
  "sprawy",
  "sprawa",
  "zalatw",
  "zdarzenie",
  "wsparcie",
  "os",
  "bezpieczenstwo",
  "dostepy",
  "zaufana",
  "wyglad",
  "uslugi",
  "zdrowie",
  "kierowca",
  "profil",
]);

export function createFreshPersisted(): OneFlowPersisted {
  return {
    onboarded: false,
    theme: "porcelain",
    mode: "daily",
    textScale: 1,
    motion: "system",
    dayMode: "auto",
    view: "start",
    selectedId: undefined,
    stack: [],
    readIds: [],
    drafts: {},
    replies: {},
    shares: {},
    lost: [],
    caseNotes: {},
    journeys: {},
    trustedOn: false,
    mealAsk: "",
    mealSent: false,
    peselLocked: false,
    reminders: [],
    events: [],
    receipts: [],
    savedPlans: {},
    processedActionKeys: [],
    activePersona: "default",
    demoStoryId: null,
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0)));
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function asNumberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function sanitizeJourneys(value: unknown): Record<string, JourneyProgress> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, JourneyProgress> = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    const step = typeof item.step === "number" && Number.isInteger(item.step) && item.step >= 0 ? item.step : 0;
    const done = Boolean(item.done);
    const choices = asStringRecord(item.choices);
    const updatedAt = typeof item.updatedAt === "string" ? item.updatedAt : undefined;
    out[id] = { step, choices, done, ...(updatedAt ? { updatedAt } : {}) };
  }
  return out;
}

function sanitizeReminders(value: unknown): ReminderItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: ReminderItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id || seen.has(r.id)) continue;
    if (typeof r.title !== "string" || !r.title.trim()) continue;
    seen.add(r.id);
    const targetView: ViewId =
      typeof r.targetView === "string" && VALID_VIEWS.has(r.targetView as ViewId)
        ? (r.targetView as ViewId)
        : r.id === "skierowanie"
          ? "zdrowie"
          : "os";
    out.push({
      id: r.id,
      title: r.title.trim(),
      when: typeof r.when === "string" && r.when.trim() ? r.when.trim() : "bez wybranej daty",
      isoDate: typeof r.isoDate === "string" ? r.isoDate : undefined,
      time: typeof r.time === "string" ? r.time : undefined,
      serviceId: typeof r.serviceId === "string" ? r.serviceId : r.id === "skierowanie" ? "ikp" : undefined,
      targetView,
      targetId: typeof r.targetId === "string" ? r.targetId : undefined,
      note: typeof r.note === "string" ? r.note : undefined,
      createdAt: typeof r.createdAt === "string" ? r.createdAt : "2026-11-25T12:00:00.000Z",
    });
  }
  return out;
}

function sanitizeStack(value: unknown): Crumb[] {
  if (!Array.isArray(value)) return [];
  const out: Crumb[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const c = raw as Record<string, unknown>;
    if (typeof c.view === "string" && VALID_VIEWS.has(c.view as ViewId)) {
      out.push({ view: c.view as ViewId, id: typeof c.id === "string" ? c.id : undefined });
    }
  }
  return out.slice(-20);
}

function receiptCodeFromKey(actionKey: string): string {
  let hash = 2166136261;
  for (let i = 0; i < actionKey.length; i += 1) {
    hash ^= actionKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const num = (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `UPO-WZÓR-${num}`;
}

export function formatEventTime(iso: string): string {
  const datePart = iso.slice(0, 10);
  const timeMatch = iso.match(/T(\d{2}:\d{2})/);
  const base = plDate(datePart);
  return timeMatch ? `${base}, ${timeMatch[1]}` : base;
}

/**
 * Safely migrates persisted state from v1 (or corrupted/partial storage) to v2.
 * Preserves preferences, drafts, replies, reminders, journeys, PESEL status, lost docs,
 * shares, notes, and backfills canonical OneFlow events & receipts for pre-existing v1 actions.
 */
export function migratePersistedState(persisted: unknown, _fromVersion?: number): OneFlowPersisted {
  const base = createFreshPersisted();
  if (!persisted || typeof persisted !== "object" || Array.isArray(persisted)) {
    return base;
  }
  const raw = persisted as Record<string, unknown>;
  const scaleRaw = typeof raw.textScale === "number" ? raw.textScale : 1;
  const textScale = [1, 1.25, 1.5, 1.75, 2].includes(scaleRaw) ? scaleRaw : 1;

  const state: OneFlowPersisted = {
    ...base,
    onboarded: Boolean(raw.onboarded),
    theme: typeof raw.theme === "string" && VALID_THEMES.has(raw.theme as ThemeName) ? (raw.theme as ThemeName) : base.theme,
    mode: typeof raw.mode === "string" && VALID_MODES.has(raw.mode as HomeMode) ? (raw.mode as HomeMode) : base.mode,
    textScale,
    motion: typeof raw.motion === "string" && VALID_MOTIONS.has(raw.motion as MotionPref) ? (raw.motion as MotionPref) : base.motion,
    dayMode: typeof raw.dayMode === "string" && VALID_DAYS.has(raw.dayMode as DayMode) ? (raw.dayMode as DayMode) : base.dayMode,
    view: typeof raw.view === "string" && VALID_VIEWS.has(raw.view as ViewId) ? (raw.view as ViewId) : base.view,
    selectedId: typeof raw.selectedId === "string" ? raw.selectedId : undefined,
    stack: sanitizeStack(raw.stack),
    readIds: asStringArray(raw.readIds),
    drafts: asStringRecord(raw.drafts),
    replies: asStringRecord(raw.replies),
    shares: asNumberRecord(raw.shares),
    lost: asStringArray(raw.lost),
    caseNotes: asStringRecord(raw.caseNotes),
    journeys: sanitizeJourneys(raw.journeys),
    trustedOn: Boolean(raw.trustedOn),
    mealAsk: typeof raw.mealAsk === "string" ? raw.mealAsk : "",
    mealSent: Boolean(raw.mealSent),
    peselLocked: Boolean(raw.peselLocked),
    reminders: sanitizeReminders(raw.reminders),
    events: Array.isArray(raw.events) ? (raw.events as OneFlowEvent[]) : [],
    receipts: Array.isArray(raw.receipts) ? (raw.receipts as SimulatedReceipt[]) : [],
    savedPlans:
      raw.savedPlans && typeof raw.savedPlans === "object" && !Array.isArray(raw.savedPlans)
        ? (raw.savedPlans as Record<string, SavedPlanCase>)
        : {},
    processedActionKeys: asStringArray(raw.processedActionKeys),
    activePersona:
      typeof raw.activePersona === "string" && VALID_PERSONAS.has(raw.activePersona as PersonaId)
        ? (raw.activePersona as PersonaId)
        : "default",
    demoStoryId:
      typeof raw.demoStoryId === "string" && VALID_DEMO_STORIES.has(raw.demoStoryId as DemoStoryId)
        ? (raw.demoStoryId as DemoStoryId)
        : null,
  };

  // Backfill canonical events & receipts if migrating from v1 with existing replies/locks/journeys
  for (const [letterId, replyText] of Object.entries(state.replies)) {
    const actionKey = `reply:${letterId}`;
    if (!replyText.trim() || state.processedActionKeys.includes(actionKey)) continue;
    const letter = LETTERS.find((item) => item.id === letterId);
    const code = receiptCodeFromKey(actionKey);
    const at = "2026-11-25T12:00:00.000Z";
    state.processedActionKeys.push(actionKey);
    state.receipts.unshift({
      id: `rcpt-${letterId}`,
      code,
      title: `Potwierdzenie zapisu odpowiedzi: ${letter?.subject ?? letterId}`,
      institution: letter?.from ?? "e-Doręczenia (wzór)",
      createdAt: at,
      summary: "Odpowiedź przeniesiona z zapisanego stanu lokalnego. Nie wysłano jej do urzędu.",
      actionKey,
      targetView: "pismo",
      targetId: letterId,
      note: "Symulowane potwierdzenie (UPO-WZÓR) działające wyłącznie w przeglądarce.",
    });
    state.events.unshift({
      id: `evt-${actionKey}`,
      actionKey,
      type: "letter_replied",
      at,
      title: `Zapisano odpowiedź: ${letter?.subject ?? letterId}`,
      meta: `${letter?.from ?? "e-Doręczenia"} · ${code} (symulacja)`,
      glyph: "letter",
      targetView: "pismo",
      targetId: letterId,
      receiptCode: code,
    });
  }

  if (state.peselLocked && !state.processedActionKeys.includes("pesel:lock")) {
    const actionKey = "pesel:lock";
    const code = receiptCodeFromKey(actionKey);
    state.processedActionKeys.push(actionKey);
    state.events.unshift({
      id: `evt-${actionKey}`,
      actionKey,
      type: "pesel_locked",
      at: "2026-11-25T12:00:00.000Z",
      title: "Zastrzeżono PESEL w prototypie",
      meta: `Status lokalny · ${code}`,
      glyph: "key",
      targetView: "bezpieczenstwo",
      receiptCode: code,
    });
  }

  return state;
}

export function letterStatus(
  letter: LetterItem,
  readIds: string[],
  replies: Record<string, string>,
): "nowe" | "wymaga odpowiedzi" | "odpowiedziane" | "przeczytane" {
  if (replies[letter.id]) return "odpowiedziane";
  if (letter.needsReply) return "wymaga odpowiedzi";
  if (!readIds.includes(letter.id)) return "nowe";
  return "przeczytane";
}

export function applySendReply(
  state: OneFlowPersisted,
  letterId: string,
  nowIso = new Date().toISOString(),
  explicitActionKey?: string,
): OneFlowPersisted {
  const letter = LETTERS.find((item) => item.id === letterId);
  if (!letter) return state;
  const text = (state.drafts[letterId] ?? "").trim();
  const actionKey = explicitActionKey ?? `reply:${letterId}`;
  if (!text || state.replies[letterId] || state.processedActionKeys.includes(actionKey)) {
    return state;
  }

  const code = receiptCodeFromKey(actionKey);
  const nextDrafts = { ...state.drafts };
  delete nextDrafts[letterId];

  const receipt: SimulatedReceipt = {
    id: `rcpt-${actionKey}`,
    code,
    title: `Potwierdzenie zapisu odpowiedzi: ${letter.subject}`,
    institution: `${letter.from} · ${letter.office}`,
    createdAt: nowIso,
    summary: `Zapisano lokalną odpowiedź w sprawie ${letter.reference}. Nie przekazano jej do urzędu.`,
    actionKey,
    targetView: "pismo",
    targetId: letter.id,
    note: "To symulowane potwierdzenie (UPO-WZÓR) w prototypie mObywatel NEXUS. Zaktualizowano Moje pisma, powiązaną sprawę, ekran Start i Moją oś czasu.",
  };

  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "letter_replied",
    at: nowIso,
    title: `Zapisano odpowiedź: ${letter.subject}`,
    meta: `${letter.from} · ${code} (symulacja lokalna)`,
    glyph: "letter",
    targetView: letter.relatedCaseId ? "sprawa" : "pismo",
    targetId: letter.relatedCaseId ?? letter.id,
    receiptCode: code,
    actor: "Zofia Baran (lokalnie)",
  };

  return {
    ...state,
    drafts: nextDrafts,
    replies: { ...state.replies, [letterId]: text },
    readIds: state.readIds.includes(letterId) ? state.readIds : [...state.readIds, letterId],
    receipts: [receipt, ...state.receipts],
    events: [event, ...state.events],
    processedActionKeys: [...state.processedActionKeys, actionKey],
  };
}

export function applyAddReminder(
  state: OneFlowPersisted,
  input: {
    id: string;
    title: string;
    when: string;
    isoDate?: string;
    time?: string;
    serviceId?: string;
    targetView?: ViewId;
    targetId?: string;
    note?: string;
  },
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const cleanTitle = input.title.trim();
  if (!input.id || !cleanTitle) return state;
  if (state.reminders.some((item) => item.id === input.id)) {
    return state;
  }
  const targetView: ViewId = input.targetView ?? (input.serviceId === "ikp" ? "zdrowie" : "os");
  const reminder: ReminderItem = {
    id: input.id,
    title: cleanTitle,
    when: input.when.trim() || (input.isoDate ? `${plDate(input.isoDate)}${input.time ? `, ${input.time}` : ""}` : "zapisane w prototypie"),
    isoDate: input.isoDate,
    time: input.time,
    serviceId: input.serviceId,
    targetView,
    targetId: input.targetId,
    note: input.note,
    createdAt: nowIso,
  };
  const actionKey = `reminder:create:${input.id}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "reminder_created",
    at: nowIso,
    title: `Dodano przypomnienie: ${cleanTitle}`,
    meta: `${reminder.when} · zapisane lokalnie`,
    glyph: input.serviceId === "ikp" ? "health" : "calendar",
    targetView,
    targetId: input.targetId,
    actor: "Zofia Baran (lokalnie)",
  };

  return {
    ...state,
    reminders: [reminder, ...state.reminders],
    events: state.processedActionKeys.includes(actionKey) ? state.events : [event, ...state.events],
    processedActionKeys: state.processedActionKeys.includes(actionKey)
      ? state.processedActionKeys
      : [...state.processedActionKeys, actionKey],
  };
}

export function applyUpdateReminder(
  state: OneFlowPersisted,
  id: string,
  patch: { title?: string; when?: string; isoDate?: string; time?: string; note?: string },
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const existing = state.reminders.find((item) => item.id === id);
  if (!existing) return state;
  const nextIso = patch.isoDate ?? existing.isoDate;
  const nextTime = patch.time ?? existing.time;
  const computedWhen =
    patch.when ??
    (nextIso ? `${plDate(nextIso)}${nextTime ? `, ${nextTime}` : ""}` : existing.when);
  const updated: ReminderItem = {
    ...existing,
    title: patch.title?.trim() || existing.title,
    when: computedWhen,
    isoDate: nextIso,
    time: nextTime,
    note: patch.note ?? existing.note,
  };
  const actionKey = `reminder:update:${id}:${updated.when}:${updated.title}`;
  if (state.processedActionKeys.includes(actionKey)) return state;

  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "reminder_updated",
    at: nowIso,
    title: `Zmieniono przypomnienie: ${updated.title}`,
    meta: updated.when,
    glyph: "calendar",
    targetView: updated.targetView,
    targetId: updated.targetId,
  };

  return {
    ...state,
    reminders: state.reminders.map((item) => (item.id === id ? updated : item)),
    events: [event, ...state.events],
    processedActionKeys: [...state.processedActionKeys, actionKey],
  };
}

export function applyRemoveReminder(
  state: OneFlowPersisted,
  id: string,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const existing = state.reminders.find((item) => item.id === id);
  if (!existing) return state;
  const actionKey = `reminder:remove:${id}:${nowIso}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "reminder_removed",
    at: nowIso,
    title: `Usunięto przypomnienie: ${existing.title}`,
    meta: "Usunięto z lokalnego kalendarza prototypu",
    glyph: "calendar",
    targetView: existing.targetView,
    targetId: existing.targetId,
  };
  return {
    ...state,
    reminders: state.reminders.filter((item) => item.id !== id),
    events: [event, ...state.events],
    processedActionKeys: state.processedActionKeys.filter((k) => k !== `reminder:create:${id}`),
  };
}

export function applyJourneyChoice(
  state: OneFlowPersisted,
  journeyId: string,
  key: string,
  value: string,
): OneFlowPersisted {
  const prev = state.journeys[journeyId] ?? { step: 0, choices: {}, done: false };
  return {
    ...state,
    journeys: {
      ...state.journeys,
      [journeyId]: {
        ...prev,
        choices: { ...prev.choices, [key]: value },
      },
    },
  };
}

export function applyJourneyStep(
  state: OneFlowPersisted,
  journeyId: string,
  step: number,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const journey = JOURNEYS.find((item) => item.id === journeyId);
  const clamped = journey ? Math.max(0, Math.min(step, journey.steps.length - 1)) : Math.max(0, step);
  const prev = state.journeys[journeyId] ?? { step: 0, choices: {}, done: false };
  const actionKey = `journey:step:${journeyId}:${clamped}`;
  const shouldLog = journey && clamped > prev.step && !state.processedActionKeys.includes(actionKey);
  const nextEvents = shouldLog
    ? [
        {
          id: `evt-${actionKey}`,
          actionKey,
          type: "journey_step" as const,
          at: nowIso,
          title: `Postęp ścieżki: ${journey.title}`,
          meta: `Krok ${clamped + 1} z ${journey.steps.length}: ${journey.steps[clamped]?.title ?? ""}`,
          glyph: journey.glyph,
          targetView: "zdarzenie" as const,
          targetId: journey.id,
        },
        ...state.events,
      ]
    : state.events;

  return {
    ...state,
    journeys: {
      ...state.journeys,
      [journeyId]: { ...prev, step: clamped, done: false, updatedAt: nowIso },
    },
    events: nextEvents,
    processedActionKeys: shouldLog ? [...state.processedActionKeys, actionKey] : state.processedActionKeys,
  };
}

export function applyFinishJourney(
  state: OneFlowPersisted,
  journeyId: string,
  nowIso = new Date().toISOString(),
  explicitActionKey?: string,
): OneFlowPersisted {
  const journey = JOURNEYS.find((item) => item.id === journeyId);
  if (!journey) return state;
  const prev = state.journeys[journeyId] ?? { step: journey.steps.length - 1, choices: {}, done: false };
  // Enforce completion check: every step with options must have a chosen option.
  for (const step of journey.steps) {
    if (step.options && !prev.choices[step.id]) {
      return state;
    }
  }
  const choiceSignature = Object.entries(prev.choices)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const actionKey = explicitActionKey ?? `journey:finish:${journeyId}:${choiceSignature}`;
  if (prev.done && state.processedActionKeys.includes(actionKey)) {
    return state;
  }

  const code = receiptCodeFromKey(actionKey);
  const receipt: SimulatedReceipt = {
    id: `rcpt-${actionKey}`,
    code,
    title: `Zapis ścieżki: ${journey.title}`,
    institution: journey.office,
    createdAt: nowIso,
    summary: `Zapisano postęp i powiązano ze sprawą w prototypie. Żaden wniosek nie został wysłany do urzędu.`,
    actionKey,
    targetView: "sprawa",
    targetId: journey.caseId,
    note: "Symulowane potwierdzenie lokalne (UPO-WZÓR). Możesz wrócić do sprawy w każdej chwili.",
  };

  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "journey_completed",
    at: nowIso,
    title: `Zapisano ścieżkę: ${journey.title}`,
    meta: `${journey.office} · ${code} (symulacja)`,
    glyph: journey.glyph,
    targetView: "sprawa",
    targetId: journey.caseId,
    receiptCode: code,
    actor: "Zofia Baran (lokalnie)",
  };

  let nextReminders = state.reminders;
  if (journeyId === "paszport" && !state.reminders.some((r) => r.id === "paszport-wymiana")) {
    nextReminders = [
      {
        id: "paszport-wymiana",
        title: "Zaplanuj wymianę paszportu (NX 184220)",
        when: "14 stycznia 2027 (3 mies. przed wygaśnięciem)",
        isoDate: "2027-01-14",
        serviceId: "zalatw",
        targetView: "sprawa",
        targetId: journey.caseId,
        createdAt: nowIso,
      },
      ...nextReminders,
    ];
  }

  return {
    ...state,
    journeys: {
      ...state.journeys,
      [journeyId]: { ...prev, step: journey.steps.length - 1, done: true, updatedAt: nowIso },
    },
    reminders: nextReminders,
    receipts: [receipt, ...state.receipts.filter((r) => r.actionKey !== actionKey)],
    events: [event, ...state.events.filter((e) => e.actionKey !== actionKey)],
    processedActionKeys: state.processedActionKeys.includes(actionKey)
      ? state.processedActionKeys
      : [...state.processedActionKeys, actionKey],
  };
}

export function applySaveActionPlan(
  state: OneFlowPersisted,
  plan: ActionPlan,
  nowIso = new Date().toISOString(),
): { state: OneFlowPersisted; caseId: string } {
  const caseId = `plan-${plan.id}`;
  const actionKey = `plan:save:${plan.id}`;
  if (state.savedPlans[caseId] && state.processedActionKeys.includes(actionKey)) {
    return { state, caseId };
  }
  const code = receiptCodeFromKey(actionKey);
  const savedCase: SavedPlanCase = {
    id: caseId,
    planId: plan.id,
    title: plan.title,
    query: plan.query,
    intents: plan.intents,
    createdAt: nowIso,
    updatedAt: nowIso,
    tasks: plan.tasks,
    completedTaskIds: [],
    facts: plan.facts,
    interpretations: plan.interpretations,
    reusedData: plan.reusedData,
    missingInfo: plan.missingInfo,
    personaId: plan.personaId ?? state.activePersona,
  };
  const receipt: SimulatedReceipt = {
    id: `rcpt-${actionKey}`,
    code,
    title: `Zapisano plan działania: ${plan.title}`,
    institution: "OneFlow (plan lokalny)",
    createdAt: nowIso,
    summary: `Zapisano ${plan.tasks.length} powiązanych zadań na tym urządzeniu. To nie jest złożenie wniosków w urzędach.`,
    actionKey,
    targetView: "sprawa",
    targetId: caseId,
    note: "Plan pozostaje zapisany w Moich sprawach — możesz odhaczać zadania i wrócić później.",
  };
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "plan_saved",
    at: nowIso,
    title: `Utworzono plan: ${plan.title}`,
    meta: `${plan.tasks.length} zadań · ${code}`,
    glyph: "orbit",
    targetView: "sprawa",
    targetId: caseId,
    receiptCode: code,
    actor: "Zofia Baran (lokalnie)",
  };

  return {
    caseId,
    state: {
      ...state,
      savedPlans: { ...state.savedPlans, [caseId]: savedCase },
      receipts: [receipt, ...state.receipts],
      events: [event, ...state.events],
      processedActionKeys: [...state.processedActionKeys, actionKey],
    },
  };
}

export function applyTogglePlanTask(
  state: OneFlowPersisted,
  caseId: string,
  taskId: string,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const saved = state.savedPlans[caseId];
  if (!saved) return state;
  const task = saved.tasks.find((item) => item.id === taskId);
  if (!task) return state;
  const wasDone = saved.completedTaskIds.includes(taskId);
  const completedTaskIds = wasDone
    ? saved.completedTaskIds.filter((id) => id !== taskId)
    : [...saved.completedTaskIds, taskId];

  const actionKey = `plan:task:${caseId}:${taskId}:${wasDone ? "open" : "done"}:${completedTaskIds.length}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "plan_task_toggled",
    at: nowIso,
    title: wasDone ? `Przywrócono zadanie: ${task.title}` : `Odhaczono zadanie: ${task.title}`,
    meta: `${saved.title} (${completedTaskIds.length}/${saved.tasks.length})`,
    glyph: wasDone ? "case" : "check",
    targetView: "sprawa",
    targetId: caseId,
  };

  return {
    ...state,
    savedPlans: {
      ...state.savedPlans,
      [caseId]: {
        ...saved,
        completedTaskIds,
        updatedAt: nowIso,
      },
    },
    events: [event, ...state.events],
  };
}

export function applyLockPesel(
  state: OneFlowPersisted,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const actionKey = "pesel:lock";
  if (state.peselLocked && state.processedActionKeys.includes(actionKey)) return state;
  const code = receiptCodeFromKey(actionKey);
  const receipt: SimulatedReceipt = {
    id: `rcpt-${actionKey}`,
    code,
    title: "Zastrzeżenie numeru PESEL (symulacja)",
    institution: "Rejestr zastrzeżeń PESEL — wzór",
    createdAt: nowIso,
    summary: "Zmieniono status numeru PESEL wyłącznie w tym prototypie. W prawdziwej sytuacji zastrzeż PESEL na gov.pl lub w mObywatelu.",
    actionKey,
    targetView: "bezpieczenstwo",
    note: "Symulacja lokalna (UPO-WZÓR). Nie wpływa na banki ani instytucje finansowe.",
  };
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "pesel_locked",
    at: nowIso,
    title: "Zastrzeżono numer PESEL (symulacja)",
    meta: `Ochrona tożsamości · ${code}`,
    glyph: "key",
    targetView: "bezpieczenstwo",
    receiptCode: code,
    actor: "Zofia Baran (lokalnie)",
  };
  return {
    ...state,
    peselLocked: true,
    receipts: [receipt, ...state.receipts],
    events: [event, ...state.events],
    processedActionKeys: state.processedActionKeys.includes(actionKey)
      ? state.processedActionKeys
      : [...state.processedActionKeys, actionKey],
  };
}

export function applyReportLost(
  state: OneFlowPersisted,
  docId: string,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const doc = DOCUMENTS.find((item) => item.id === docId);
  if (!doc) return state;
  const actionKey = `doc:lost:${docId}`;
  if (state.lost.includes(docId) && state.processedActionKeys.includes(actionKey)) return state;
  const code = receiptCodeFromKey(actionKey);
  const nextShares = Object.fromEntries(Object.entries(state.shares).filter(([key]) => key !== docId));
  const receipt: SimulatedReceipt = {
    id: `rcpt-${actionKey}`,
    code,
    title: `Zgłoszenie utraty dokumentu: ${doc.title} (symulacja)`,
    institution: "Ochrona tożsamości — prototyp",
    createdAt: nowIso,
    summary: `Oznaczono wzór ${doc.title} (${doc.series}) jako utracony i wyłączono lokalny podgląd. Prawdziwy dokument unieważnisz na gov.pl lub w urzędzie gminy.`,
    actionKey,
    targetView: "dokument",
    targetId: docId,
    note: "Symulacja lokalna (UPO-WZÓR). Nie wysyła zgłoszenia do urzędu ani banku.",
  };
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "doc_lost",
    at: nowIso,
    title: `Zgłoszono utratę: ${doc.title}`,
    meta: `${doc.series} · ${code} (symulacja)`,
    glyph: "alert",
    targetView: "dokument",
    targetId: docId,
    receiptCode: code,
    actor: "Zofia Baran (lokalnie)",
  };
  return {
    ...state,
    lost: state.lost.includes(docId) ? state.lost : [...state.lost, docId],
    shares: nextShares,
    receipts: [receipt, ...state.receipts],
    events: [event, ...state.events],
    processedActionKeys: state.processedActionKeys.includes(actionKey)
      ? state.processedActionKeys
      : [...state.processedActionKeys, actionKey],
  };
}

export function applyShareDoc(
  state: OneFlowPersisted,
  docId: string,
  minutes: number,
  nowMs = Date.now(),
): OneFlowPersisted {
  const doc = DOCUMENTS.find((item) => item.id === docId);
  if (!doc || state.lost.includes(docId)) return state;
  const expiresAt = nowMs + minutes * 60_000;
  const nowIso = new Date(nowMs).toISOString();
  const actionKey = `doc:share:${docId}:${expiresAt}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "doc_shared",
    at: nowIso,
    title: `Włączono lokalny podgląd: ${doc.title}`,
    meta: `Na ${minutes} min · tylko w tym prototypie (bez kodu QR)`,
    glyph: "share",
    targetView: "dokument",
    targetId: docId,
    actor: "Zofia Baran (lokalnie)",
  };
  return {
    ...state,
    shares: { ...state.shares, [docId]: expiresAt },
    events: [event, ...state.events],
  };
}

export function applyRevokeShare(
  state: OneFlowPersisted,
  docId: string,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  if (!state.shares[docId]) return state;
  const doc = DOCUMENTS.find((item) => item.id === docId);
  const shares = { ...state.shares };
  delete shares[docId];
  const actionKey = `doc:revoke:${docId}:${nowIso}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "doc_share_revoked",
    at: nowIso,
    title: `Wyłączono podgląd: ${doc?.title ?? docId}`,
    meta: "Zakończono ręcznie w prototypie",
    glyph: "lock",
    targetView: "dokument",
    targetId: docId,
    actor: "Zofia Baran (lokalnie)",
  };
  return {
    ...state,
    shares,
    events: [event, ...state.events],
  };
}

export function pruneExpiredShares(
  shares: Record<string, number>,
  nowMs = Date.now(),
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [docId, until] of Object.entries(shares)) {
    if (until > nowMs) next[docId] = until;
  }
  return next;
}

export function selectActiveShare(
  shares: Record<string, number>,
  docId: string,
  nowMs = Date.now(),
): { active: boolean; expiresAt?: number; minutesRemaining: number } {
  const until = shares[docId];
  if (!until || until <= nowMs) {
    return { active: false, minutesRemaining: 0 };
  }
  return {
    active: true,
    expiresAt: until,
    minutesRemaining: minutesLeft(until, nowMs),
  };
}

export function applySetTrusted(
  state: OneFlowPersisted,
  trustedOn: boolean,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  if (state.trustedOn === trustedOn) return state;
  const actionKey = `trusted:${trustedOn ? "on" : "off"}:${nowIso}`;
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "trusted_changed",
    at: nowIso,
    title: trustedOn ? "Włączono osobę zaufaną (prototyp)" : "Wyłączono osobę zaufaną (prototyp)",
    meta: "Marek Julian Baran · nie dotyczy upoważnienia w mojeIKP",
    glyph: "trusted",
    targetView: "zaufana",
    actor: "Zofia Baran (lokalnie)",
  };
  return {
    ...state,
    trustedOn,
    events: [event, ...state.events],
  };
}

export function applySendMealAsk(
  state: OneFlowPersisted,
  nowIso = new Date().toISOString(),
): OneFlowPersisted {
  const actionKey = "benefit:meal-ask";
  if (state.mealSent || !state.mealAsk.trim() || state.processedActionKeys.includes(actionKey)) {
    return state;
  }
  const code = receiptCodeFromKey(actionKey);
  const event: OneFlowEvent = {
    id: `evt-${actionKey}`,
    actionKey,
    type: "benefit_question_saved",
    at: nowIso,
    title: "Zapisano pytanie o dofinansowanie obiadów",
    meta: `Szkoła Podstawowa nr 48 · ${code} (szkic lokalny)`,
    glyph: "support",
    targetView: "wsparcie",
    receiptCode: code,
  };
  return {
    ...state,
    mealSent: true,
    events: [event, ...state.events],
    processedActionKeys: [...state.processedActionKeys, actionKey],
  };
}

/* ============================================================================
 * CANONICAL SELECTORS — Single source of truth across all 5 hubs & Home
 * ========================================================================== */

function buildLinksForCase(item: CaseItem): EntityLink[] {
  const links: EntityLink[] = [];
  for (const letterId of item.relatedLetterIds ?? []) {
    const letter = LETTERS.find((l) => l.id === letterId);
    if (letter) {
      links.push({
        id: `link-letter-${letter.id}`,
        label: `Pismo: ${letter.subject}`,
        meta: letter.from,
        glyph: "letter",
        view: "pismo",
        selectedId: letter.id,
      });
    }
  }
  for (const docId of item.relatedDocIds ?? []) {
    const doc = DOCUMENTS.find((d) => d.id === docId);
    if (doc) {
      links.push({
        id: `link-doc-${doc.id}`,
        label: `Dokument: ${doc.title}`,
        meta: doc.series,
        glyph: doc.glyph,
        view: "dokument",
        selectedId: doc.id,
      });
    }
  }
  if (item.relatedServiceId) {
    const svc = serviceById(item.relatedServiceId);
    if (svc) {
      links.push({
        id: `link-svc-${svc.id}`,
        label: `Usługa: ${svc.name}`,
        meta: svc.description,
        glyph: svc.glyph,
        view: svc.view,
        selectedId: svc.selectedId,
      });
    }
  }
  return links;
}

export function isPlanTaskAutoCompleted(
  task: ActionPlanTask,
  state: OneFlowPersisted,
): boolean {
  const rule = task.autoCompleteWhen;
  if (!rule) return false;
  switch (rule.type) {
    case "pesel_locked":
      return state.peselLocked;
    case "doc_lost":
      return state.lost.includes(rule.docId);
    case "letter_replied":
      return Boolean(state.replies[rule.letterId]);
    case "reminder_exists":
      return state.reminders.some((rem) => rem.id === rule.reminderId);
    case "journey_done":
      return Boolean(state.journeys[rule.journeyId]?.done);
    case "trusted_on":
      return state.trustedOn;
    default:
      return false;
  }
}

export function evaluatePlanTasks(
  plan: Pick<SavedPlanCase, "tasks" | "completedTaskIds">,
  state: OneFlowPersisted,
): EvaluatedPlanTask[] {
  const doneById = new Map<string, boolean>();
  const serviceDoneById = new Map<string, boolean>();
  for (const task of plan.tasks) {
    const byService = isPlanTaskAutoCompleted(task, state);
    const done = byService || plan.completedTaskIds.includes(task.id);
    serviceDoneById.set(task.id, byService);
    doneById.set(task.id, done);
  }
  const titleById = new Map(plan.tasks.map((t) => [t.id, t.title]));
  return plan.tasks.map((task) => {
    const completedByService = Boolean(serviceDoneById.get(task.id));
    const done = Boolean(doneById.get(task.id));
    const blockedByTitles = (task.blockedByTaskIds ?? [])
      .filter((depId) => !doneById.get(depId))
      .map((depId) => titleById.get(depId) ?? depId);
    return {
      ...task,
      done,
      completedByService,
      blockedByTitles,
      isBlocked: !done && blockedByTitles.length > 0,
    };
  });
}

export function evaluatePlanFacts(
  plan: SavedPlanCase,
  state: OneFlowPersisted,
): string[] {
  return plan.facts.map((fact) => {
    if (fact.includes("Numer PESEL nie jest obecnie zastrzeżony") && state.peselLocked) {
      return "Numer PESEL jest już zastrzeżony w tym prototypie (potwierdzenie UPO-WZÓR).";
    }
    if (fact.includes("Wzór mDowodu jest nadal aktywny") && state.lost.includes("dowod")) {
      return "Utrata wzoru mDowodu została już zgłoszona lokalnie w module Ochrona tożsamości.";
    }
    if (fact.includes("czeka pismo KR/2026/4412 wymagające odpowiedzi") && state.replies.komunikacja) {
      return "Na pismo KR/2026/4412 zapisano już odpowiedź w prototypie (z potwierdzeniem UPO-WZÓR).";
    }
    return fact;
  });
}

export function applyStartDemoStory(
  state: OneFlowPersisted,
  storyId: DemoStoryId,
): OneFlowPersisted {
  const story = demoStoryById(storyId);
  if (!story) return state;
  const fresh = createFreshPersisted();
  return {
    ...fresh,
    onboarded: true,
    theme: state.theme,
    motion: state.motion,
    dayMode: state.dayMode,
    mode: story.recommendedMode,
    textScale: story.recommendedScale,
    activePersona: story.personaId,
    demoStoryId: story.id,
    view: "start",
    selectedId: undefined,
    stack: [],
  };
}

export function applyExitDemoMode(state: OneFlowPersisted): OneFlowPersisted {
  const fresh = createFreshPersisted();
  return {
    ...fresh,
    onboarded: true,
    theme: state.theme,
    motion: state.motion,
    dayMode: state.dayMode,
    mode: "daily",
    textScale: 1,
    activePersona: "default",
    demoStoryId: null,
    view: "start",
    selectedId: undefined,
    stack: [],
  };
}

export function selectDerivedCases(state: OneFlowPersisted): DerivedCase[] {
  const result: DerivedCase[] = [];

  // 1. Saved Orbit Action Plans (newest first, reactively synced with live OneFlow transitions)
  const planList = Object.values(state.savedPlans).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  for (const saved of planList) {
    const evaluatedTasks = evaluatePlanTasks(saved, state);
    const doneCount = evaluatedTasks.filter((t) => t.done).length;
    const autoCount = evaluatedTasks.filter((t) => t.completedByService).length;
    const total = evaluatedTasks.length;
    const allDone = total > 0 && doneCount >= total;
    const receipts = state.receipts.filter((r) => r.targetId === saved.id);
    const events = state.events.filter((e) => e.targetId === saved.id);
    const steps: CaseItem["steps"] = evaluatedTasks.map((task) => ({
      label: `${task.title} (${task.institution})`,
      state: task.done ? "done" : task.isBlocked ? "next" : "now",
    }));
    const links: EntityLink[] = [];
    const seen = new Set<string>();
    for (const task of evaluatedTasks) {
      if (task.targetView) {
        const key = `${task.targetView}:${task.targetId ?? ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          links.push({
            id: `plan-link-${task.id}`,
            label: task.title,
            meta: task.institution,
            glyph: task.kind === "health_info" ? "health" : task.kind === "potential_benefit" ? "support" : "case",
            view: task.targetView,
            selectedId: task.targetId,
          });
        }
      }
    }

    result.push({
      id: saved.id,
      title: saved.title,
      office: "Wspólny plan działania (OneFlow)",
      status: allDone ? "odpowiedź zapisana (wzór)" : "w toku",
      updated: saved.updatedAt.slice(0, 10),
      summary: `Zapisany plan wielowątkowy (${doneCount} z ${total} zadań ukończonych${autoCount > 0 ? `, w tym ${autoCount} zrealizowane w usługach` : ""}). Dane z mDowodu użyte raz; prototyp nie składa wniosków w urzędach.`,
      steps,
      relatedDocIds: ["dowod"],
      dependencies: saved.missingInfo.length > 0 ? saved.missingInfo : undefined,
      receipts,
      events,
      relatedLinks: links,
      isPlanCase: true,
      planCase: saved,
      evaluatedTasks,
      evaluatedFacts: evaluatePlanFacts(saved, state),
    });
  }

  // 2. Journey-backed dynamic cases (e.g., szkoła, paszport, start-krakow) if started or answered
  for (const journey of JOURNEYS) {
    const alreadyBase = CASES.some((c) => c.id === journey.caseId);
    if (alreadyBase) continue;
    const prog = state.journeys[journey.id];
    const relatedLetterReplied = journey.relatedLetterId ? Boolean(state.replies[journey.relatedLetterId]) : false;
    if (!prog && !relatedLetterReplied) continue;

    const receipts = state.receipts.filter(
      (r) => r.targetId === journey.caseId || (journey.relatedLetterId && r.targetId === journey.relatedLetterId),
    );
    const events = state.events.filter(
      (e) =>
        e.targetId === journey.caseId ||
        e.targetId === journey.id ||
        (journey.relatedLetterId && e.targetId === journey.relatedLetterId),
    );

    const status: CaseItem["status"] = prog?.done || relatedLetterReplied ? "odpowiedź zapisana (wzór)" : "w toku";
    const steps: CaseItem["steps"] = journey.steps.map((s, idx) => ({
      label: s.title,
      state: prog?.done
        ? "done"
        : prog && idx < prog.step
          ? "done"
          : prog && idx === prog.step
            ? "now"
            : relatedLetterReplied && idx === 0
              ? "done"
              : "next",
    }));

    const item: CaseItem = {
      id: journey.caseId,
      title: journey.title,
      office: journey.office,
      status,
      updated: (prog?.updatedAt ?? events[0]?.at ?? "2026-11-25").slice(0, 10),
      summary: prog?.done
        ? "Ścieżka została zapisana w prototypie. Żaden wniosek nie trafił do prawdziwego urzędu."
        : relatedLetterReplied
          ? "Zapisano odpowiedź na powiązane pismo w prototypie. Nie jest to oficjalna decyzja urzędu."
          : journey.lede,
      steps,
      journeyId: journey.id,
      relatedLetterIds: journey.relatedLetterId ? [journey.relatedLetterId] : undefined,
      relatedDocIds: journey.relatedDocIds,
      relatedServiceId: journey.relatedServiceId,
      dependencies: journey.dependencies,
    };
    result.push({
      ...item,
      receipts,
      events,
      relatedLinks: buildLinksForCase(item),
    });
  }

  // 3. Base cases enriched with live replies, journeys, receipts, and events
  for (const base of CASES) {
    let status = base.status;
    let summary = base.summary;
    let updated = base.updated;
    let steps = base.steps.map((s) => ({ ...s }));

    const letterReplied = Boolean(base.relatedLetterIds?.some((lid) => Boolean(state.replies[lid])));
    const journeyProg = base.journeyId ? state.journeys[base.journeyId] : undefined;

    if (base.id === "rejestracja") {
      if (letterReplied && journeyProg?.done) {
        status = "odpowiedź zapisana (wzór)";
        summary =
          "Odpowiedź w sprawie KR/2026/4412 i wybór odbioru zostały zapisane w prototypie. Urząd nie otrzymał jeszcze realnego dokumentu — to nie jest decyzja końcowa.";
        updated = (journeyProg.updatedAt ?? "2026-11-25").slice(0, 10);
        steps = [
          { label: "Wniosek przyjęty", state: "done" },
          { label: "Odpowiedź zapisana w prototypie (KR/2026/4412)", state: "done" },
          { label: "Odbiór zaplanowany lokalnie — czeka na prawdziwą wizytę", state: "now" },
        ];
      } else if (letterReplied) {
        status = "odpowiedź zapisana (wzór)";
        summary =
          "Zapisano odpowiedź na pismo KR/2026/4412 w prototypie. Możesz też zaplanować odbiór w ścieżce pojazdu. To nie jest oficjalne rozstrzygnięcie urzędu.";
        const replyEvt = state.events.find((e) => e.actionKey === "reply:komunikacja");
        updated = (replyEvt?.at ?? "2026-11-25").slice(0, 10);
        steps = [
          { label: "Wniosek przyjęty", state: "done" },
          { label: "Odpowiedź zapisana w prototypie (KR/2026/4412)", state: "done" },
          { label: "Odbiór dokumentu w wydziale", state: "now" },
        ];
      } else if (journeyProg?.done) {
        status = "w toku";
        summary =
          "Wybór punktu odbioru zapisano lokalnie, ale pismo KR/2026/4412 nadal czeka na odpowiedź w e-Doręczeniach.";
        updated = (journeyProg.updatedAt ?? "2026-11-25").slice(0, 10);
      }
    }

    const receipts = state.receipts.filter(
      (r) =>
        r.targetId === base.id ||
        (base.relatedLetterIds && r.targetId && base.relatedLetterIds.includes(r.targetId)),
    );
    const events = state.events.filter(
      (e) =>
        e.targetId === base.id ||
        (base.journeyId && e.targetId === base.journeyId) ||
        (base.relatedLetterIds && e.targetId && base.relatedLetterIds.includes(e.targetId)),
    );

    const enriched: CaseItem = {
      ...base,
      status,
      summary,
      updated,
      steps,
    };

    result.push({
      ...enriched,
      receipts,
      events,
      relatedLinks: buildLinksForCase(enriched),
    });
  }

  return result;
}

export function selectCaseById(state: OneFlowPersisted, id: string): DerivedCase | undefined {
  return selectDerivedCases(state).find((item) => item.id === id);
}

/**
 * Fixes the stale home-screen priority bug:
 * NEVER falls back to an already-answered letter (`waiting[0] ?? LETTERS.find(...)`).
 * Derives priority strictly from unresolved citizen tasks.
 */
export function selectHomePriority(state: OneFlowPersisted): HomePriority | null {
  const unresolvedLetters = LETTERS.filter(
    (letter) => letterStatus(letter, state.readIds, state.replies) === "wymaga odpowiedzi",
  );
  if (unresolvedLetters.length > 0) {
    const lead = unresolvedLetters[0];
    return {
      id: `priority-letter-${lead.id}`,
      kicker: "Masz pismo wymagające odpowiedzi",
      title: lead.subject,
      meta: `${lead.from}${lead.deadlineNote ? ` · ${lead.deadlineNote}` : ""}`,
      targetView: "pismo",
      targetId: lead.id,
      kind: "letter",
    };
  }

  const openPlan = Object.values(state.savedPlans).find((plan) => {
    const evals = evaluatePlanTasks(plan, state);
    return evals.some((task) => !task.done);
  });
  if (openPlan) {
    const evals = evaluatePlanTasks(openPlan, state);
    const left = evals.filter((task) => !task.done).length;
    return {
      id: `priority-plan-${openPlan.id}`,
      kicker: "Wróć do swojej sprawy",
      title: openPlan.title,
      meta:
        left === 1
          ? "Pozostało 1 zadanie do sprawdzenia"
          : left < 5
            ? `Pozostały ${left} zadania do sprawdzenia`
            : `Pozostało ${left} zadań do sprawdzenia`,
      targetView: "sprawa",
      targetId: openPlan.id,
      kind: "plan",
    };
  }

  return null;
}

export function selectUnifiedTimeline(state: OneFlowPersisted): UnifiedTimelineItem[] {
  const items: UnifiedTimelineItem[] = [];

  for (const rem of state.reminders) {
    items.push({
      id: `rem-${rem.id}`,
      sortAt: rem.isoDate ? `${rem.isoDate}T${rem.time ?? "09:00"}:00.000Z` : rem.createdAt,
      dateLabel: rem.when,
      title: rem.title,
      meta: `Twoje przypomnienie${rem.note ? ` · ${rem.note}` : ""}`,
      glyph: rem.serviceId === "ikp" ? "health" : "calendar",
      source: "reminder",
      targetView: rem.targetView,
      targetId: rem.targetId,
      reminderId: rem.id,
    });
  }

  for (const evt of state.events) {
    items.push({
      id: evt.id,
      sortAt: evt.at,
      dateLabel: formatEventTime(evt.at),
      title: evt.title,
      meta: evt.meta,
      glyph: evt.glyph,
      source: "event",
      targetView: evt.targetView,
      targetId: evt.targetId,
      receiptCode: evt.receiptCode,
    });
  }

  for (const base of TIMELINE) {
    items.push({
      id: base.id,
      sortAt: `${base.date}T00:00:00.000Z`,
      dateLabel: plDate(base.date),
      title: base.title,
      meta: `${base.meta} · historia ze wzoru`,
      glyph: base.glyph,
      source: "baseline",
      targetView: base.targetView,
      targetId: base.targetId,
    });
  }

  return items.sort((a, b) => b.sortAt.localeCompare(a.sortAt));
}

export function selectContextualNotifications(
  state: OneFlowPersisted,
  nowMs = Date.now(),
): ContextualNotification[] {
  const out: ContextualNotification[] = [];

  for (const docId of state.lost) {
    const doc = DOCUMENTS.find((d) => d.id === docId);
    if (doc) {
      out.push({
        id: `notif-lost-${doc.id}`,
        tone: "bad",
        kicker: "Utrata dokumentu (symulacja)",
        title: `Zgłoszono utratę: ${doc.title}`,
        meta: state.peselLocked
          ? "PESEL jest również zastrzeżony w prototypie"
          : "Rozważ zastrzeżenie numeru PESEL i kontakt z bankiem",
        glyph: "alert",
        targetView: "bezpieczenstwo",
      });
    }
  }

  for (const [docId, until] of Object.entries(state.shares)) {
    if (until > nowMs) {
      const doc = DOCUMENTS.find((d) => d.id === docId);
      if (doc) {
        out.push({
          id: `notif-share-${doc.id}`,
          tone: "info",
          kicker: "Aktywny podgląd lokalny",
          title: `${doc.title} — jeszcze ${minutesLeft(until, nowMs)} min`,
          meta: "Działa tylko w tej przeglądarce; możesz go wyłączyć",
          glyph: "share",
          targetView: "dokument",
          targetId: doc.id,
        });
      }
    }
  }

  const unanswered = LETTERS.filter(
    (l) => letterStatus(l, state.readIds, state.replies) === "wymaga odpowiedzi",
  );
  if (unanswered.length > 0) {
    out.push({
      id: "notif-letters",
      tone: "warn",
      kicker: "e-Doręczenia",
      title:
        unanswered.length === 1
          ? `1 pismo czeka na odpowiedź: ${unanswered[0].subject}`
          : `${unanswered.length} pisma czekają na odpowiedź`,
      meta: "Zobacz wyjaśnienie po ludzku i zapisz odpowiedź w prototypie",
      glyph: "letter",
      targetView: unanswered.length === 1 ? "pismo" : "pisma",
      targetId: unanswered.length === 1 ? unanswered[0].id : undefined,
    });
  }

  if (state.reminders.length > 0) {
    const first = state.reminders[0];
    out.push({
      id: `notif-rem-${first.id}`,
      tone: "ok",
      kicker: "Przypomnienie",
      title: first.title,
      meta: first.when,
      glyph: first.serviceId === "ikp" ? "health" : "calendar",
      targetView: "os",
    });
  }

  return out;
}

export function selectAccessTransparencyLog(state: OneFlowPersisted): AccessEvent[] {
  const liveEntries: AccessEvent[] = state.events
    .filter((evt) =>
      ["doc_shared", "doc_share_revoked", "doc_lost", "pesel_locked", "letter_replied", "trusted_changed"].includes(
        evt.type,
      ),
    )
    .map((evt) => ({
      id: `acc-${evt.id}`,
      at: formatEventTime(evt.at),
      who: evt.actor ?? "Zofia Baran (lokalnie)",
      what: evt.title,
      why: evt.meta,
      source: "local" as const,
    }));
  return [...liveEntries, ...ACCESS];
}

export function selectLetterReceipt(
  state: OneFlowPersisted,
  letterId: string,
): SimulatedReceipt | undefined {
  return state.receipts.find((r) => r.actionKey === `reply:${letterId}` || r.targetId === letterId);
}

export function selectRelatedLinksForLetter(letter: LetterItem): EntityLink[] {
  const links: EntityLink[] = [];
  if (letter.relatedCaseId) {
    const baseCase = CASES.find((c) => c.id === letter.relatedCaseId);
    links.push({
      id: `l-case-${letter.relatedCaseId}`,
      label: `Powiązana sprawa: ${baseCase?.title ?? letter.subject}`,
      meta: "Zobacz status, kroki i potwierdzenia",
      glyph: "case",
      view: "sprawa",
      selectedId: letter.relatedCaseId,
    });
  }
  if (letter.relatedServiceId) {
    const svc = serviceById(letter.relatedServiceId);
    if (svc) {
      links.push({
        id: `l-svc-${svc.id}`,
        label: `Usługa: ${svc.name}`,
        meta: svc.description,
        glyph: svc.glyph,
        view: svc.view,
        selectedId: svc.selectedId,
      });
    }
  }
  for (const docId of letter.relatedDocIds ?? []) {
    const doc = DOCUMENTS.find((d) => d.id === docId);
    if (doc) {
      links.push({
        id: `l-doc-${doc.id}`,
        label: `Dokument: ${doc.title}`,
        meta: doc.series,
        glyph: doc.glyph,
        view: "dokument",
        selectedId: doc.id,
      });
    }
  }
  return links;
}

export function selectRelatedLinksForDoc(docId: string): EntityLink[] {
  const doc = DOCUMENTS.find((d) => d.id === docId);
  if (!doc) return [];
  const links: EntityLink[] = [];
  if (doc.relatedServiceId) {
    const svc = serviceById(doc.relatedServiceId);
    if (svc) {
      links.push({
        id: `d-svc-${svc.id}`,
        label: `Usługa: ${svc.name}`,
        meta: svc.description,
        glyph: svc.glyph,
        view: svc.view,
        selectedId: svc.selectedId,
      });
    }
  }
  for (const caseId of doc.relatedCaseIds ?? []) {
    const c = CASES.find((item) => item.id === caseId);
    if (c) {
      links.push({
        id: `d-case-${c.id}`,
        label: `Sprawa: ${c.title}`,
        meta: c.office,
        glyph: "case",
        view: "sprawa",
        selectedId: c.id,
      });
    }
  }
  if (docId === "paszport") {
    links.push({
      id: "d-journey-paszport",
      label: "Ścieżka: Zaplanuj wymianę paszportu",
      meta: "Krok po kroku przed wygaśnięciem",
      glyph: "passport",
      view: "zdarzenie",
      selectedId: "paszport",
    });
  }
  return links;
}
