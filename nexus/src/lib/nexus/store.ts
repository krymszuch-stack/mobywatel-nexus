import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayMode } from "./format";
import type { Crumb, HomeMode, MotionPref, ThemeName, ViewId } from "./types";

export type JourneyProgress = {
  step: number;
  choices: Record<string, string>;
  done: boolean;
};

type Persisted = {
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
  reminders: { id: string; title: string; when: string }[];
};

type Live = {
  orbit: boolean;
  more: boolean;
  toast: string | null;
};

type Actions = {
  go: (view: ViewId, id?: string) => void;
  back: () => void;
  tab: (view: ViewId) => void;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: HomeMode) => void;
  setTextScale: (textScale: number) => void;
  setMotion: (motion: MotionPref) => void;
  setDayMode: (dayMode: DayMode) => void;
  finishOnboarding: (mode: HomeMode, theme: ThemeName) => void;
  setOrbit: (orbit: boolean) => void;
  setMore: (more: boolean) => void;
  showToast: (toast: string) => void;
  markRead: (id: string) => void;
  setDraft: (id: string, text: string) => void;
  sendReply: (id: string) => void;
  shareDoc: (id: string, minutes: number) => void;
  revokeShare: (id: string) => void;
  reportLost: (id: string) => void;
  setCaseNote: (id: string, text: string) => void;
  setJourneyChoice: (id: string, key: string, value: string) => void;
  setJourneyStep: (id: string, step: number) => void;
  finishJourney: (id: string) => void;
  setTrusted: (trustedOn: boolean) => void;
  setMealAsk: (mealAsk: string) => void;
  sendMealAsk: () => void;
  lockPesel: () => void;
  addReminder: (id: string, title: string, when: string) => void;
  resetAll: () => void;
};

const fresh = (): Persisted => ({
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
});

let toastTimer = 0;

export const useNexus = create<Persisted & Live & Actions>()(
  persist(
    (set, get) => ({
      ...fresh(),
      orbit: false,
      more: false,
      toast: null,
      go: (view, id) =>
        set((s) => ({
          stack: [...s.stack, { view: s.view, id: s.selectedId }],
          view,
          selectedId: id,
          orbit: false,
          more: false,
        })),
      back: () =>
        set((s) => {
          const prev = s.stack[s.stack.length - 1];
          if (!prev) return { view: "start" as const, selectedId: undefined, stack: [] };
          return { stack: s.stack.slice(0, -1), view: prev.view, selectedId: prev.id };
        }),
      tab: (view) => set({ view, selectedId: undefined, stack: [], more: false, orbit: false }),
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      setTextScale: (textScale) => set({ textScale }),
      setMotion: (motion) => set({ motion }),
      setDayMode: (dayMode) => set({ dayMode }),
      finishOnboarding: (mode, theme) =>
        set({ onboarded: true, mode, theme, view: "start", stack: [], selectedId: undefined }),
      setOrbit: (orbit) => set({ orbit, more: orbit ? false : get().more }),
      setMore: (more) => set({ more, orbit: more ? false : get().orbit }),
      showToast: (toast) => {
        set({ toast });
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => set({ toast: null }), 4200);
      },
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? {} : { readIds: [...s.readIds, id] })),
      setDraft: (id, text) => set((s) => ({ drafts: { ...s.drafts, [id]: text } })),
      sendReply: (id) =>
        set((s) => {
          const text = (s.drafts[id] ?? "").trim();
          if (!text) return {};
          return {
            replies: { ...s.replies, [id]: text },
            readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id],
          };
        }),
      shareDoc: (id, minutes) =>
        set((s) => ({ shares: { ...s.shares, [id]: Date.now() + minutes * 60_000 } })),
      revokeShare: (id) =>
        set((s) => {
          const shares = { ...s.shares };
          delete shares[id];
          return { shares };
        }),
      reportLost: (id) =>
        set((s) => ({
          lost: s.lost.includes(id) ? s.lost : [...s.lost, id],
          shares: Object.fromEntries(Object.entries(s.shares).filter(([key]) => key !== id)),
        })),
      setCaseNote: (id, text) => set((s) => ({ caseNotes: { ...s.caseNotes, [id]: text } })),
      setJourneyChoice: (id, key, value) =>
        set((s) => {
          const prev = s.journeys[id] ?? { step: 0, choices: {}, done: false };
          return {
            journeys: {
              ...s.journeys,
              [id]: { ...prev, choices: { ...prev.choices, [key]: value } },
            },
          };
        }),
      setJourneyStep: (id, step) =>
        set((s) => {
          const prev = s.journeys[id] ?? { step: 0, choices: {}, done: false };
          return { journeys: { ...s.journeys, [id]: { ...prev, step, done: false } } };
        }),
      finishJourney: (id) =>
        set((s) => {
          const prev = s.journeys[id] ?? { step: 0, choices: {}, done: false };
          return { journeys: { ...s.journeys, [id]: { ...prev, done: true } } };
        }),
      setTrusted: (trustedOn) => set({ trustedOn }),
      setMealAsk: (mealAsk) => set({ mealAsk }),
      sendMealAsk: () => set({ mealSent: true }),
      lockPesel: () => set({ peselLocked: true }),
      addReminder: (id, title, when) =>
        set((s) => ({
          reminders: s.reminders.some((item) => item.id === id)
            ? s.reminders
            : [...s.reminders, { id, title, when }],
        })),
      resetAll: () => {
        window.clearTimeout(toastTimer);
        set({ ...fresh(), orbit: false, more: false, toast: null });
      },
    }),
    {
      name: "nexus-pref",
      version: 1,
      partialize: (s) => ({
        onboarded: s.onboarded,
        theme: s.theme,
        mode: s.mode,
        textScale: s.textScale,
        motion: s.motion,
        dayMode: s.dayMode,
        view: s.view,
        selectedId: s.selectedId,
        stack: s.stack,
        readIds: s.readIds,
        drafts: s.drafts,
        replies: s.replies,
        shares: s.shares,
        lost: s.lost,
        caseNotes: s.caseNotes,
        journeys: s.journeys,
        trustedOn: s.trustedOn,
        mealAsk: s.mealAsk,
        mealSent: s.mealSent,
        peselLocked: s.peselLocked,
        reminders: s.reminders,
      }),
    },
  ),
);

export function useNexusHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const finish = () => {
      if (live) setReady(true);
    };
    try {
      if (useNexus.persist.hasHydrated()) finish();
      const unsub = useNexus.persist.onFinishHydration(finish);
      const timer = window.setTimeout(finish, 400);
      return () => {
        live = false;
        unsub();
        window.clearTimeout(timer);
      };
    } catch {
      finish();
      return undefined;
    }
  }, []);
  return ready;
}
