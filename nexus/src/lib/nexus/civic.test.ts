import assert from "node:assert/strict";
import test from "node:test";
import { submitDraft, zusForm } from "./civic/forms";
import {
  demoDate,
  demoNow,
  eventFor,
  publish,
  saveDraft,
  visible,
  warsawDateTime,
  type Draft,
} from "./civic/model";
import { seedSow, submitCorrection, updateSowDeadline, validateSowMessage } from "./civic/pfron";
import { seedWork, workReceive, workSendSigned, workSign } from "./civic/praca";
import {
  acceptRequest,
  addCourtDocument,
  changeHearing,
  courtDeliveries,
  courtProjection,
  revokeCourtData,
  seedCourt,
  shareCourtData,
} from "./civic/sady";
import { visibleNotices } from "./civic/select";
import { seedZus } from "./civic/zus";

test("PFRON: szkic zachowuje zadanie, konflikt chroni treść, wysyłka aktualizuje tę samą sprawę", () => {
  const seed = seedSow();
  const item = seed.cases[0];
  const draft: Draft = {
    id: "DEMO-pfron-correction",
    source: "pfron",
    scope: item.scope,
    serviceId: "correction",
    caseId: item.id,
    step: 0,
    baseVersion: item.version,
    values: { body: "Fikcyjna poprawka" },
    attachments: [],
  };
  const saved = saveDraft(seed, draft);
  assert.equal(saved.tasks[0].completedAt, undefined);
  const conflicting = submitCorrection(
    { ...saved, cases: saved.cases.map((item) => ({ ...item, version: 2 })) },
    draft,
  );
  assert.match(conflicting.error!, /nowszą wersję/);
  assert.equal(
    conflicting.data.drafts.find((entry) => entry.id === draft.id)?.values.body,
    draft.values.body,
  );
  const result = submitCorrection(saved, draft);
  assert.equal(result.data.cases[0].applicationStatus, "Złożony");
  assert.equal(result.data.cases[0].jstCaseStatus, "Uzupełnienie przekazane");
  assert.equal(result.data.tasks[0].completedAt, demoNow);
  assert.ok(submitCorrection(result.data, draft).error);
});

test("PFRON: deduplikacja używa identyfikatora, a nie tytułu; nowszy termin zastępuje wcześniejsze przypomnienie", () => {
  const seed = seedSow();
  const event = seed.events[0];
  assert.equal(publish(seed, event), seed);
  const another = publish(seed, { ...event, id: event.id + "-other" });
  assert.equal(another.notices.length, seed.notices.length + 1);
  const key = "DEMO-pfron-103-deposit";
  const first = updateSowDeadline(another, key, demoDate(8));
  const next = updateSowDeadline(first, key, demoDate(9));
  assert.equal(
    visibleNotices(next).filter(({ event }) => event.type === "task.deadline_reminder").length,
    1,
  );
  assert.equal(
    visibleNotices(updateSowDeadline(next, key, null)).filter(
      ({ event }) => event.type === "task.deadline_reminder",
    ).length,
    0,
  );
});

test("PFRON: ogólna wiadomość nie wymaga sprawy, limit treści i lista typów działają", () => {
  const data = seedSow();
  const general = {
    title: "Przykład",
    body: "a".repeat(2000),
    office: "Jednostka PFRON Demo",
    type: "Ogólna",
    caseId: null,
  };
  assert.deepEqual(validateSowMessage(general, data), {});
  assert.ok(validateSowMessage({ ...general, body: general.body + "a" }, data).body);
  assert.ok(validateSowMessage({ ...general, type: "Wniosek" }, data).caseId);
  assert.ok(
    validateSowMessage({ ...general, attachment: { name: "plik.exe", size: 5, type: "" } }, data)
      .attachment,
  );
  assert.ok(
    validateSowMessage(
      { ...general, attachment: { name: "plik.pdf", size: 20_000_001, type: "application/pdf" } },
      data,
    ).attachment,
  );
});

test("ZUS: jedna wysyłka tworzy jeden dokument i nie przyznaje świadczenia", () => {
  const data = seedZus();
  const draft: Draft = {
    id: "DEMO-zus-test-form",
    scope: "personal",
    source: "zus",
    serviceId: "pog",
    caseId: null,
    step: 3,
    values: { body: "Demo", subject: "Temat demo", role: "Działam za siebie" },
    attachments: [],
  };
  const sent = submitDraft(data, draft, zusForm("pog"));
  assert.equal(sent.documents.length, data.documents.length + 1);
  assert.equal(sent.cases[0].sourceStatus, null);
  assert.equal(submitDraft(sent, draft, zusForm("pog")), sent);
});

test("Praca: UPD powstaje dopiero po odbiorze i pozostawia otwarte zadanie uzupełnienia", () => {
  const data = seedWork();
  const letter = data.documents.find((item) => item.delivery === "waiting")!;
  const received = workReceive(data, letter.id);
  assert.equal(data.documents.find((item) => item.id === letter.id)?.receipts, undefined);
  assert.equal(received.documents.find((item) => item.id === letter.id)?.receipts?.[0].type, "UPD");
  assert.equal(
    received.tasks.find((item) => item.id === `${letter.caseId}-supplement`)?.completedAt,
    undefined,
  );
  assert.equal(workReceive(received, letter.id), received);
});

test("Praca: źródłowe rozstrzygnięcie, podpis i wysyłka są niezależne, a zakres blokuje operacje", () => {
  const seed = seedWork();
  const document = seed.documents.find((item) => item.scope === "organization")!;
  assert.ok(!visible(seed, document));
  assert.equal(workSign(seed, document.id), seed);
  const organization = { ...seed, scope: "organization" as const };
  assert.equal(workSendSigned(organization, document.id), organization);
  const signed = workSign(organization, document.id);
  assert.equal(signed.documents.find((item) => item.id === document.id)?.signature?.completed, 2);
  assert.equal(signed.documents.find((item) => item.id === document.id)?.receipts, undefined);
  const sent = workSendSigned(signed, document.id);
  assert.equal(sent.documents.find((item) => item.id === document.id)?.receipts?.[0].type, "UPP");
  assert.equal(sent.cases.find((item) => item.id === document.caseId)?.sourceStatus, null);
});

test("Sądy: lokalny odczyt nie modyfikuje doręczenia ani oryginalnego odczytu", () => {
  const data = seedCourt();
  const document = data.documents[0];
  const read = {
    ...data,
    documents: data.documents.map((item) =>
      item.id === document.id ? { ...item, readAt: demoNow } : item,
    ),
  };
  assert.equal(read.documents[0].sourceRead, "Nieodczytane");
  assert.deepEqual(courtDeliveries(read), courtDeliveries(data));
});

test("Sądy: przyjęcie wniosku i nadanie dostępu to odrębne operacje", () => {
  const data = seedCourt();
  const id = "DEMO-sady-request-1";
  const caseId = "DEMO-sady-404";
  const accepted = acceptRequest(data, id);
  assert.ok(!courtProjection(accepted).cases.some((item) => item.id === caseId));
  const granted = shareCourtData(accepted, id);
  assert.ok(courtProjection(granted).cases.some((item) => item.id === caseId));
  const revoked = revokeCourtData(granted, "DEMO-sady-101");
  const projected = courtProjection(revoked);
  for (const list of [projected.documents, projected.events])
    assert.ok(!list.some((item) => item.caseId === "DEMO-sady-101"));
  assert.equal(revoked.cases[0].sourceStatus, "W toku");
});

test("Sądy: przesunięcie zmienia to samo przypomnienie, a odwołanie je dezaktywuje", () => {
  const data = seedCourt();
  const reminder = data.extra.reminders[0];
  const changed = changeHearing(data, reminder.hearingId, demoDate(16, "13:15"));
  assert.equal(changed.extra.reminders.length, 1);
  assert.equal(changed.extra.reminders[0].id, reminder.id);
  assert.equal(changed.extra.reminders[0].at, demoDate(16, "13:15"));
  const cancelled = changeHearing(changed, reminder.hearingId, null);
  assert.equal(cancelled.extra.reminders[0].state, "cancelled");
  assert.equal(
    cancelled.extra.hearings.find((item) => item.id === reminder.hearingId)?.history.length,
    3,
  );
});

test("Sądy: duplikat zdarzenia nie tworzy wpisu; dwa dokumenty o tym samym tytule pozostają", () => {
  const data = seedCourt();
  assert.equal(data.documents[0].title, data.documents[1].title);
  assert.notEqual(data.documents[0].id, data.documents[1].id);
  const hasNewDocument = addCourtDocument(data);
  assert.equal(hasNewDocument.documents.length, data.documents.length + 1);
  assert.equal(addCourtDocument(hasNewDocument), hasNewDocument);
  const event = eventFor(
    data.documents[0],
    "court.document",
    "Opublikowano nowy dokument",
    { kind: "document", id: data.documents[0].id },
    data.documents[0].caseId,
  );
  assert.equal(publish(data, event), data);
});

test("Wizyty: wybrana godzina pozostaje czasem warszawskim przez cały rok", () => {
  assert.equal(warsawDateTime("2027-06-01", "11:00"), "2027-06-01T11:00:00+02:00");
  assert.equal(warsawDateTime("2027-01-05", "11:00"), "2027-01-05T11:00:00+01:00");
  assert.equal(warsawDateTime("2027-03-28", "02:30"), null);
});
