import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAddReminder,
  applyExitDemoMode,
  applyFinishJourney,
  applyJourneyChoice,
  applyJourneyStep,
  applyLockPesel,
  applyRemoveReminder,
  applyReportLost,
  applySaveActionPlan,
  applySendReply,
  applySetTrusted,
  applyShareDoc,
  applyStartDemoStory,
  applyTogglePlanTask,
  applyUpdateReminder,
  createFreshPersisted,
  evaluatePlanTasks,
  migratePersistedState,
  pruneExpiredShares,
  selectAccessTransparencyLog,
  selectActiveShare,
  selectCaseById,
  selectContextualNotifications,
  selectDerivedCases,
  selectHomePriority,
  selectLetterReceipt,
  selectUnifiedTimeline,
} from "./oneflow";
import { demoStoryById } from "./demo-stories";
import { analyzeOrbitQuery, detectIntents } from "./orbit-match";

test("v1 -> v2 migration preserves preferences, drafts, replies, reminders and sanitizes invalid values", () => {
  const v1 = {
    onboarded: true,
    theme: "midnight",
    mode: "simple",
    textScale: 1.5,
    motion: "reduce",
    dayMode: "nov11",
    view: "invalid-view-name",
    drafts: { szkola: "Będę na zebraniu" },
    replies: { komunikacja: "Dostarczam badanie techniczne." },
    peselLocked: true,
    reminders: [{ id: "skierowanie", title: "Kardiolog", when: "3 grudnia 2026, 09:00" }],
    journeys: { pojazd: { step: 2, choices: { wydzial: "centralny" }, done: false } },
  };

  const migrated = migratePersistedState(v1, 1);
  assert.equal(migrated.onboarded, true);
  assert.equal(migrated.theme, "midnight");
  assert.equal(migrated.mode, "simple");
  assert.equal(migrated.textScale, 1.5);
  assert.equal(migrated.motion, "reduce");
  assert.equal(migrated.view, "start"); // invalid view safely falls back
  assert.equal(migrated.drafts.szkola, "Będę na zebraniu");
  assert.equal(migrated.replies.komunikacja, "Dostarczam badanie techniczne.");
  assert.equal(migrated.peselLocked, true);
  assert.equal(migrated.reminders.length, 1);
  assert.equal(migrated.reminders[0].serviceId, "ikp");
  assert.equal(migrated.reminders[0].targetView, "zdrowie");
  // Backfilled receipt and event for migrated reply
  assert.ok(selectLetterReceipt(migrated, "komunikacja"));
  assert.ok(migrated.events.some((e) => e.actionKey === "reply:komunikacja"));
  assert.ok(migrated.events.some((e) => e.actionKey === "pesel:lock"));
});

test("stale home-screen priority bug is fixed: answered letters never resurface as requiring action", () => {
  let state = createFreshPersisted();
  const initial = selectHomePriority(state);
  assert.ok(initial);
  assert.equal(initial.targetId, "komunikacja");

  // Answer first waiting letter
  state = { ...state, drafts: { ...state.drafts, komunikacja: "Przekażę badanie techniczne." } };
  state = applySendReply(state, "komunikacja", "2026-11-25T10:00:00.000Z");

  const second = selectHomePriority(state);
  assert.ok(second);
  assert.equal(second.targetId, "szkola");

  // Answer second waiting letter
  state = { ...state, drafts: { ...state.drafts, szkola: "Potwierdzam obecność." } };
  state = applySendReply(state, "szkola", "2026-11-25T10:05:00.000Z");

  // No unresolved letters or plans -> null (never falls back to already answered letter!)
  assert.equal(selectHomePriority(state), null);
});

test("sendReply updates correspondence, linked case, receipt, timeline in one idempotent transaction", () => {
  let state = createFreshPersisted();
  state = { ...state, drafts: { komunikacja: "Dostarczam potwierdzenie badania technicznego." } };

  const afterFirst = applySendReply(state, "komunikacja", "2026-11-25T14:30:00.000Z");
  assert.equal(afterFirst.replies.komunikacja, "Dostarczam potwierdzenie badania technicznego.");
  assert.equal(afterFirst.drafts.komunikacja, undefined);
  assert.ok(afterFirst.readIds.includes("komunikacja"));

  const receipt = selectLetterReceipt(afterFirst, "komunikacja");
  assert.ok(receipt);
  assert.match(receipt.code, /^UPO-WZÓR-/);

  const linkedCase = selectCaseById(afterFirst, "rejestracja");
  assert.ok(linkedCase);
  assert.equal(linkedCase.status, "odpowiedź zapisana (wzór)");
  assert.ok(linkedCase.receipts.some((r) => r.code === receipt.code));

  const timeline = selectUnifiedTimeline(afterFirst);
  assert.equal(timeline[0].source, "event");
  assert.equal(timeline[0].receiptCode, receipt.code);
  assert.equal(timeline[0].targetView, "sprawa");
  assert.equal(timeline[0].targetId, "rejestracja");

  // Duplicate confirmation must be strictly idempotent (no duplicate receipt or event)
  const afterDuplicate = applySendReply(
    { ...afterFirst, drafts: { komunikacja: "Druga próba" } },
    "komunikacja",
    "2026-11-25T14:31:00.000Z",
  );
  assert.equal(afterDuplicate.receipts.length, afterFirst.receipts.length);
  assert.equal(afterDuplicate.events.length, afterFirst.events.length);
  assert.equal(afterDuplicate.replies.komunikacja, afterFirst.replies.komunikacja);
});

test("healthcare reminder reflects on unified timeline and supports update, remove and idempotency", () => {
  let state = createFreshPersisted();
  state = applyAddReminder(
    state,
    {
      id: "skierowanie",
      title: "Skierowanie do kardiologa",
      when: "4 grudnia 2026, 09:30",
      isoDate: "2026-12-04",
      time: "09:30",
      serviceId: "ikp",
      targetView: "zdrowie",
      targetId: "skierowania",
    },
    "2026-11-25T15:00:00.000Z",
  );

  // Duplicate add is idempotent
  const dup = applyAddReminder(
    state,
    { id: "skierowanie", title: "Duplikat", when: "5 grudnia 2026" },
    "2026-11-25T15:01:00.000Z",
  );
  assert.equal(dup.reminders.length, 1);

  const timeline = selectUnifiedTimeline(state);
  const remEntry = timeline.find((item) => item.reminderId === "skierowanie");
  assert.ok(remEntry);
  assert.equal(remEntry.targetView, "zdrowie");
  assert.equal(remEntry.dateLabel, "4 grudnia 2026, 09:30");

  // Update reminder
  state = applyUpdateReminder(
    state,
    "skierowanie",
    { isoDate: "2026-12-10", time: "11:00" },
    "2026-11-25T15:05:00.000Z",
  );
  assert.equal(state.reminders[0].when, "10 grudnia 2026, 11:00");

  // Remove reminder
  state = applyRemoveReminder(state, "skierowanie", "2026-11-25T15:06:00.000Z");
  assert.equal(state.reminders.length, 0);
});

test("journey completion validates required choices, updates linked case and stays idempotent", () => {
  let state = createFreshPersisted();
  // Attempting to finish pojazd without selecting wydzial and termin must NOT mark done
  const blocked = applyFinishJourney(state, "pojazd", "2026-11-25T16:00:00.000Z");
  assert.equal(blocked.journeys.pojazd?.done ?? false, false);

  state = applyJourneyStep(state, "pojazd", 1, "2026-11-25T16:01:00.000Z");
  state = applyJourneyChoice(state, "pojazd", "wydzial", "centralny");
  state = applyJourneyStep(state, "pojazd", 2, "2026-11-25T16:02:00.000Z");
  state = applyJourneyChoice(state, "pojazd", "termin", "d9");
  state = applyFinishJourney(state, "pojazd", "2026-11-25T16:03:00.000Z");

  assert.equal(state.journeys.pojazd?.done, true);
  assert.ok(state.receipts.some((r) => r.targetId === "rejestracja"));

  // Duplicate finish with same choices does not duplicate receipts/events
  const again = applyFinishJourney(state, "pojazd", "2026-11-25T16:04:00.000Z");
  assert.equal(again.receipts.length, state.receipts.length);
  assert.equal(again.events.length, state.events.length);
});

test("share expiry, PESEL lock, and document loss update active shares, notifications and transparency log", () => {
  const startMs = Date.parse("2026-11-25T12:00:00.000Z");
  let state = createFreshPersisted();
  state = applyShareDoc(state, "dowod", 15, startMs);

  const activeAt5Min = selectActiveShare(state.shares, "dowod", startMs + 5 * 60_000);
  assert.equal(activeAt5Min.active, true);
  assert.equal(activeAt5Min.minutesRemaining, 10);

  const expiredAt16Min = selectActiveShare(state.shares, "dowod", startMs + 16 * 60_000);
  assert.equal(expiredAt16Min.active, false);
  assert.equal(Object.keys(pruneExpiredShares(state.shares, startMs + 16 * 60_000)).length, 0);

  // Report lost revokes active share and records access transparency + notification
  state = applyReportLost(state, "dowod", "2026-11-25T12:06:00.000Z");
  assert.ok(state.lost.includes("dowod"));
  assert.equal(state.shares.dowod, undefined);

  state = applyLockPesel(state, "2026-11-25T12:07:00.000Z");
  assert.equal(state.peselLocked, true);

  const notifs = selectContextualNotifications(state, startMs + 8 * 60_000);
  assert.ok(notifs.some((n) => n.id === "notif-lost-dowod"));

  const accessLog = selectAccessTransparencyLog(state);
  assert.ok(accessLog.some((entry) => entry.source === "local" && entry.what.includes("PESEL")));
});

test("NEXUS Orbit detects three simultaneous intentions, deduplicates requirements, saves plan case and tracks task toggles", () => {
  let state = createFreshPersisted();
  const prompt =
    "Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę. Co muszę załatwić?";

  const intents = detectIntents(prompt);
  assert.ok(intents.includes("studia"));
  assert.ok(intents.includes("przeprowadzka"));
  assert.ok(intents.includes("pierwsza-praca"));

  const analysis = analyzeOrbitQuery(prompt, state);
  assert.ok(analysis.actionPlan);
  assert.equal(analysis.actionPlan.intents.length, 3);
  assert.ok(analysis.actionPlan.tasks.length >= 4);
  assert.ok(analysis.actionPlan.facts.length > 0);
  assert.ok(analysis.actionPlan.interpretations.length > 0);
  assert.ok(analysis.actionPlan.reusedData.some((d) => d.label === "PESEL"));
  assert.ok(analysis.actionPlan.deduplicatedRequirements.length >= 2);
  assert.ok(analysis.actionPlan.missingInfo.length >= 2);
  assert.ok(analysis.actionPlan.tasks.some((t) => t.kind === "health_info"));
  assert.ok(analysis.actionPlan.tasks.some((t) => t.kind === "potential_benefit"));

  // Save plan as live case
  const saved = applySaveActionPlan(state, analysis.actionPlan, "2026-11-25T17:00:00.000Z");
  state = saved.state;
  const cases = selectDerivedCases(state);
  const planCase = cases.find((c) => c.id === saved.caseId);
  assert.ok(planCase);
  assert.equal(planCase.isPlanCase, true);

  // Toggle first task complete
  const firstTaskId = analysis.actionPlan.tasks[0].id;
  state = applyTogglePlanTask(state, saved.caseId, firstTaskId, "2026-11-25T17:05:00.000Z");
  assert.ok(state.savedPlans[saved.caseId].completedTaskIds.includes(firstTaskId));

  // Idempotent duplicate save returns same caseId without duplicating receipt
  const dupSave = applySaveActionPlan(state, analysis.actionPlan, "2026-11-25T17:06:00.000Z");
  assert.equal(dupSave.caseId, saved.caseId);
  assert.equal(dupSave.state.receipts.length, state.receipts.length);
});

test("NEXUS Orbit explains fictional official correspondence in plain Polish", () => {
  const state = createFreshPersisted();
  const analysis = analyzeOrbitQuery("Wyjaśnij pismo KR/2026/4412 o dowód rejestracyjny", state);
  assert.ok(analysis.letterExplanation);
  assert.equal(analysis.letterExplanation.id, "komunikacja");
  assert.ok(analysis.letterExplanation.plain.facts.length > 0);
  assert.ok(analysis.letterExplanation.plain.sourceExcerpt.includes("KR NX851"));
});

test("Story 1 (Student): persona-aware PIT-0 reasoning, task categories, whyShown, and reactive journey sync", () => {
  let state = applyStartDemoStory(createFreshPersisted(), "student");
  assert.equal(state.activePersona, "student");
  assert.equal(state.demoStoryId, "student");

  const story = demoStoryById("student");
  assert.ok(story);
  // Zero faked progress before user acts
  assert.equal(story.steps.every((s) => !s.isDone(state)), true);

  const analysis = analyzeOrbitQuery(story.prompt, state);
  assert.ok(analysis.actionPlan);
  // Kacper (born 2006) triggers under-26 PIT-0 awareness, distinct from 1985 profile
  assert.ok(analysis.actionPlan.interpretations.some((line) => line.includes("2006") && line.includes("PIT-0")));
  // Distinguishes obligations, recommendations, and optional opportunities + whyShown on every task
  const categories = new Set(analysis.actionPlan.tasks.map((t) => t.category));
  assert.ok(categories.has("obowiązek"));
  assert.ok(categories.has("zalecenie"));
  assert.ok(categories.has("możliwość"));
  assert.ok(analysis.actionPlan.tasks.every((t) => t.whyShown.trim().length > 10));

  const saved = applySaveActionPlan(state, analysis.actionPlan, "2026-11-25T18:00:00.000Z");
  state = saved.state;
  assert.equal(story.steps[0].isDone(state), true);
  assert.equal(story.steps[1].isDone(state), false);

  // Health task is initially blocked by ZUS/contract task
  const beforeEval = evaluatePlanTasks(state.savedPlans[saved.caseId], state);
  const healthBefore = beforeEval.find((t) => t.id === "task-zdrowie-nfz");
  assert.equal(healthBefore?.isBlocked, true);

  // Complete real start-krakow journey -> reactively completes ZUS + meldunek and unblocks health task!
  state = applyJourneyChoice(state, "start-krakow", "umowa", "zlecenie");
  state = applyJourneyChoice(state, "start-krakow", "lokal", "najem");
  state = applyFinishJourney(state, "start-krakow", "2026-11-25T18:02:00.000Z");

  assert.equal(story.steps[1].isDone(state), true);
  const afterEval = evaluatePlanTasks(state.savedPlans[saved.caseId], state);
  assert.equal(afterEval.find((t) => t.id === "task-praca-zus-pit")?.completedByService, true);
  assert.equal(afterEval.find((t) => t.id === "task-meldunek")?.completedByService, true);
  assert.equal(afterEval.find((t) => t.id === "task-zdrowie-nfz")?.isBlocked, false);
});

test("Story 2 (Senior): calm mode + health/letter/trusted plan reactively updates on real mojeIKP and trusted actions", () => {
  let state = applyStartDemoStory(createFreshPersisted(), "senior");
  assert.equal(state.mode, "simple");
  assert.equal(state.textScale, 1.25);

  const story = demoStoryById("senior")!;
  const analysis = analyzeOrbitQuery(story.prompt, state);
  assert.ok(analysis.actionPlan);
  assert.ok(analysis.actionPlan.intents.includes("zdrowie"));
  assert.ok(analysis.actionPlan.intents.includes("pisma"));

  const saved = applySaveActionPlan(state, analysis.actionPlan, "2026-11-25T18:10:00.000Z");
  state = saved.state;
  assert.equal(story.steps[0].isDone(state), true);

  // Timeline review task starts blocked by mojeIKP reminder
  const beforeEval = evaluatePlanTasks(state.savedPlans[saved.caseId], state);
  assert.equal(beforeEval.find((t) => t.id === "senior-timeline-review")?.isBlocked, true);

  // Add real mojeIKP reminder + enable trusted person
  state = applyAddReminder(
    state,
    { id: "skierowanie", title: "Skierowanie do kardiologa (mojeIKP)", when: "8 grudnia 2026, 10:30", isoDate: "2026-12-08", time: "10:30", serviceId: "ikp", targetView: "zdrowie" },
    "2026-11-25T18:11:00.000Z",
  );
  state = applySetTrusted(state, true, "2026-11-25T18:12:00.000Z");

  assert.equal(story.steps[1].isDone(state), true);
  assert.equal(story.steps[2].isDone(state), true);

  const afterEval = evaluatePlanTasks(state.savedPlans[saved.caseId], state);
  assert.equal(afterEval.find((t) => t.id === "senior-ikp-reminder")?.completedByService, true);
  assert.equal(afterEval.find((t) => t.id === "senior-trusted-person")?.completedByService, true);
  assert.equal(afterEval.find((t) => t.id === "senior-timeline-review")?.isBlocked, false);
});

test("Story 3 & 4 (Letter + Lost Wallet): reactive sync unblocks dependent tasks and exitDemoMode restores default persona", () => {
  // Story 3: Letter + vehicle coordinated plan
  let letterState = applyStartDemoStory(createFreshPersisted(), "letter");
  const letterStory = demoStoryById("letter")!;
  const letterAnalysis = analyzeOrbitQuery(letterStory.prompt, letterState);
  assert.ok(letterAnalysis.actionPlan);
  assert.ok(letterAnalysis.letterExplanation);
  const savedLetter = applySaveActionPlan(letterState, letterAnalysis.actionPlan, "2026-11-25T18:20:00.000Z");
  letterState = savedLetter.state;

  const beforeLetter = evaluatePlanTasks(letterState.savedPlans[savedLetter.caseId], letterState);
  assert.equal(beforeLetter.find((t) => t.id === "letter-pickup-journey")?.isBlocked, true);

  letterState = { ...letterState, drafts: { komunikacja: "Dostarczam badanie techniczne przed terminem." } };
  letterState = applySendReply(letterState, "komunikacja", "2026-11-25T18:21:00.000Z");
  const afterLetter = evaluatePlanTasks(letterState.savedPlans[savedLetter.caseId], letterState);
  assert.equal(afterLetter.find((t) => t.id === "letter-kr-reply")?.completedByService, true);
  assert.equal(afterLetter.find((t) => t.id === "letter-pickup-journey")?.isBlocked, false);

  // Story 4: Lost wallet dependency chain (doc_lost + pesel_locked -> unblocks bank & access log)
  let walletState = applyStartDemoStory(createFreshPersisted(), "wallet");
  const walletStory = demoStoryById("wallet")!;
  const walletAnalysis = analyzeOrbitQuery(walletStory.prompt, walletState);
  assert.ok(walletAnalysis.actionPlan);
  const savedWallet = applySaveActionPlan(walletState, walletAnalysis.actionPlan, "2026-11-25T18:30:00.000Z");
  walletState = savedWallet.state;

  assert.equal(
    evaluatePlanTasks(walletState.savedPlans[savedWallet.caseId], walletState).find((t) => t.id === "lost-banks")
      ?.isBlocked,
    true,
  );
  walletState = applyReportLost(walletState, "dowod", "2026-11-25T18:31:00.000Z");
  // Still blocked until PESEL is locked
  assert.equal(
    evaluatePlanTasks(walletState.savedPlans[savedWallet.caseId], walletState).find((t) => t.id === "lost-banks")
      ?.isBlocked,
    true,
  );
  walletState = applyLockPesel(walletState, "2026-11-25T18:32:00.000Z");
  const finalWallet = evaluatePlanTasks(walletState.savedPlans[savedWallet.caseId], walletState);
  assert.equal(finalWallet.find((t) => t.id === "lost-doc-status")?.completedByService, true);
  assert.equal(finalWallet.find((t) => t.id === "lost-pesel-lock")?.completedByService, true);
  assert.equal(finalWallet.find((t) => t.id === "lost-banks")?.isBlocked, false);
  assert.equal(finalWallet.find((t) => t.id === "lost-access-check")?.isBlocked, false);
  assert.equal(walletStory.steps.every((s) => s.isDone(walletState)), true);
  const derivedWallet = selectCaseById(walletState, savedWallet.caseId);
  assert.ok(derivedWallet?.evaluatedFacts?.some((f) => f.includes("jest już zastrzeżony")));
  assert.ok(derivedWallet?.evaluatedFacts?.some((f) => f.includes("została już zgłoszona lokalnie")));

  // Exit demo restores default Zofia profile cleanly
  const exited = applyExitDemoMode(walletState);
  assert.equal(exited.demoStoryId, null);
  assert.equal(exited.activePersona, "default");
  assert.equal(exited.mode, "daily");
});

