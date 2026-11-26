import {
  type Attachment,
  type CivicCase,
  type CivicData,
  type Draft,
  type RecordBase,
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
} from "./model";

export const applicationStatuses = [
  "Utworzony",
  "Zapisany roboczo",
  "Zapisany",
  "Złożony",
  "Złożony papierowo",
  "Do poprawy",
  "Do poprawy papierowo",
  "Zatwierdzony",
  "Odrzucony",
  "Odrzucony z płatnością",
  "Wycofany",
  "Zakończony",
] as const;
export const settlementStatuses = [
  "Rozliczenie utworzone",
  "Rozliczenie zapisane roboczo",
  "Rozliczenie zapisane",
  "Rozliczenie przekazane",
  "Rozliczenie do zatwierdzenia",
  "Rozliczenie zatwierdzone",
  "Rozliczenie do poprawy",
  "Rozliczenie odrzucone",
  "Dofinansowanie wypłacone",
] as const;
export const sowEventEvidence = {
  "application.submitted": "ui",
  "application.correction_required": "ui",
  "application.attachment_added": "ui",
  "application.rejected": "ui",
  "correspondence.available": "ui",
  "settlement.accepted": "ui",
  "settlement.rejected": "ui",
  "contract.signature_required": "ui",
  "technology.deposit_due": "documentation",
  "task.deadline_reminder": "design",
  "payment.reported": "design",
} as const;
export type SowCase = CivicCase & {
  kind: "funding" | "technology" | "turnus" | "survey";
  applicationStatus?: (typeof applicationStatuses)[number];
  jstCaseStatus?: string;
  contractStatus?: string;
  settlement?: {
    id: string;
    status: (typeof settlementStatuses)[number];
    draft?: string;
    paymentReported: boolean;
  };
  technology?: {
    applicationStatus: string;
    contractStatus: string;
    deposit: number;
    paid: boolean;
    fulfilment: string;
  };
  turnus?: {
    application: string;
    choice: { status: string; detail: string };
    declaration: { status: string; documentId: string };
  };
  survey?: { office: string; status: string; response?: string };
};
export type SowMessage = RecordBase & {
  caseId: string | null;
  type: string;
  office: string;
  title: string;
  body: string;
  direction: "incoming" | "outgoing";
  read: boolean;
  replyAllowed: boolean;
  at: string;
  attachment?: Attachment;
};
export type SowData = CivicData<SowCase, { messages: SowMessage[] }>;

function sowCase(key: string, title: string, options: Partial<SowCase> = {}): SowCase {
  return {
    id: `DEMO-pfron-${key}`,
    source: "pfron",
    scope: "personal",
    kind: "funding",
    title,
    number: `DEMO/SOW/${key}/2026`,
    office: "Jednostka PFRON Demo",
    version: 1,
    updatedAt: demoDate(-1),
    applicationStatus: "Złożony",
    sourceStatus: "W toku",
    jstCaseStatus: "Weryfikacja",
    summary: "Przykładowa sprawa dotycząca wsparcia.",
    ...options,
  };
}

export function seedSow(): SowData {
  const correction = sowCase("101", "Dofinansowanie edukacji", {
    applicationStatus: "Do poprawy",
    jstCaseStatus: "Oczekuje na uzupełnienie",
    summary: "Uzupełnij opis kosztów edukacji podany we wniosku.",
  });
  const payment = sowCase("102", "Dofinansowanie sprzętu", {
    applicationStatus: "Zatwierdzony",
    jstCaseStatus: "Dofinansowanie wypłacone",
    sourceStatus: "Zakończona",
    contractStatus: "Podpisana",
    settlement: {
      id: "DEMO-pfron-settlement-paid",
      status: "Rozliczenie zatwierdzone",
      paymentReported: true,
    },
  });
  const technology = sowCase("103", "Wypożyczenie technologii wspomagającej", {
    kind: "technology",
    applicationStatus: "Zatwierdzony",
    jstCaseStatus: "Przygotowanie wydania urządzenia",
    technology: {
      applicationStatus: "Rozpatrzony pozytywnie",
      contractStatus: "Do podpisu",
      deposit: 150,
      paid: false,
      fulfilment: "Oczekuje na wydanie",
    },
  });
  const turnus = sowCase("104", "Turnus rehabilitacyjny", {
    kind: "turnus",
    applicationStatus: "Zatwierdzony",
    turnus: {
      application: "Zatwierdzony",
      choice: { status: "Do poprawy", detail: "Uzupełnij informację o organizatorze." },
      declaration: { status: "Dostępne", documentId: "DEMO-pfron-104-oswiadczenie" },
    },
  });
  const draft = sowCase("105", "Dofinansowanie likwidacji barier", {
    number: undefined,
    applicationStatus: "Zapisany roboczo",
    jstCaseStatus: undefined,
    sourceStatus: "Robocza",
  });
  const survey = sowCase("106", "Ankieta o potrzebach", {
    kind: "survey",
    applicationStatus: undefined,
    jstCaseStatus: undefined,
    survey: { status: "Do wypełnienia", office: "Oddział PFRON Demo" },
    sourceStatus: null,
  });
  const dependent = sowCase("107", "Wsparcie podopiecznego Demo", {
    scope: "dependent",
    applicationStatus: "Do poprawy",
  });
  const settlement = sowCase("108", "Rozliczenie dostępności mieszkania", {
    applicationStatus: "Zatwierdzony",
    settlement: {
      id: "DEMO-pfron-settlement-edit",
      status: "Rozliczenie do poprawy",
      paymentReported: false,
    },
  });
  const messages: SowMessage[] = [
    {
      id: "DEMO-pfron-message-correction",
      source: "pfron",
      scope: "personal",
      caseId: correction.id,
      type: "Wniosek",
      office: correction.office,
      title: "Uzupełnij wniosek edukacyjny",
      body: "Opisz koszty edukacji i wskaż, którego okresu dotyczy poprawka.",
      direction: "incoming",
      read: false,
      replyAllowed: false,
      at: demoDate(-1),
    },
    {
      id: "DEMO-pfron-message-general",
      source: "pfron",
      scope: "personal",
      caseId: null,
      type: "Ogólna",
      office: correction.office,
      title: "Godziny kontaktu z jednostką demonstracyjną",
      body: "W sprawach ogólnych wybierz realizatora i napisz wiadomość.",
      direction: "incoming",
      read: false,
      replyAllowed: true,
      at: demoDate(-2),
    },
    {
      id: "DEMO-pfron-message-payment",
      source: "pfron",
      scope: "personal",
      caseId: payment.id,
      type: "Wniosek",
      office: payment.office,
      title: "Rozliczenie zaakceptowane",
      body: "SOW wskazuje wypłatę.",
      direction: "incoming",
      read: false,
      replyAllowed: false,
      at: demoDate(-3),
    },
  ];
  const data = initialData(
    "pfron",
    [correction, payment, technology, turnus, draft, survey, dependent, settlement],
    [
      doc(correction, "pismo", "Zakres poprawy wniosku", {
        body: messages[0].body,
        version: "2.0",
      }),
      doc(payment, "potwierdzenie", "Potwierdzenie wypłaty w SOW", { kind: "Potwierdzenie" }),
      doc(payment, "aneks", "Aneks do umowy", {
        kind: "Aneks",
        signature: { required: 1, completed: 1 },
      }),
      doc(technology, "umowa", "Umowa wypożyczenia", {
        kind: "Umowa technologiczna",
        signature: { required: 1, completed: 0 },
      }),
      doc(turnus, "oswiadczenie", "Oświadczenie organizatora turnusu", { kind: "Oświadczenie" }),
    ],
    { messages },
  );
  data.drafts = [
    {
      ...draft,
      serviceId: "funding",
      caseId: draft.id,
      step: 1,
      values: { kind: "Likwidacja barier" },
      attachments: [],
    },
  ];
  data.tasks = [
    task(
      correction,
      "correction",
      "Uzupełnij wniosek edukacyjny",
      correction.summary,
      "Otwórz poprawkę",
      { kind: "module", id: `pfron/correction/${correction.id}` },
    ),
    task(
      dependent,
      "correction",
      "Uzupełnij dane podopiecznego",
      "Dopisz informacje dotyczące wsparcia.",
      "Otwórz poprawkę",
      { kind: "module", id: `pfron/correction/${dependent.id}` },
    ),
    task(
      technology,
      "deposit",
      "Kaucja za sprzęt",
      "Kaucję możesz obsłużyć w symulacji.",
      "Zobacz kaucję",
      undefined,
      demoDate(7),
    ),
  ];
  return publish(
    publish(
      data,
      eventFor(
        correction,
        "application.correction_required",
        messages[0].title,
        { kind: "case", id: correction.id },
        correction.id,
        { at: demoDate(-1), evidence: "ui" },
      ),
      "action",
    ),
    eventFor(
      payment,
      "payment.reported",
      "SOW wskazuje wypłatę",
      { kind: "case", id: payment.id },
      payment.id,
      { at: demoDate(-3) },
    ),
  );
}

export const useSow = repository("pfron", seedSow);

export function sowGroup(item: SowCase, needsAction: boolean) {
  if (needsAction) return "Wymaga działania";
  if (
    item.sourceStatus === "Zakończona" ||
    ["Odrzucony", "Odrzucony z płatnością", "Wycofany", "Zakończony"].includes(
      item.applicationStatus ?? "",
    )
  )
    return "Zakończone";
  if (["Utworzony", "Zapisany roboczo", "Zapisany"].includes(item.applicationStatus ?? ""))
    return "Robocze";
  return "W toku";
}

// Demonstration transitions. Source status dictionaries do not define the official workflow.
export function sowActions(data: SowData, item: SowCase) {
  if (!visible(data, item)) return [];
  return [
    ...(data.tasks.some((t) => t.id === `${item.id}-correction` && !t.completedAt)
      ? ["correction"]
      : []),
    ...(sowGroup(item, false) === "Robocze" ? ["resume"] : []),
    ...(item.settlement?.status === "Rozliczenie do poprawy" ? ["settlement"] : []),
    ...(item.technology && !item.technology.paid ? ["deposit"] : []),
    ...(item.turnus?.choice.status === "Do poprawy" ? ["turnus"] : []),
    ...(item.survey?.status === "Do wypełnienia" ? ["survey"] : []),
  ];
}

export function submitCorrection(data: SowData, draft: Draft): { data: SowData; error?: string } {
  const item = data.cases.find((entry) => entry.id === draft.caseId);
  if (!item || !sowActions(data, item).includes("correction"))
    return { data, error: "Poprawka jest już niedostępna." };
  if (data.health !== "ready")
    return { data, error: "Źródło jest niedostępne. Szkic pozostaje zapisany." };
  if (item.version !== draft.baseVersion)
    return { data, error: "Sprawa ma nowszą wersję. Wczytaj ją przed wysłaniem." };
  if (!draft.values.body?.trim()) return { data, error: "Wpisz treść uzupełnienia." };
  const version = item.version + 1;
  const next = complete(
    {
      ...data,
      cases: patch(data.cases, item.id, {
        applicationStatus: "Złożony",
        jstCaseStatus: "Uzupełnienie przekazane",
        updatedAt: demoNow,
        version,
      }),
      drafts: data.drafts.filter((entry) => entry.id !== draft.id),
      documents: [
        ...data.documents,
        doc(item, `correction-${version}`, "Uzupełnienie wniosku (demo)", {
          direction: "outgoing",
          submission: "sent",
          body: draft.values.body,
          publishedAt: demoNow,
        }),
      ],
    },
    `${item.id}-correction`,
  );
  return {
    data: publish(
      next,
      eventFor(
        item,
        "application.submitted",
        "Przekazano uzupełnienie demonstracyjne",
        { kind: "case", id: item.id },
        item.id,
        { version },
      ),
    ),
  };
}

export function validateSowMessage(
  message: Pick<SowMessage, "body" | "title" | "office" | "type" | "caseId" | "attachment">,
  data: SowData,
) {
  const errors: Record<string, string> = {};
  if (!message.office) errors.office = "Wybierz realizatora.";
  if (!message.title.trim()) errors.title = "Wpisz temat.";
  if (!message.body.trim() || [...message.body].length > 2000)
    errors.body = "Wpisz treść do 2000 znaków.";
  if (message.type !== "Ogólna" || message.caseId) {
    const item = data.cases.find(
      (entry) =>
        entry.id === message.caseId && visible(data, entry) && entry.office === message.office,
    );
    if (
      !item ||
      (message.type === "Ankieta" && !item.survey) ||
      (message.type === "Umowa" && !item.technology && !item.contractStatus) ||
      (message.type === "Wniosek" && !item.applicationStatus)
    ) {
      errors.caseId = "Wybierz powiązanie odpowiednie dla realizatora i typu wiadomości.";
    }
  }
  const file = message.attachment;
  if (
    file &&
    (!/\.(jpg|pdf|xls|xlsx|doc|docx|zip|srf)$/i.test(file.name) || file.size > 20_000_000)
  ) {
    errors.attachment = "Wybierz JPG, PDF, XLS, XLSX, DOC, DOCX, ZIP lub SRF do 20 MB.";
  }
  return errors;
}

export function sendSowMessage(data: SowData, message: SowMessage): SowData {
  if (
    !visible(data, message) ||
    data.health !== "ready" ||
    Object.keys(validateSowMessage(message, data)).length ||
    data.extra.messages.some((item) => item.id === message.id)
  )
    return data;
  const next = { ...data, extra: { messages: [message, ...data.extra.messages] } };
  return message.caseId
    ? publish(
        next,
        eventFor(
          message,
          "correspondence.sent",
          "Wysłano wiadomość demonstracyjną",
          { kind: "module", id: `pfron/message/${message.id}` },
          message.caseId,
        ),
        "info",
        false,
      )
    : next;
}

export function updateSowDeadline(data: SowData, id: string, dueAt: string | null): SowData {
  const current = data.tasks.find((item) => item.id === id && visible(data, item));
  if (!current || current.completedAt || current.dueAt === dueAt) return data;
  const next = {
    ...data,
    tasks: patch(data.tasks, id, { dueAt, dueSource: dueAt ? ("demo" as const) : undefined }),
  };
  if (!dueAt) return next;
  const version =
    1 +
    data.events.filter(
      (event) => event.type === "task.deadline_reminder" && event.id.startsWith(`${id}/`),
    ).length;
  return publish(
    next,
    eventFor(
      current,
      "task.deadline_reminder",
      "Przypomnienie o działaniu w PFRON",
      current.target,
      current.caseId,
      { version },
    ),
    "action",
  );
}
