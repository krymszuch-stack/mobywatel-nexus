import { useState } from "react";
import { openTarget } from "./navigation";
import { download, fileMetadata } from "@/lib/nexus/civic/files";
import {
  complete,
  demoId,
  demoNow,
  doc,
  eventFor,
  patch,
  publish,
  saveDraft,
  searchKey,
  visible,
  warsaw,
  type CivicDocument,
  type Draft,
  type SourceHealth,
} from "@/lib/nexus/civic/model";
import {
  sendSowMessage,
  sowActions,
  sowGroup,
  submitCorrection,
  useSow,
  validateSowMessage,
  updateSowDeadline,
  type SowCase,
  type SowMessage,
} from "@/lib/nexus/civic/pfron";
import { useNexus } from "@/lib/nexus/store";
import { PageHead, Row } from "../ui";
import { Action, Button, DemoPanel, Errors, Field, Filters, Freshness, TaskRows } from "./ui";

const tabs = [
  ["home", "Przegląd"],
  ["cases", "Sprawy"],
  ["messages", "Wiadomości"],
] satisfies [string, string][];
const caseFilters = ["Wszystkie", "Wymaga działania", "W toku", "Robocze", "Zakończone"];
const listState = { filter: "Wszystkie", query: "", mailbox: "Odebrane" };

export function Pfron({ section, resource }: { section: string; resource?: string }) {
  const { data, change, reset } = useSow();
  const go = useNexus((s) => s.go);
  const [filter, setFilter] = useState(listState.filter);
  const [query, setQuery] = useState(listState.query);
  const [mailbox, setMailbox] = useState(listState.mailbox);
  const cases = data.cases.filter((item) => visible(data, item));
  const messages = data.extra.messages.filter((item) => visible(data, item));
  const tasks = data.tasks.filter((item) => visible(data, item) && !item.completedAt);
  const current = cases.find((item) => item.id === resource);
  const message = messages.find((item) => item.id === resource);
  const filtered = cases.filter(
    (item) =>
      searchKey(`${item.title} ${item.number ?? ""} ${item.office}`).includes(searchKey(query)) &&
      (filter === "Wszystkie" ||
        sowGroup(
          item,
          tasks.some((entry) => entry.caseId === item.id),
        ) === filter),
  );
  const scope = data.scope === "dependent" ? "Podopieczny" : "Moje sprawy";
  const displayCases = (rows: SowCase[]) => (
    <div className="nx-list">
      {rows.map((item) => {
        const next = tasks.find((entry) => entry.caseId === item.id);
        return (
          <Row
            key={item.id}
            glyph="support"
            title={item.title}
            meta={[
              item.number,
              item.office,
              item.jstCaseStatus ?? item.applicationStatus ?? item.survey?.status,
              warsaw(item.updatedAt),
              next?.action,
            ]
              .filter(Boolean)
              .join(" · ")}
            onClick={() => go("sprawa", item.id)}
          />
        );
      })}
    </div>
  );
  const unreadMessages = messages.filter(
    (item) => item.direction === "incoming" && !item.read,
  ).length;
  const listedMessages = messages.filter(
    (item) => item.direction === (mailbox === "Odebrane" ? "incoming" : "outgoing"),
  );

  return (
    <div className="nx-stage civic-view">
      <PageHead title="Wsparcie PFRON" lede="Wnioski, dokumenty i informacje o Twoim wsparciu" />
      <Filters
        label="Wsparcie PFRON"
        value={section}
        options={tabs}
        onChange={(key) => go("urzad", `pfron/${key}`)}
      />
      <Field label="Kontekst">
        {(field) => (
          <select
            {...field}
            value={scope}
            onChange={(e) =>
              change((s) => ({
                ...s,
                scope: e.target.value === "Podopieczny" ? "dependent" : "personal",
              }))
            }
          >
            <option>Moje sprawy</option>
            <option>Podopieczny</option>
          </select>
        )}
      </Field>
      <Freshness data={data} retry={() => change((s) => ({ ...s, health: "ready" }))} />
      {section === "home" && (
        <>
          <section className="civic-stack">
            <h2>Wymaga działania ({tasks.length})</h2>
            <TaskRows tasks={tasks} />
          </section>
          <section className="civic-stack">
            <h2>Ostatnie zdarzenia</h2>
            <div className="nx-list">
              {data.events
                .filter((item) => visible(data, item))
                .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
                .slice(0, 3)
                .map((item) => (
                  <Row
                    key={item.id}
                    glyph="timeline"
                    title={item.title}
                    meta={warsaw(item.at)}
                    onClick={() => openTarget(item.target)}
                  />
                ))}
            </div>
            <Button onClick={() => go("powiadomienia", "pfron")}>Wszystkie powiadomienia</Button>
          </section>
          <div className="nx-actions">
            <Button primary onClick={() => go("urzad", "pfron/new")}>
              Złóż wniosek
            </Button>
            <Button onClick={() => go("urzad", "pfron/cases")}>Wszystkie sprawy</Button>
            <Button onClick={() => go("wyglad")}>Wygląd i dostępność</Button>
            <Button onClick={() => go("urzad", "pfron/help")}>Pomoc i kontakt</Button>
          </div>
          <DemoPanel
            reset={() => {
              reset();
              Object.assign(listState, { filter: "Wszystkie", query: "", mailbox: "Odebrane" });
            }}
          >
            <Field label="Stan źródła">
              {(field) => (
                <select
                  {...field}
                  value={data.health}
                  onChange={(e) =>
                    change((s) => ({ ...s, health: e.target.value as SourceHealth }))
                  }
                >
                  <option value="ready">Dane dostępne</option>
                  <option value="loading">Ładowanie</option>
                  <option value="empty">Brak danych</option>
                  <option value="error">Błąd pobrania</option>
                  <option value="stale">Dane nieaktualne</option>
                  <option value="forbidden">Brak dostępu</option>
                </select>
              )}
            </Field>
            <Button
              onClick={() =>
                change((s) => ({
                  ...s,
                  cases: s.cases.map((item) =>
                    item.applicationStatus === "Do poprawy"
                      ? { ...item, version: item.version + 1 }
                      : item,
                  ),
                }))
              }
            >
              Zmień wersję wniosku w źródle
            </Button>
            <Button
              onClick={() =>
                change((s) =>
                  updateSowDeadline(s, "DEMO-pfron-103-deposit", "2026-12-04T10:00:00+01:00"),
                )
              }
            >
              Zmień termin kaucji w scenariuszu
            </Button>
          </DemoPanel>
        </>
      )}
      {section === "cases" && (
        <>
          <Field label="Szukaj sprawy">
            {(field) => (
              <input
                {...field}
                type="search"
                value={query}
                onChange={(e) => {
                  listState.query = e.target.value;
                  setQuery(e.target.value);
                }}
              />
            )}
          </Field>
          <Filters
            label="Stan sprawy"
            value={filter}
            options={caseFilters}
            onChange={(value) => {
              listState.filter = value;
              setFilter(value);
            }}
          />
          {filtered.length ? (
            displayCases(filtered)
          ) : (
            <p role="status">
              {cases.length
                ? "Brak wyników dla tych filtrów."
                : ["ready", "empty"].includes(data.health)
                  ? "Brak spraw w tym kontekście."
                  : "Nie można wyświetlić spraw w bieżącym stanie."}
            </p>
          )}
        </>
      )}
      {section === "messages" && (
        <>
          <p className="nx-fine">Nieprzeczytane wiadomości · {unreadMessages}</p>
          <Filters
            label="Skrzynka PFRON"
            value={mailbox}
            options={["Odebrane", "Wysłane"]}
            onChange={(value) => {
              listState.mailbox = value;
              setMailbox(value);
            }}
          />
          <Button primary onClick={() => go("urzad", "pfron/compose")}>
            Nowa wiadomość
          </Button>
          <div className="nx-list">
            {listedMessages.map((item) => (
              <Row
                key={item.id}
                glyph="letter"
                title={item.title}
                meta={[
                  item.office,
                  item.direction === "incoming" && !item.read ? "Nieprzeczytana" : null,
                  cases.find((c) => c.id === item.caseId)?.title,
                  warsaw(item.at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                onClick={() => {
                  change((s) => ({
                    ...s,
                    extra: { messages: patch(s.extra.messages, item.id, { read: true }) },
                  }));
                  go("urzad", `pfron/message/${item.id}`);
                }}
              />
            ))}
            {!listedMessages.length && <p>Brak wiadomości w tej skrzynce.</p>}
          </div>
        </>
      )}
      {section === "message" &&
        (message ? (
          <article className="nx-sheet civic-stack">
            <h2>{message.title}</h2>
            <p>
              {message.office} · {warsaw(message.at)}
            </p>
            <p className="civic-doc-body">{message.body}</p>
            {message.attachment && (
              <p>
                Załącznik · {message.attachment.name}. Zapisano metadane. Aby dołączyć plik
                ponownie, wybierz go z urządzenia.
              </p>
            )}
            {message.caseId && (
              <Button onClick={() => go("sprawa", message.caseId!)}>Otwórz sprawę</Button>
            )}
            {message.replyAllowed ? (
              <Button primary onClick={() => go("urzad", `pfron/compose/${message.id}`)}>
                Odpowiedz
              </Button>
            ) : (
              message.direction === "incoming" && (
                <p>
                  To wiadomość automatyczna. W sprawie pytań napisz nową wiadomość do realizatora.
                </p>
              )
            )}
          </article>
        ) : (
          <p role="status">Brak dostępu do wiadomości w tym kontekście.</p>
        ))}
      {section === "compose" &&
        (resource && !message?.replyAllowed ? (
          <p role="status">Odpowiedź niedostępna w tym kontekście.</p>
        ) : (
          <Compose key={data.scope} parent={message} />
        ))}
      {section === "correction" &&
        (current ? (
          <Correction key={current.id} item={current} />
        ) : (
          <p role="status">Brak dostępu do tej sprawy.</p>
        ))}
      {section === "new" &&
        (resource && !current ? (
          <p role="status">Brak dostępu do szkicu w tym kontekście.</p>
        ) : (
          <SowWizard key={`${data.scope}/${resource ?? "new"}`} existing={current} />
        ))}
      {section === "help" && (
        <section className="nx-sheet civic-stack">
          <h2>Pomoc i kontakt</h2>
          <p>
            Wybierz realizatora w formularzu wiadomości. Dostępność możesz zmienić w ustawieniach
            NEXUS.
          </p>
          <a className="nx-btn" href="https://www.pfron.org.pl/" rel="noreferrer" target="_blank">
            Otwórz serwis PFRON i informacje o PJM
          </a>
        </section>
      )}
    </div>
  );
}

function Compose({ parent }: { parent?: SowMessage }) {
  const { data, change } = useSow();
  const go = useNexus((s) => s.go);
  const [fields, setFields] = useState({
    type: parent?.type ?? "Ogólna",
    office: parent?.office ?? "",
    caseId: parent?.caseId ?? "",
    title: parent ? `Odp: ${parent.title}` : "",
    body: "",
  });
  const [file, setFile] = useState<File>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof fields, value: string) =>
    setFields((s) => ({ ...s, [key]: value }));
  const cases = data.cases.filter((item) => visible(data, item));
  return (
    <form
      className="nx-form civic-stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const message: SowMessage = {
          ...fields,
          id: demoId("pfron", "message"),
          source: "pfron",
          scope: data.scope,
          caseId: fields.caseId || null,
          direction: "outgoing",
          read: true,
          replyAllowed: false,
          at: demoNow,
          attachment: file ? fileMetadata(file) : undefined,
        };
        const invalid = validateSowMessage(message, data);
        if (data.health !== "ready")
          invalid.source = "Nie można wysłać wiadomości. Wpisana treść jest nadal dostępna.";
        setErrors(invalid);
        if (Object.keys(invalid).length) return;
        change((s) => sendSowMessage(s, message));
        listState.mailbox = "Wysłane";
        useNexus.getState().showToast("Wysłano wiadomość demonstracyjną");
        go("urzad", "pfron/messages");
      }}
    >
      <h2>Nowa wiadomość</h2>
      <Errors errors={errors} />
      <Field label="Typ wiadomości">
        {(props) => (
          <select {...props} value={fields.type} onChange={(e) => set("type", e.target.value)}>
            {["Ogólna", "Wniosek", "Umowa", "Ankieta"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Realizator" error={errors.office}>
        {(props) => (
          <select {...props} value={fields.office} onChange={(e) => set("office", e.target.value)}>
            <option value="">Wybierz realizatora</option>
            <option>Jednostka PFRON Demo</option>
          </select>
        )}
      </Field>
      <Field label="Powiązana sprawa" error={errors.caseId}>
        {(props) => (
          <select {...props} value={fields.caseId} onChange={(e) => set("caseId", e.target.value)}>
            <option value="">Bez powiązania</option>
            {cases.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Temat" error={errors.title}>
        {(props) => (
          <input {...props} value={fields.title} onChange={(e) => set("title", e.target.value)} />
        )}
      </Field>
      <Field label="Treść" error={errors.body}>
        {(props) => (
          <textarea
            {...props}
            rows={5}
            value={fields.body}
            onChange={(e) => set("body", e.target.value)}
          />
        )}
      </Field>
      <p className="nx-fine">{[...fields.body].length} / 2000 znaków</p>
      <Field label="Załącznik (opcjonalny, do 20 MB)" error={errors.attachment}>
        {(props) => <input {...props} type="file" onChange={(e) => setFile(e.target.files?.[0])} />}
      </Field>
      {file && (
        <Button onClick={() => download(`DEMO-${file.name}`, file, file.type)}>
          Pobierz wybrany plik
        </Button>
      )}
      <button className="nx-btn nx-btn-primary" type="submit">
        Wyślij wiadomość demonstracyjną
      </button>
    </form>
  );
}

function Correction({ item }: { item: SowCase }) {
  const { data, change } = useSow();
  const go = useNexus((s) => s.go);
  const id = `${item.id}-draft-correction`;
  const [draft, setDraft] = useState<Draft>(
    () =>
      data.drafts.find((entry) => entry.id === id) ?? {
        id,
        source: "pfron",
        scope: item.scope,
        serviceId: "correction",
        caseId: item.id,
        step: 0,
        values: { body: "" },
        attachments: [],
        baseVersion: item.version,
      },
  );
  const [error, setError] = useState("");
  if (!sowActions(data, item).includes("correction"))
    return <p role="status">Poprawka jest już niedostępna. Otwórz aktualny stan sprawy.</p>;
  return (
    <section className="nx-sheet civic-stack">
      <h2>Zakres poprawy</h2>
      <p>{item.summary}</p>
      {error && (
        <p className="civic-error" role="alert">
          {error}
        </p>
      )}
      <Field label="Treść uzupełnienia" error={error.includes("Wpisz") ? error : undefined}>
        {(field) => (
          <textarea
            {...field}
            rows={5}
            value={draft.values.body}
            onChange={(e) => setDraft({ ...draft, values: { body: e.target.value } })}
          />
        )}
      </Field>
      <Button
        onClick={() => {
          change((s) => saveDraft(s, draft));
          useNexus.getState().showToast("Zapisano szkic. Zadanie jest nadal otwarte.");
        }}
      >
        Zapisz szkic
      </Button>
      {draft.baseVersion !== item.version && (
        <Button
          onClick={() => {
            const refreshed = { ...draft, baseVersion: item.version };
            change((s) => saveDraft(s, refreshed));
            setDraft(refreshed);
            setError("");
          }}
        >
          Wczytaj aktualną wersję, zachowaj treść
        </Button>
      )}
      <Action
        title="Przekazać poprawkę w demonstracji?"
        body="Poprawka zostanie zapisana w prototypie. SOW PFRON jej nie otrzyma."
        onConfirm={() => {
          const current = useSow.getState().data;
          const result = submitCorrection(current, draft);
          if (result.error) {
            setError(result.error);
            change((s) => saveDraft(s, draft));
            return;
          }
          change(() => result.data);
          useNexus.getState().showToast("Przekazano uzupełnienie demonstracyjne");
          go("sprawa", item.id);
        }}
      >
        Symuluj wysłanie poprawki
      </Action>
    </section>
  );
}

function SowWizard({ existing }: { existing?: SowCase }) {
  const { data, change } = useSow();
  const go = useNexus((s) => s.go);
  const [draft, setDraft] = useState<Draft>(
    () =>
      data.drafts.find((item) => item.caseId === existing?.id && item.serviceId === "funding") ?? {
        id: demoId("pfron", "draft"),
        source: "pfron",
        scope: data.scope,
        serviceId: "funding",
        caseId: null,
        step: 0,
        values: {},
        attachments: [],
      },
  );
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(false);
  const values = draft.values;
  const stages = [
    "Rodzaj wsparcia",
    "Miejsce i nabór",
    "Dane wniosku",
    "Załączniki",
    "Podsumowanie",
  ];
  const set = (key: string, value: string) =>
    setDraft({ ...draft, values: { ...values, [key]: value } });
  function persistDraft(submit = false) {
    if (!visible(data, draft) || (submit && data.health !== "ready")) {
      setError("Źródło niedostępne. Zachowano wpisane dane.");
      return;
    }
    if (submit && draft.attachments.length && !selectedFiles) {
      setError("Wybierz pliki ponownie. Szkic zawiera tylko metadane.");
      return;
    }
    const id = draft.caseId ?? `${draft.id}-case`;
    const item: SowCase = {
      ...existing,
      id,
      source: "pfron",
      scope: draft.scope,
      kind: "funding",
      title: values.kind || "Nowy wniosek PFRON",
      number: submit ? `DEMO/SOW/${id.slice(-8)}/2026` : undefined,
      office: "Jednostka PFRON Demo",
      sourceStatus: submit ? "W toku" : "Robocza",
      applicationStatus: submit ? "Złożony" : "Zapisany roboczo",
      jstCaseStatus: submit ? "Weryfikacja" : undefined,
      updatedAt: demoNow,
      summary: values.body || "Szkic wniosku",
      version: (existing?.version ?? 0) + 1,
    };
    change((s) => {
      if (s.cases.some((entry) => entry.id === id && entry.applicationStatus === "Złożony"))
        return s;
      const next = { ...s, cases: [...s.cases.filter((entry) => entry.id !== id), item] };
      return submit
        ? publish(
            {
              ...next,
              drafts: next.drafts.filter((entry) => entry.id !== draft.id),
              documents: [
                ...next.documents,
                doc(item, "wniosek", "Wniosek PFRON (demo)", {
                  body: values.body,
                  attachments: draft.attachments,
                  direction: "outgoing",
                  submission: "sent",
                }),
              ],
            },
            eventFor(
              item,
              "application.submitted",
              "Złożono wniosek demonstracyjny",
              { kind: "case", id },
              id,
              { evidence: "ui" },
            ),
          )
        : saveDraft(next, { ...draft, caseId: id });
    });
    go("sprawa", id);
  }
  return (
    <section className="nx-sheet civic-stack">
      <h2>{stages[draft.step]}</h2>
      <p className="nx-fine">
        Krok {draft.step + 1} z {stages.length}
      </p>
      {error && (
        <p role="alert" className="civic-error">
          {error}
        </p>
      )}
      {draft.step === 0 && (
        <Field label="Rodzaj wsparcia">
          {(field) => (
            <select
              {...field}
              value={values.kind ?? ""}
              onChange={(e) => set("kind", e.target.value)}
            >
              <option value="">Wybierz</option>
              {[
                "Dofinansowanie edukacji",
                "Likwidacja barier",
                "Turnus rehabilitacyjny",
                "Technologie wspomagające",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          )}
        </Field>
      )}
      {draft.step === 1 && (
        <>
          <Field label="Województwo">
            {(field) => (
              <select
                {...field}
                value={values.region ?? ""}
                onChange={(e) => set("region", e.target.value)}
              >
                <option value="">Wybierz</option>
                <option>Mazowieckie</option>
                <option>Małopolskie</option>
                <option>Dolnośląskie</option>
              </select>
            )}
          </Field>
          <Field label="Jednostka i nabór demonstracyjny">
            {(field) => (
              <select
                {...field}
                value={values.office ?? ""}
                onChange={(e) => set("office", e.target.value)}
              >
                <option value="">Wybierz</option>
                <option>Jednostka powiatowa Demo</option>
                <option>Urząd marszałkowski Demo</option>
              </select>
            )}
          </Field>
          {values.office !== "Urząd marszałkowski Demo" && (
            <Field label="Powiat">
              {(field) => (
                <input
                  {...field}
                  value={values.county ?? ""}
                  onChange={(e) => set("county", e.target.value)}
                />
              )}
            </Field>
          )}
          <p className="nx-fine">Dla urzędu marszałkowskiego wybierz samo województwo.</p>
        </>
      )}
      {draft.step === 2 && (
        <Field label="Opisz potrzebę wsparcia">
          {(field) => (
            <textarea
              {...field}
              value={values.body ?? ""}
              onChange={(e) => set("body", e.target.value)}
            />
          )}
        </Field>
      )}
      {draft.step === 3 && (
        <Field label="Załączniki demonstracyjne (opcjonalne)">
          {(field) => (
            <input
              {...field}
              type="file"
              multiple
              onChange={(e) => {
                setSelectedFiles(true);
                setDraft({ ...draft, attachments: Array.from(e.target.files ?? [], fileMetadata) });
              }}
            />
          )}
        </Field>
      )}
      {draft.step >= 3 &&
        draft.attachments.map((file) => (
          <p key={file.name}>
            {file.name} · {file.size} B (metadane szkicu)
          </p>
        ))}
      {draft.step === 4 && (
        <>
          <p>
            {values.kind} · {values.office} · {values.region}
          </p>
          <p>{values.body}</p>
          <Action
            title="Złożyć wniosek demonstracyjny?"
            body="Zapis dotyczy danych wzoru."
            onConfirm={() => persistDraft(true)}
          >
            Symuluj złożenie wniosku
          </Action>
        </>
      )}
      <div className="nx-actions">
        {draft.step > 0 && (
          <Button
            onClick={() => {
              setError("");
              setDraft({ ...draft, step: draft.step - 1 });
            }}
          >
            Wstecz
          </Button>
        )}
        <Button onClick={() => persistDraft()}>Zapisz szkic</Button>
        {draft.step < 4 && (
          <Button
            primary
            onClick={() => {
              const required = [
                !values.kind,
                !values.region ||
                  !values.office ||
                  (values.office !== "Urząd marszałkowski Demo" && !values.county?.trim()),
                !values.body?.trim(),
              ];
              if (required[draft.step]) {
                setError("Uzupełnij wymagane pola na tym kroku.");
                return;
              }
              setError("");
              setDraft({ ...draft, step: draft.step + 1 });
            }}
          >
            Dalej
          </Button>
        )}
      </div>
    </section>
  );
}

export function SowDetails({ item }: { item: SowCase }) {
  const { data, change } = useSow();
  const go = useNexus((s) => s.go);
  const [text, setText] = useState(item.settlement?.draft ?? item.survey?.response ?? "");
  const actions = sowActions(data, item);
  const deposit = data.tasks.find(
    (entry) => entry.id === `${item.id}-deposit` && !entry.completedAt,
  );
  const messages = data.extra.messages.filter(
    (entry) => entry.caseId === item.id && visible(data, entry),
  );
  const update = (fields: Partial<SowCase>, title: string, taskId?: string) => {
    change((s) => {
      const current = s.cases.find((entry) => entry.id === item.id);
      if (
        !current ||
        !visible(s, current) ||
        s.health !== "ready" ||
        current.version !== item.version
      )
        return s;
      const next = {
        ...s,
        cases: patch(s.cases, item.id, {
          ...fields,
          updatedAt: demoNow,
          version: item.version + 1,
        }),
      };
      return publish(
        taskId ? complete(next, taskId) : next,
        eventFor(item, "case.updated", title, { kind: "case", id: item.id }, item.id, {
          version: item.version + 1,
        }),
        "info",
        false,
      );
    });
  };
  return (
    <>
      <section className="nx-sheet civic-stack">
        <h2>Stan wsparcia</h2>
        {item.applicationStatus && <p>Wniosek · {item.applicationStatus}</p>}
        {item.jstCaseStatus && <p>Sprawa JST · {item.jstCaseStatus}</p>}
        {item.contractStatus && <p>Umowa · {item.contractStatus}</p>}
        {actions.includes("correction") && (
          <Button primary onClick={() => go("urzad", `pfron/correction/${item.id}`)}>
            Otwórz poprawkę
          </Button>
        )}
        {actions.includes("resume") && (
          <Button primary onClick={() => go("urzad", `pfron/new/${item.id}`)}>
            Wznów szkic wniosku
          </Button>
        )}
      </section>
      {item.settlement && (
        <section className="nx-sheet civic-stack">
          <h2>Rozliczenie</h2>
          <p>{item.settlement.status}</p>
          {item.settlement.paymentReported && (
            <p>SOW wskazuje wypłatę. Sprawdź zaksięgowanie w swoim banku.</p>
          )}
          {actions.includes("settlement") && (
            <>
              <Field label="Treść poprawki rozliczenia">
                {(field) => (
                  <textarea {...field} value={text} onChange={(e) => setText(e.target.value)} />
                )}
              </Field>
              <Button
                onClick={() =>
                  update(
                    { settlement: { ...item.settlement!, draft: text } },
                    "Zapisano szkic rozliczenia",
                  )
                }
              >
                Zapisz szkic rozliczenia
              </Button>
              {text.trim() && (
                <Action
                  title="Przekazać poprawkę rozliczenia?"
                  body="Operacja jest zapisem demonstracyjnym."
                  onConfirm={() =>
                    update(
                      {
                        settlement: {
                          ...item.settlement!,
                          draft: text,
                          status: "Rozliczenie przekazane",
                        },
                      },
                      "Przekazano rozliczenie demonstracyjne",
                    )
                  }
                >
                  Symuluj przekazanie rozliczenia
                </Action>
              )}
            </>
          )}
        </section>
      )}
      {item.technology && (
        <section className="nx-sheet civic-stack">
          <h2>Technologie wspomagające</h2>
          <p>Wniosek technologiczny · {item.technology.applicationStatus}</p>
          <p>Umowa technologiczna · {item.technology.contractStatus}</p>
          <p>{item.technology.fulfilment}</p>
          <p>
            Kaucja demonstracyjna · {item.technology.deposit} zł ·{" "}
            {item.technology.paid ? "Symulacja zakończona" : "Oczekuje"}
          </p>
          {deposit?.dueAt && <p>Termin kaucji demo · {warsaw(deposit.dueAt)}</p>}
          {actions.includes("deposit") && (
            <Action
              title="Uruchomić symulację kaucji?"
              body="Nie zostanie pobrana żadna opłata."
              onConfirm={() =>
                update(
                  { technology: { ...item.technology!, paid: true } },
                  "Symulacja kaucji zakończona",
                  `${item.id}-deposit`,
                )
              }
            >
              Symuluj płatność kaucji
            </Action>
          )}
        </section>
      )}
      {item.turnus && (
        <section className="nx-sheet civic-stack">
          <h2>Turnus</h2>
          <p>Wniosek · {item.turnus.application}</p>
          <p>
            Informacja o wyborze · {item.turnus.choice.status} · {item.turnus.choice.detail}
          </p>
          <Row
            glyph="documents"
            title={`Oświadczenie organizatora · ${item.turnus.declaration.status}`}
            onClick={() => go("pismo", item.turnus!.declaration.documentId)}
          />
          {actions.includes("turnus") && (
            <>
              <Field label="Informacja o organizatorze">
                {(field) => (
                  <input {...field} value={text} onChange={(e) => setText(e.target.value)} />
                )}
              </Field>
              <Button
                disabled={!text.trim()}
                onClick={() =>
                  update(
                    {
                      turnus: {
                        ...item.turnus!,
                        choice: { detail: text, status: "Przekazano (demo)" },
                      },
                    },
                    "Zapisano informację o turnusie",
                  )
                }
              >
                Zapisz poprawkę demonstracyjną
              </Button>
            </>
          )}
        </section>
      )}
      {item.survey && (
        <section className="nx-sheet civic-stack">
          <h2>Ankieta</h2>
          <p>
            {item.survey.office} · {item.survey.status}
          </p>
          {actions.includes("survey") && (
            <>
              <Field label="Jakiego wsparcia potrzebujesz?">
                {(field) => (
                  <textarea {...field} value={text} onChange={(e) => setText(e.target.value)} />
                )}
              </Field>
              <Button
                disabled={!text.trim()}
                onClick={() =>
                  update(
                    { survey: { ...item.survey!, response: text, status: "Wypełniona w demo" } },
                    "Zapisano odpowiedź na ankietę",
                  )
                }
              >
                Zapisz ankietę demonstracyjną
              </Button>
            </>
          )}
        </section>
      )}
      <section className="civic-stack">
        <h2>Korespondencja w sprawie</h2>
        {messages.length ? (
          <div className="nx-list">
            {messages.map((entry) => (
              <Row
                key={entry.id}
                glyph="letter"
                title={entry.title}
                meta={warsaw(entry.at)}
                onClick={() => {
                  change((s) => ({
                    ...s,
                    extra: { messages: patch(s.extra.messages, entry.id, { read: true }) },
                  }));
                  go("urzad", `pfron/message/${entry.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <p>Brak wiadomości w tej sprawie.</p>
        )}
      </section>
    </>
  );
}

export function SowDocumentActions({ item }: { item: CivicDocument }) {
  const change = useSow((s) => s.change);
  const signature = item.signature;
  if (!signature || signature.completed >= signature.required) return null;
  return (
    <Action
      title="Zasymulować podpis dokumentu?"
      body="Zmieni się stan podpisu w demonstracji."
      onConfirm={() => {
        change((data) => {
          const current = data.documents.find((entry) => entry.id === item.id);
          if (
            !current ||
            !visible(data, current) ||
            data.health !== "ready" ||
            !current.signature ||
            current.signature.completed >= current.signature.required
          )
            return data;
          return {
            ...data,
            documents: patch(data.documents, item.id, {
              signature: { ...signature, completed: signature.required },
            }),
            cases: data.cases.map((entry) =>
              entry.id === item.caseId && entry.technology
                ? {
                    ...entry,
                    technology: { ...entry.technology, contractStatus: "Podpisana (demo)" },
                  }
                : entry,
            ),
          };
        });
        if (
          useSow.getState().data.documents.find((entry) => entry.id === item.id)?.signature
            ?.completed === signature.required
        )
          useNexus.getState().showToast("Symulacja zakończona");
      }}
    >
      Symuluj podpisanie
    </Action>
  );
}
