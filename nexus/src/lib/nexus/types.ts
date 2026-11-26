import type { GlyphName } from "@/components/nexus/glyph-paths";

export type ThemeName = "porcelain" | "midnight" | "contrast";
export type HomeMode = "simple" | "daily" | "dense";
export type MotionPref = "system" | "reduce";

export type ViewId =
  | "start"
  | "dokumenty"
  | "dokument"
  | "pisma"
  | "pismo"
  | "sprawy"
  | "sprawa"
  | "zalatw"
  | "zdarzenie"
  | "wsparcie"
  | "os"
  | "bezpieczenstwo"
  | "dostepy"
  | "zaufana"
  | "wyglad"
  | "uslugi"
  | "zdrowie"
  | "kierowca"
  | "profil"
  | "urzad"
  | "powiadomienia";

export type HubId = "zdrowie" | "kierowca" | "dokumenty" | "sprawy" | "wsparcie";

export type Motif =
  | "rosette"
  | "fan"
  | "orbits"
  | "lattice"
  | "civic"
  | "manuscript"
  | "staff"
  | "lab";

export type Crumb = { view: ViewId; id?: string };

export type IntentId =
  | "studia"
  | "przeprowadzka"
  | "pierwsza-praca"
  | "zdrowie"
  | "pojazd"
  | "dokumenty"
  | "utrata"
  | "pisma"
  | "wsparcie"
  | "szkola"
  | "paszport"
  | "zaufana"
  | "ustawienia";

export type TaskCategory = "obowiązek" | "zalecenie" | "możliwość";

export type PlanCompletionRule =
  | { type: "pesel_locked" }
  | { type: "doc_lost"; docId: string }
  | { type: "letter_replied"; letterId: string }
  | { type: "reminder_exists"; reminderId: string }
  | { type: "journey_done"; journeyId: string }
  | { type: "trusted_on" };

export type PersonaId = "default" | "student" | "senior";

export type DemoStoryId = "student" | "senior" | "letter" | "wallet";

export type CitizenPersona = {
  id: PersonaId;
  given: string;
  family: string;
  vocative: string;
  pesel: string;
  birth: string;
  birthYear: number;
  birthLabel: string;
  address: string;
  city: string;
  roleLabel: string;
  note: string;
};

export type EntityLink = {
  id: string;
  label: string;
  meta?: string;
  glyph: GlyphName;
  view?: ViewId;
  selectedId?: string;
  externalUrl?: string;
};

export type SimulatedReceipt = {
  id: string;
  code: string;
  title: string;
  institution: string;
  createdAt: string;
  summary: string;
  actionKey: string;
  targetView: ViewId;
  targetId?: string;
  note: string;
};

export type OneFlowEventType =
  | "letter_replied"
  | "case_updated"
  | "journey_step"
  | "journey_completed"
  | "plan_saved"
  | "plan_task_toggled"
  | "reminder_created"
  | "reminder_updated"
  | "reminder_removed"
  | "pesel_locked"
  | "doc_lost"
  | "doc_shared"
  | "doc_share_revoked"
  | "trusted_changed"
  | "benefit_question_saved";

export type OneFlowEvent = {
  id: string;
  actionKey: string;
  type: OneFlowEventType;
  at: string;
  title: string;
  meta: string;
  glyph: GlyphName;
  targetView: ViewId;
  targetId?: string;
  receiptCode?: string;
  actor?: string;
};

export type ReminderItem = {
  id: string;
  title: string;
  when: string;
  isoDate?: string;
  time?: string;
  serviceId?: string;
  targetView: ViewId;
  targetId?: string;
  note?: string;
  createdAt: string;
};

export type ActionPlanTask = {
  id: string;
  intent: IntentId;
  category: TaskCategory;
  title: string;
  purpose: string;
  whyShown: string;
  institution: string;
  dependencies: string[];
  blockedByTaskIds?: string[];
  requiredData: string[];
  missingInfo: string[];
  status: "do zrobienia" | "gotowe" | "wymaga danych";
  officialUrl?: string;
  officialLabel?: string;
  serviceId?: string;
  targetView?: ViewId;
  targetId?: string;
  kind: "task" | "potential_benefit" | "health_info";
  autoCompleteWhen?: PlanCompletionRule;
};

export type ActionPlan = {
  id: string;
  query: string;
  title: string;
  intents: IntentId[];
  summary: string;
  facts: string[];
  interpretations: string[];
  reusedData: { label: string; value: string; source: string }[];
  deduplicatedRequirements: string[];
  missingInfo: string[];
  tasks: ActionPlanTask[];
  createdAt: string;
  personaId?: PersonaId;
};

export type SavedPlanCase = {
  id: string;
  planId: string;
  title: string;
  query: string;
  intents: IntentId[];
  createdAt: string;
  updatedAt: string;
  tasks: ActionPlanTask[];
  completedTaskIds: string[];
  facts: string[];
  interpretations: string[];
  reusedData: { label: string; value: string; source: string }[];
  missingInfo: string[];
  personaId?: PersonaId;
};

export type ContextualNotification = {
  id: string;
  tone: "warn" | "info" | "ok" | "bad";
  kicker: string;
  title: string;
  meta: string;
  glyph: GlyphName;
  targetView: ViewId;
  targetId?: string;
};
