import { useState } from "react";
import { fileMetadata } from "@/lib/nexus/civic/files";
import { submitDraft, type FormSpec } from "@/lib/nexus/civic/forms";
import { demoId, saveDraft, type CivicData, type Draft } from "@/lib/nexus/civic/model";
import { useNexus } from "@/lib/nexus/store";
import { Action, Button, Errors, Field } from "./ui";

export function CivicWizard<D extends CivicData>({
  data,
  change,
  spec,
  caseId,
  draftId,
  unknown,
  confirmText,
}: {
  data: D;
  change: (fn: (s: D) => D) => void;
  spec: FormSpec;
  caseId?: string | null;
  draftId?: string;
  unknown?: boolean;
  confirmText: string;
}) {
  const [draft, setDraft] = useState<Draft>(
    () =>
      data.drafts.find(
        (entry) =>
          entry.scope === data.scope &&
          (draftId
            ? entry.id === draftId
            : !entry.resultId &&
              Boolean(caseId) &&
              entry.caseId === caseId &&
              entry.serviceId === spec.id),
      ) ?? {
        id: demoId(data.source, "draft"),
        source: data.source,
        scope: data.scope,
        serviceId: spec.id,
        caseId: caseId ?? null,
        step: 0,
        values: {},
        attachments: [],
      },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState(false);
  const [resultCheck, setResultCheck] = useState(false);
  const go = useNexus((s) => s.go);
  const select = useNexus((s) => s.select);
  const stored = data.drafts.find((entry) => entry.id === draft.id);
  const { step, values } = draft;
  const phase = spec.phases[step];
  const attachmentStep = spec.phases.length;
  const reviewStep = attachmentStep + 1;
  const set = (key: string, value: string) =>
    setDraft({ ...draft, values: { ...values, [key]: value } });
  const fileName = (size: number) =>
    new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(size / 1_000_000);
  function validate(onlyCurrent: boolean) {
    const fields = onlyCurrent
      ? (phase?.fields ?? [])
      : spec.phases.flatMap((entry) => entry.fields);
    const invalid: Record<string, string> = {};
    fields.forEach((field) => {
      if (!field.optional && !values[field.key]?.trim())
        invalid[field.key] = `${field.label} — uzupełnij pole.`;
    });
    if (!onlyCurrent || step === attachmentStep) {
      if (
        draft.attachments.some(
          (file) => spec.attachmentLimit !== undefined && file.size > spec.attachmentLimit,
        )
      )
        invalid.attachment = `Maksymalny rozmiar pliku w tej usłudze to ${fileName(spec.attachmentLimit!)} MB.`;
      else if (draft.attachments.length && !selectedFiles)
        invalid.attachment = "Szkic zawiera metadane. Wybierz pliki ponownie.";
      else if (spec.attachmentRequired && !draft.attachments.length)
        invalid.attachment = "Dołącz wymagany załącznik demonstracyjny.";
    }
    if (!onlyCurrent && spec.signatures.length && !values.signature)
      invalid.signature = "Wybierz sposób podpisania.";
    setErrors(invalid);
    return !Object.keys(invalid).length;
  }
  if (draft.scope !== data.scope)
    return <p role="status">Szkic jest dostępny w innym kontekście.</p>;
  if (stored?.resultId)
    return (
      <section className="nx-sheet civic-stack" role="status">
        <h2>Zapisano wysyłkę demonstracyjną</h2>
        <p>Dokument i potwierdzenie są dostępne w NEXUS.</p>
        <Button primary onClick={() => go("pismo", stored.resultId)}>
          Zobacz dokument i potwierdzenie
        </Button>
        <Button onClick={() => go("sprawa", stored.caseId ?? undefined)}>Zobacz sprawę</Button>
      </section>
    );
  if (stored?.pending)
    return (
      <section className="nx-note civic-stack">
        <h2>Sprawdzamy wynik</h2>
        <p>Nie potwierdzono wysłania. Formularz jest zapisany.</p>
        {resultCheck && (
          <p role="status">Dokument nadal czeka na wysłanie. Możesz ponowić próbę.</p>
        )}
        <Button
          primary
          onClick={() => {
            change((s) => ({
              ...s,
              drafts: s.drafts.map((item) =>
                item.id === draft.id ? { ...item, pending: false } : item,
              ),
            }));
            setResultCheck(true);
          }}
        >
          Sprawdź stan operacji
        </Button>
      </section>
    );
  return (
    <section className="nx-sheet civic-stack">
      <h2>{spec.title}</h2>
      <p className="nx-fine">
        Krok {step + 1} z {reviewStep + 1} ·{" "}
        {phase?.title ?? (step === attachmentStep ? "Załączniki" : "Podsumowanie")}
      </p>
      <Errors errors={errors} />
      {resultCheck && (
        <p role="status">
          Dokument oczekuje na ponowienie wysyłki. Dane formularza zostały zachowane.
        </p>
      )}
      {spec.code === "KRB" && step === 1 && (
        <p>
          Sprawdź, czy masz dokumenty związane z wykształceniem i zatrudnieniem w fikcyjnym
          scenariuszu. Załączniki wybierzesz na kolejnym etapie.
        </p>
      )}
      {spec.code === "KRB" && step === 3 && (
        <p>
          W urzędzie zarejestrowana osoba informuje o zmianach swojej sytuacji. Szczegółowe prawa i
          obowiązki określa aktualna procedura urzędu.
        </p>
      )}
      {spec.code === "KRB" && step === 4 && (
        <p>Oświadczenie dotyczy użycia danych demo. Wniosek pozostanie na tym urządzeniu.</p>
      )}
      {phase?.fields.map((field) => (
        <Field key={field.key} label={field.label} error={errors[field.key]}>
          {(props) =>
            field.kind === "select" ? (
              <select
                {...props}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
              >
                <option value="">Wybierz</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.kind === "textarea" ? (
              <textarea
                {...props}
                rows={4}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            ) : field.kind === "check" ? (
              <input
                {...props}
                type="checkbox"
                checked={values[field.key] === "Tak"}
                onChange={(e) => set(field.key, e.target.checked ? "Tak" : "")}
              />
            ) : (
              <input
                {...props}
                type={field.kind === "date" ? "date" : "text"}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
              />
            )
          }
        </Field>
      ))}
      {step === attachmentStep && (
        <>
          <Field label="Załączniki demonstracyjne" error={errors.attachment}>
            {(props) => (
              <input
                {...props}
                type="file"
                multiple
                onChange={(e) => {
                  setSelectedFiles(true);
                  setDraft({
                    ...draft,
                    attachments: Array.from(e.target.files ?? [], fileMetadata),
                  });
                }}
              />
            )}
          </Field>
          {spec.attachmentLimit && (
            <p className="nx-fine">
              Limit tej usługi · {fileName(spec.attachmentLimit)} MB na plik.
            </p>
          )}
          {draft.attachments.length > 0 && !selectedFiles && (
            <p>W szkicu zapisano metadane. Wybierz pliki ponownie.</p>
          )}
          {draft.attachments.map((file, i) => (
            <p key={i}>
              {file.name} · {file.type || "Nieznany format"} · {file.size} B ·{" "}
              {spec.attachmentLimit && file.size > spec.attachmentLimit
                ? "Plik przekracza limit"
                : "Metadane poprawne"}
            </p>
          ))}
        </>
      )}
      {step === reviewStep && (
        <>
          <p>Sprawdź dane demonstracyjne przed zapisem wysyłki.</p>
          <dl className="nx-dl">
            {spec.phases
              .flatMap((entry) => entry.fields)
              .filter((field) => values[field.key])
              .map((field) => (
                <div key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>{values[field.key]}</dd>
                </div>
              ))}
          </dl>
          {!!draft.attachments.length && (
            <p>Załączniki · {draft.attachments.map((file) => file.name).join(", ")}</p>
          )}
          {spec.signatures.length > 0 && (
            <Field label="Sposób podpisania demonstracyjnego" error={errors.signature}>
              {(props) => (
                <select
                  {...props}
                  value={values.signature ?? ""}
                  onChange={(e) => set("signature", e.target.value)}
                >
                  <option value="">Wybierz</option>
                  {spec.signatures.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              )}
            </Field>
          )}
          <Action
            title="Zapisać symulowaną wysyłkę?"
            body="Dokument pozostanie w lokalnej demonstracji NEXUS."
            onConfirm={() => {
              if (!validate(false)) return;
              if (data.health !== "ready") {
                change((s) => saveDraft(s, draft));
                setErrors({ source: "Usługa niedostępna. Zachowano formularz." });
                return;
              }
              let submitted = false;
              change((s) => {
                const next = submitDraft(s, draft, spec, Boolean(unknown && !resultCheck));
                submitted = next.drafts.some(
                  (entry) => entry.id === draft.id && (entry.resultId || entry.pending),
                );
                return next;
              });
              if (submitted && draftId !== draft.id) select(`${data.source}/form/${draft.id}`);
            }}
          >
            {confirmText}
          </Action>
        </>
      )}
      <div className="civic-form-actions">
        {step > 0 && (
          <Button
            onClick={() => {
              setErrors({});
              setDraft({ ...draft, step: step - 1 });
            }}
          >
            Wstecz
          </Button>
        )}
        <Button
          onClick={() => {
            change((s) => saveDraft(s, draft));
            useNexus.getState().showToast("Zapisano szkic na tym urządzeniu");
          }}
        >
          Zapisz szkic
        </Button>
        {step < reviewStep && (
          <Button
            primary
            onClick={() => {
              if (validate(true)) setDraft({ ...draft, step: step + 1 });
            }}
          >
            Dalej
          </Button>
        )}
      </div>
    </section>
  );
}
