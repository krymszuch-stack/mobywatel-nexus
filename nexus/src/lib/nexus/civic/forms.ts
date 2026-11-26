import {
  complete,
  demoNow,
  doc,
  eventFor,
  patch,
  publish,
  visible,
  type CivicCase,
  type CivicData,
  type Draft,
} from "./model";

export const workOffice = "Powiatowy Urząd Pracy Demo";
export const zusOffice = "Oddział ZUS Demo";

export type FormField = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "select" | "check" | "date";
  options?: string[];
  optional?: boolean;
};
export type FormSpec = {
  id: string;
  code: string;
  title: string;
  office: string;
  phases: { title: string; fields: FormField[] }[];
  attachmentLimit?: number;
  attachmentRequired?: boolean;
  signatures: string[];
};
export const zusRoles = ["Działam za siebie", "Pełnomocnik", "Przedstawiciel ustawowy"];
const needsText = { key: "body", label: "Treść pisma", kind: "textarea" } satisfies FormField;

export function zusForm(id: string): FormSpec {
  const info = {
    swiadczenie: ["SWN", "Wniosek o świadczenie wspierające"],
    zmiana: ["SWN-INF", "Zgłoszenie zmiany"],
    opiekun: ["USW-1", "Ubezpieczenie opiekuna lub członka rodziny"],
    uzupelnienie: ["SWN", "Uzupełnienie w sprawie świadczenia wspierającego"],
    pog: ["POG", "Pismo ogólne do ZUS"],
  }[id] ?? ["POG", "Pismo ogólne do ZUS"];
  return {
    id,
    code: info[0],
    title: info[1],
    office: zusOffice,
    signatures: [],
    phases: [
      {
        title: "Wybierz rolę",
        fields: [{ key: "role", label: "Rola", kind: "select", options: zusRoles }],
      },
      {
        title: "Uzupełnij dane",
        fields: [
          ...(id === "swiadczenie" || id === "uzupelnienie"
            ? [{ key: "wzon", label: "Oznaczenie fikcyjnej decyzji WZON" }]
            : []),
          { key: "subject", label: "Temat" },
          needsText,
        ],
      },
    ],
    attachmentLimit: id === "pog" ? 10_000_000 : 5_000_000,
  };
}

export function submitDraft<D extends CivicData>(
  data: D,
  draft: Draft,
  spec: FormSpec,
  unknownOutcome = false,
): D {
  const previous = data.drafts.find((item) => item.id === draft.id);
  if (!visible(data, draft) || data.health !== "ready" || previous?.resultId || previous?.pending)
    return data;
  if (draft.caseId && !data.cases.some((item) => item.id === draft.caseId && visible(data, item)))
    return data;
  if (unknownOutcome)
    return {
      ...data,
      drafts: [...data.drafts.filter((item) => item.id !== draft.id), { ...draft, pending: true }],
    };
  const existing = data.cases.find((item) => item.id === draft.caseId);
  const caseId = existing?.id ?? `${draft.id}-case`;
  const item: CivicCase = existing
    ? {
        ...existing,
        updatedAt: demoNow,
        version: existing.version + 1,
        sourceStatus:
          draft.serviceId === "uzupelnienie" ? "Uzupełnienie przekazane" : existing.sourceStatus,
      }
    : {
        id: caseId,
        source: draft.source,
        scope: draft.scope,
        title: spec.title,
        office: draft.values.office || spec.office,
        number: `DEMO-${spec.code}-${draft.id.slice(-8)}`,
        sourceStatus: null,
        updatedAt: demoNow,
        summary: "Przekazano dokument w demonstracji. Oczekujemy na informację o rozstrzygnięciu.",
        version: 1,
      };
  const resultId = `${draft.id}-sent`;
  if (data.documents.some((entry) => entry.id === resultId)) return data;
  const sent = doc(item, "sent", spec.title, {
    id: resultId,
    direction: "outgoing",
    kind: "Dokument wysłany",
    formCode: spec.code,
    submission: "sent",
    signature: spec.signatures.length ? { required: 1, completed: 1 } : undefined,
    publishedAt: demoNow,
    body: [draft.values.subject, draft.values.body].filter(Boolean).join("\n"),
    attachments: draft.attachments,
    canContinue: draft.source === "praca" && spec.code !== "KRB",
    receipts: [
      { id: `${resultId}-receipt`, type: draft.source === "praca" ? "UPP" : "wzór", at: demoNow },
    ],
  });
  const next = {
    ...data,
    cases: (existing ? patch(data.cases, caseId, item) : [item, ...data.cases]) as D["cases"],
    documents: [sent, ...data.documents],
    drafts: [
      ...data.drafts.filter((entry) => entry.id !== draft.id),
      { ...draft, caseId, resultId, pending: false },
    ],
  };
  const done =
    spec.code === "PSZ-KRBU" || spec.id === "uzupelnienie"
      ? complete(next, `${caseId}-supplement`)
      : next;
  return publish(
    done,
    eventFor(
      sent,
      "submission.sent",
      "Wysłano dokument demonstracyjny",
      { kind: "document", id: sent.id },
      caseId,
    ),
    "info",
  );
}
