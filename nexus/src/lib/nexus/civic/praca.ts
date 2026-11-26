import { workOffice } from "./forms";
import {
  complete,
  demoDate,
  demoNow,
  doc,
  eventFor,
  initialData,
  patch,
  publish,
  repository,
  task,
  visible,
  type CivicAppointment,
  type CivicCase,
  type CivicData,
  type CivicDocument,
  type CivicEvent,
  type CivicNotice,
  type Draft,
} from "./model";

export type WorkCase = CivicCase & { formCode?: string; labourStatus?: string };
export type WorkData = CivicData<
  WorkCase,
  {
    favourites: string[];
    localNotices: boolean;
    email: boolean;
    surveyAnswered: boolean;
    unknownOutcome: boolean;
    expiredSlot: boolean;
  }
>;

export function seedWork(): WorkData {
  const registration: WorkCase = {
    id: "DEMO-praca-101",
    source: "praca",
    scope: "personal",
    title: "Rejestracja w urzędzie pracy",
    number: "DEMO-KRB-101/2026",
    office: workOffice,
    sourceStatus: null,
    updatedAt: demoDate(-2),
    summary: "Urząd przyjął dokument. Źródło nie przekazało rozstrzygnięcia.",
    version: 1,
    formCode: "KRB",
  };
  const supplement: WorkCase = {
    ...registration,
    id: "DEMO-praca-102",
    title: "Uzupełnienie załączników do rejestracji",
    number: "DEMO-KRB-102/2026",
    summary: "Dodaj brakujący dokument demonstracyjny wskazany przez urząd.",
    formCode: "PSZ-KRBU",
  };
  const organization: WorkCase = {
    ...registration,
    id: "DEMO-praca-103",
    scope: "organization",
    title: "Pismo Organizacji Demo",
    number: "DEMO-ORG-103/2026",
    summary: "Dokument oczekuje na drugi podpis.",
    formCode: "PSZ-PU",
  };
  const sent = doc(registration, "sent", "Zgłoszenie do rejestracji", {
    formCode: "KRB",
    direction: "outgoing",
    submission: "sent",
    signature: { required: 1, completed: 1 },
    receipts: [{ type: "UPP", id: "DEMO-praca-UPP-101", at: demoDate(-2) }],
  });
  const waiting = doc(supplement, "waiting", "Pismo z urzędu czeka na odbiór", {
    delivery: "waiting",
    requiresReceipt: true,
    formCode: "PSZ-PU",
    canContinue: true,
    body: "Urząd Demo prosi o dołączenie przykładowego załącznika do sprawy.",
  });
  const sign = doc(organization, "sign", "Pismo organizacji do podpisu", {
    formCode: "PSZ-PU",
    direction: "outgoing",
    submission: "ready",
    signature: { required: 2, completed: 1 },
  });
  const deemed = doc(registration, "deemed", "Informacja uznana za doręczoną", {
    delivery: "deemed",
    deliveryAt: demoDate(-4),
    requiresReceipt: true,
    formCode: "PSZ-PU",
  });
  const data = initialData(
    "praca",
    [registration, supplement, organization],
    [sent, waiting, sign, deemed],
    {
      favourites: [],
      localNotices: true,
      email: false,
      surveyAnswered: false,
      unknownOutcome: false,
      expiredSlot: false,
    } as WorkData["extra"],
  );
  const selfVisit = {
    id: "DEMO-praca-visit-own",
    source: "praca",
    scope: "personal",
    title: "Konsultacja dokumentów",
    at: demoDate(5, "11:30"),
    office: workOffice,
    location: "Punkt Obsługi Demo",
    mode: "online",
    state: "booked",
    cancellable: true,
    history: [
      `Termin zmieniono z ${demoDate(3, "11:30").slice(0, 10)} na ${demoDate(5, "11:30").slice(0, 10)}.`,
    ],
  } satisfies CivicAppointment;
  data.appointments = [
    selfVisit,
    {
      id: "DEMO-praca-visit-office",
      source: "praca",
      scope: "personal",
      title: "Wizyta wyznaczona przez urząd",
      at: demoDate(9, "14:30"),
      office: workOffice,
      location: "Filia Demo",
      mode: "stacjonarna",
      state: "booked",
      cancellable: false,
      position: "Stanowisko D-3",
    },
  ];
  data.tasks = [
    task(
      supplement,
      "supplement",
      "Uzupełnij dokumenty w sprawie",
      supplement.summary,
      "Uzupełnij załączniki",
      { kind: "module", id: `praca/form/krbu~${supplement.id}` },
    ),
    task(
      supplement,
      "receipt",
      "Odbierz pismo z urzędu",
      "Wymaga osobnej symulacji odbioru.",
      "Zobacz pismo",
      { kind: "document", id: waiting.id },
    ),
    task(
      organization,
      "signature",
      "Dokument czeka na drugi podpis",
      "Złożono jeden z dwóch podpisów.",
      "Zobacz dokument",
      { kind: "document", id: sign.id },
    ),
  ];
  data.drafts = [
    {
      id: "DEMO-praca-draft-pu",
      source: "praca",
      scope: "personal",
      serviceId: "pu",
      caseId: supplement.id,
      step: 1,
      values: {
        office: workOffice,
        subject: "Pytanie demonstracyjne",
        body: "Proszę o informację o sprawie DEMO.",
      },
      attachments: [],
    },
  ];
  const events: [CivicEvent, CivicNotice["priority"]][] = [
    [
      eventFor(
        sent,
        "submission.sent",
        "Wniosek został wysłany",
        { kind: "document", id: sent.id },
        registration.id,
        { at: demoDate(-2) },
      ),
      "info",
    ],
    [
      eventFor(
        waiting,
        "document.waiting",
        waiting.title,
        { kind: "document", id: waiting.id },
        supplement.id,
        { at: demoDate(-1) },
      ),
      "action",
    ],
    [
      eventFor(
        supplement,
        "case.supplement",
        "Uzupełnij dokumenty w sprawie",
        data.tasks[0].target,
        supplement.id,
      ),
      "action",
    ],
    [
      eventFor(
        sign,
        "document.signature",
        "Dokument czeka na Twój podpis",
        { kind: "document", id: sign.id },
        organization.id,
      ),
      "action",
    ],
    [
      eventFor(
        selfVisit,
        "visit.soon",
        "Zbliża się wizyta w urzędzie",
        { kind: "module", id: `praca/visits/${selfVisit.id}` },
        null,
        { at: demoDate(-1) },
      ),
      "info",
    ],
    [
      eventFor(
        selfVisit,
        "visit.changed",
        "Zmieniono termin wizyty",
        { kind: "module", id: `praca/visits/${selfVisit.id}` },
        null,
      ),
      "info",
    ],
  ];
  return events.reduce((s, [event, priority]) => publish(s, event, priority), data);
}

export const useWork = repository("praca", seedWork);

export function workReceive(data: WorkData, id: string) {
  const item = data.documents.find((entry) => entry.id === id && visible(data, entry));
  if (data.health !== "ready" || item?.delivery !== "waiting") return data;
  const next = complete(
    {
      ...data,
      documents: patch(data.documents, id, {
        delivery: "received",
        deliveryAt: demoNow,
        receipts: [...(item.receipts ?? []), { id: `${id}-UPD`, type: "UPD", at: demoNow }],
      }),
    },
    `${item.caseId}-receipt`,
  );
  return publish(
    next,
    eventFor(
      item,
      "delivery.received",
      "Odebrano pismo w demonstracji",
      { kind: "document", id },
      item.caseId,
    ),
  );
}

export function workSign(data: WorkData, id: string) {
  const item = data.documents.find((entry) => entry.id === id && visible(data, entry));
  if (
    data.health !== "ready" ||
    item?.submission !== "ready" ||
    !item.signature ||
    item.signature.completed >= item.signature.required
  )
    return data;
  const signature = { ...item.signature, completed: item.signature.completed + 1 };
  const next = { ...data, documents: patch(data.documents, id, { signature }) };
  return signature.completed === signature.required
    ? complete(next, `${item.caseId}-signature`)
    : next;
}

export function workSendSigned(data: WorkData, id: string) {
  const item = data.documents.find((entry) => entry.id === id && visible(data, entry));
  if (
    data.health !== "ready" ||
    !item?.signature ||
    item.signature.completed !== item.signature.required ||
    item.submission !== "ready"
  )
    return data;
  return publish(
    {
      ...data,
      documents: patch(data.documents, id, {
        submission: "sent",
        publishedAt: demoNow,
        receipts: [{ id: `${id}-UPP`, type: "UPP", at: demoNow }],
      }),
    },
    eventFor(
      item,
      "submission.sent",
      "Wysłano dokument demonstracyjny",
      { kind: "document", id },
      item.caseId,
    ),
  );
}

export function continueWork(
  data: WorkData,
  item: CivicDocument,
  draftId: string,
): Draft | undefined {
  if (!visible(data, item) || !item.canContinue || !item.caseId) return undefined;
  return (
    data.drafts.find(
      (draft) =>
        draft.caseId === item.caseId &&
        draft.serviceId === "pu" &&
        !draft.resultId &&
        visible(data, draft),
    ) ?? {
      id: draftId,
      caseId: item.caseId,
      scope: data.scope,
      source: "praca",
      serviceId: "pu",
      step: 1,
      values: { office: item.office, subject: `W sprawie: ${item.title}` },
      attachments: [],
    }
  );
}
