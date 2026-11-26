import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayMode } from "./format";
import {
  applyAddReminder,
  applyExitDemoMode,
  applyFinishJourney,
  applyJourneyChoice,
  applyJourneyStep,
  applyLockPesel,
  applyRemoveReminder,
  applyReportLost,
  applyRevokeShare,
  applySaveActionPlan,
  applySendMealAsk,
  applySendReply,
  applySetTrusted,
  applyShareDoc,
  applyStartDemoStory,
  applyTogglePlanTask,
  applyUpdateReminder,
  createFreshPersisted,
  migratePersistedState,
  pruneExpiredShares,
  STORE_VERSION,
  type JourneyProgress,
  type OneFlowPersisted,
} from "./oneflow";
import type { ActionPlan, DemoStoryId, HomeMode, MotionPref, ThemeName, ViewId } from "./types";

export type { JourneyProgress, OneFlowPersisted };

type Live = {
  orbit: boolean;
  orbitDraft: string;
  more: boolean;
  toast: string | null;
  demoMinimized: boolean;
};

type Actions = {
  go: (view: ViewId, id?: string) => void;
  back: () => void;
  select: (id: string | undefined) => void;
  tab: (view: ViewId) => void;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: HomeMode) => void;
  setTextScale: (textScale: number) => void;
  setMotion: (motion: MotionPref) => void;
  setDayMode: (dayMode: DayMode) => void;
  finishOnboarding: (mode: HomeMode, theme: ThemeName) => void;
  setOrbit: (orbit: boolean, initialQuery?: string) => void;
  setOrbitDraft: (query: string) => void;
  setMore: (more: boolean) => void;
  showToast: (toast: string) => void;
  markRead: (id: string) => void;
  setDraft: (id: string, text: string) => void;
  sendReply: (id: string, actionKey?: string) => void;
  shareDoc: (id: string, minutes: number) => void;
  revokeShare: (id: string) => void;
  pruneShares: () => void;
  reportLost: (id: string) => void;
  setCaseNote: (id: string, text: string) => void;
  setJourneyChoice: (id: string, key: string, value: string) => void;
  setJourneyStep: (id: string, step: number) => void;
  finishJourney: (id: string, actionKey?: string) => void;
  saveActionPlan: (plan: ActionPlan) => string;
  togglePlanTask: (caseId: string, taskId: string) => void;
  setTrusted: (trustedOn: boolean) => void;
  setMealAsk: (mealAsk: string) => void;
  sendMealAsk: () => void;
  lockPesel: () => void;
  addReminder: (
    id: string,
    title: string,
    when: string,
    extra?: {
      isoDate?: string;
      time?: string;
      serviceId?: string;
      targetView?: ViewId;
      targetId?: string;
      note?: string;
    },
  ) => void;
  updateReminder: (
    id: string,
    patch: { title?: string; when?: string; isoDate?: string; time?: string; note?: string },
  ) => void;
  removeReminder: (id: string) => void;
  startDemoStory: (storyId: DemoStoryId) => void;
  resetDemoStory: () => void;
  exitDemoMode: () => void;
  setDemoMinimized: (minimized: boolean) => void;
  resetAll: () => void;
};

let toastTimer = 0;

function pickPersisted(s: OneFlowPersisted): OneFlowPersisted {
  return {
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
    events: s.events,
    receipts: s.receipts,
    savedPlans: s.savedPlans,
    processedActionKeys: s.processedActionKeys,
    activePersona: s.activePersona,
    demoStoryId: s.demoStoryId,
  };
}

export const useNexus = create<OneFlowPersisted & Live & Actions>()(
  persist(
    (set, get) => ({
      ...createFreshPersisted(),
      orbit: false,
      orbitDraft: "",
      more: false,
      toast: null,
      demoMinimized: false,
      go: (view, id) =>
        set((s) => ({
          stack: [...s.stack, { view: s.view, id: s.selectedId }].slice(-20),
          view,
          selectedId: id,
          orbit: false,
          more: false,
        })),
      select: (selectedId) => set({ selectedId }),
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
      setOrbit: (orbit, initialQuery) =>
        set((s) => ({
          orbit,
          orbitDraft: initialQuery !== undefined ? initialQuery : orbit ? s.orbitDraft : "",
          more: orbit ? false : s.more,
        })),
      setOrbitDraft: (orbitDraft) => set({ orbitDraft }),
      setMore: (more) => set({ more, orbit: more ? false : get().orbit }),
      showToast: (toast) => {
        set({ toast });
        if (typeof window !== "undefined") {
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => set({ toast: null }), 4200);
        }
      },
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? {} : { readIds: [...s.readIds, id] })),
      setDraft: (id, text) => set((s) => ({ drafts: { ...s.drafts, [id]: text } })),
      sendReply: (id, actionKey) =>
        set((s) => applySendReply(pickPersisted(s), id, new Date().toISOString(), actionKey)),
      shareDoc: (id, minutes) =>
        set((s) => applyShareDoc(pickPersisted(s), id, minutes, Date.now())),
      revokeShare: (id) =>
        set((s) => applyRevokeShare(pickPersisted(s), id, new Date().toISOString())),
      pruneShares: () =>
        set((s) => {
          const next = pruneExpiredShares(s.shares, Date.now());
          if (Object.keys(next).length === Object.keys(s.shares).length) return {};
          return { shares: next };
        }),
      reportLost: (id) =>
        set((s) => applyReportLost(pickPersisted(s), id, new Date().toISOString())),
      setCaseNote: (id, text) => set((s) => ({ caseNotes: { ...s.caseNotes, [id]: text } })),
      setJourneyChoice: (id, key, value) =>
        set((s) => applyJourneyChoice(pickPersisted(s), id, key, value)),
      setJourneyStep: (id, step) =>
        set((s) => applyJourneyStep(pickPersisted(s), id, step, new Date().toISOString())),
      finishJourney: (id, actionKey) =>
        set((s) => applyFinishJourney(pickPersisted(s), id, new Date().toISOString(), actionKey)),
      saveActionPlan: (plan) => {
        let createdId = `plan-${plan.id}`;
        set((s) => {
          const res = applySaveActionPlan(pickPersisted(s), plan, new Date().toISOString());
          createdId = res.caseId;
          return res.state;
        });
        return createdId;
      },
      togglePlanTask: (caseId, taskId) =>
        set((s) => applyTogglePlanTask(pickPersisted(s), caseId, taskId, new Date().toISOString())),
      setTrusted: (trustedOn) =>
        set((s) => applySetTrusted(pickPersisted(s), trustedOn, new Date().toISOString())),
      setMealAsk: (mealAsk) => set({ mealAsk }),
      sendMealAsk: () => set((s) => applySendMealAsk(pickPersisted(s), new Date().toISOString())),
      lockPesel: () => set((s) => applyLockPesel(pickPersisted(s), new Date().toISOString())),
      addReminder: (id, title, when, extra) =>
        set((s) =>
          applyAddReminder(
            pickPersisted(s),
            { id, title, when, ...extra },
            new Date().toISOString(),
          ),
        ),
      updateReminder: (id, patch) =>
        set((s) => applyUpdateReminder(pickPersisted(s), id, patch, new Date().toISOString())),
      removeReminder: (id) =>
        set((s) => applyRemoveReminder(pickPersisted(s), id, new Date().toISOString())),
      startDemoStory: (storyId) =>
        set((s) => ({
          ...applyStartDemoStory(pickPersisted(s), storyId),
          orbit: false,
          orbitDraft: "",
          more: false,
          demoMinimized: false,
        })),
      resetDemoStory: () =>
        set((s) => {
          if (!s.demoStoryId) return {};
          return {
            ...applyStartDemoStory(pickPersisted(s), s.demoStoryId),
            orbit: false,
            orbitDraft: "",
            more: false,
          };
        }),
      exitDemoMode: () =>
        set((s) => ({
          ...applyExitDemoMode(pickPersisted(s)),
          orbit: false,
          orbitDraft: "",
          more: false,
          demoMinimized: false,
        })),
      setDemoMinimized: (demoMinimized) => set({ demoMinimized }),
      resetAll: () => {
        if (typeof window !== "undefined") window.clearTimeout(toastTimer);
        set({
          ...createFreshPersisted(),
          orbit: false,
          orbitDraft: "",
          more: false,
          toast: null,
          demoMinimized: false,
        });
      },
    }),
    {
      name: "nexus-pref",
      version: STORE_VERSION,
      migrate: (persisted, version) => migratePersistedState(persisted, version),
      partialize: (s) => pickPersisted(s),
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
