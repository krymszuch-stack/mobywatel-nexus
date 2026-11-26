import { useEffect, useState } from "react";
import { zusForm, zusOffice } from "@/lib/nexus/civic/forms";
import {
  demoId,
  demoNow,
  eventFor,
  patch,
  publish,
  searchKey,
  visible,
  warsaw,
  type CivicCase,
  type CivicDocument,
  type SourceHealth,
} from "@/lib/nexus/civic/model";
import {
  certificationScopes,
  contributions,
  ezus,
  insurance,
  pension,
  useZus,
  zusBenefits,
  zusCatalog,
  zusSettings,
  type Preparation,
} from "@/lib/nexus/civic/zus";
import { useNexus } from "@/lib/nexus/store";
import { PageHead, Row } from "../ui";
import { Appointments } from "./appointments";
import { Button, DemoPanel, External, Field, Filters, Freshness, TaskRows } from "./ui";
import { CivicWizard } from "./wizard";

const tabs: [string, string][] = [
  ["home", "Przegląd"],
  ["insurance", "Ubezpieczenia"],
  ["benefits", "Świadczenia"],
  ["documents", "Dokumenty"],
  ["more", "Więcej"],
];
const money = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
const channels = ["E-mail", "SMS"];

export function ZusHealthSource({ compact = false }: { compact?: boolean }) {
  const data = useZus((s) => s.data);
  const go = useNexus((s) => s.go);
  return (
    <section className="nx-sheet civic-stack">
      <h2>Zgłoszenie do ubezpieczenia zdrowotnego</h2>
      {["ready", "error", "stale"].includes(data.health) ? (
        <>
          <p>
            Źródło ZUS · {insurance.healthBranch} · aktualizacja {warsaw(insurance.at, true)}
          </p>
          <p>Zgłoszeni członkowie rodziny · {insurance.family.join(", ")}</p>
        </>
      ) : (
        <p>Brak danych o zgłoszeniu w tym widoku.</p>
      )}
      <strong>Brak potwierdzenia prawa do świadczeń w tym źródle</strong>
      <p>
        ZUS udostępnia informację o zgłoszeniu. Prawo do świadczeń wymaga odrębnego potwierdzenia.
      </p>
      <Button onClick={() => (compact ? go("urzad", "zus/insurance") : go("zdrowie"))}>
        {compact ? "Zobacz ubezpieczenia w ZUS" : "Przejdź do Zdrowie (mojeIKP)"}
      </Button>
    </section>
  );
}

export function Zus({ section, resource }: { section: string; resource?: string }) {
  const { data, change, reset } = useZus();
  const go = useNexus((s) => s.go);
  const tasks = data.tasks
    .filter((item) => visible(data, item) && !item.completedAt)
    .sort((a, b) => (data.extra.urgent ? Number(Boolean(b.dueAt)) - Number(Boolean(a.dueAt)) : 0));
  const cases = data.cases.filter((item) => visible(data, item));
  const docs = data.documents.filter((item) => visible(data, item));
  const useWizard =
    section === "form" &&
    (!resource ||
      !resource.startsWith("DEMO-") ||
      data.drafts.some((item) => item.id === resource && visible(data, item)) ||
      cases.some((item) => item.id === resource));
  const draft = data.drafts.find((item) => item.id === resource && visible(data, item));
  const service = zusForm(
    draft?.serviceId ?? (resource?.startsWith("DEMO-") ? "uzupelnienie" : (resource ?? "pog")),
  );
  function showScenario(health: SourceHealth, urgent = false) {
    change((s) => ({ ...s, health, extra: { ...s.extra, urgent } }));
  }
  return (
    <div className="nx-stage civic-view">
      <PageHead kicker="Dane demonstracyjne" title="ZUS — ubezpieczenia i świadczenia" />
      <Filters
        label="Sekcje ZUS"
        value={section}
        options={tabs}
        onChange={(key) => go("urzad", `zus/${key}`)}
      />
      <Freshness data={data} retry={() => showScenario("ready")} />
      {section === "home" && (
        <>
          <section className="civic-stack">
            <h2>Wymaga Twojej uwagi</h2>
            <TaskRows tasks={tasks.slice(0, 3)} />
          </section>
          <section className="nx-sheet civic-stack">
            <h2>Zgłoszenie do ubezpieczeń</h2>
            <p>
              {["ready", "error", "stale"].includes(data.health)
                ? `Płatnik · ${insurance.payer}`
                : "Brak danych o zgłoszeniu."}
            </p>
            <Button onClick={() => go("urzad", "zus/insurance")}>
              Zobacz zgłoszenie i płatnika
            </Button>
          </section>
          <div className="nx-actions">
            <Button primary onClick={() => go("urzad", "zus/contributions")}>
              Sprawdź składki
            </Button>
            <Button onClick={() => go("urzad", "zus/certificates")}>Pobierz zaświadczenie</Button>
            <Button onClick={() => go("urzad", "zus/form/pog")}>Utwórz sprawę</Button>
          </div>
          <section className="civic-stack">
            <h2>Ostatnie sprawy ZUS</h2>
            {cases.slice(0, 3).map((item) => (
              <Row
                key={item.id}
                glyph="case"
                title={item.title}
                meta={item.sourceStatus ?? "Brak informacji o rozstrzygnięciu"}
                onClick={() => go("sprawa", item.id)}
              />
            ))}
            {tasks
              .filter((item) => item.dueAt)
              .sort((a, b) => Date.parse(a.dueAt!) - Date.parse(b.dueAt!))
              .slice(0, 1)
              .map((item) => (
                <p key={item.id}>Najbliższy termin demonstracyjny · {warsaw(item.dueAt!)}</p>
              ))}
            <Button onClick={() => go("sprawy", "zus")}>Otwórz Moje sprawy</Button>
          </section>
          <DemoPanel reset={reset}>
            <Filters
              label="Scenariusz ZUS"
              value={data.extra.urgent ? "urgent" : data.health}
              options={[
                ["ready", "Standardowy"],
                ["urgent", "Wymaga działania"],
                ["empty", "Brak danych"],
                ["error", "Usługa niedostępna"],
                ["stale", "Dane nieaktualne"],
                ["forbidden", "Brak dostępu"],
              ]}
              onChange={(key) =>
                showScenario(key === "urgent" ? "ready" : (key as SourceHealth), key === "urgent")
              }
            />
            <label>
              <input
                type="checkbox"
                checked={data.extra.archiveError}
                onChange={(e) =>
                  change((s) => ({ ...s, extra: { ...s.extra, archiveError: e.target.checked } }))
                }
              />{" "}
              Błąd przygotowania archiwum
            </label>
          </DemoPanel>
        </>
      )}
      {(section === "insurance" || section === "contributions") && (
        <InsuranceView detail={section === "contributions"} />
      )}
      {section === "benefits" && (
        <section className="civic-stack">
          <h2>Programy i świadczenia</h2>
          <p>Każda sprawa ma własny status. Warunki programów znajdziesz w oficjalnym serwisie.</p>
          {zusBenefits.map((item) => (
            <article key={item.id} className="nx-sheet civic-stack">
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              {item.variants && (
                <ul className="nx-bullets">
                  {item.variants.map((variant) => (
                    <li key={variant}>{variant}</li>
                  ))}
                </ul>
              )}
              {item.id === "wspierajace" ? (
                <>
                  {cases
                    .filter((entry) => entry.id === "DEMO-zus-support")
                    .map((entry) => (
                      <Row
                        key={entry.id}
                        glyph="case"
                        title={entry.title}
                        meta={entry.sourceStatus ?? undefined}
                        onClick={() => go("sprawa", entry.id)}
                      />
                    ))}
                  <div className="nx-actions">
                    <Button primary onClick={() => go("urzad", "zus/form/swiadczenie")}>
                      Złóż wniosek
                    </Button>
                    <Button onClick={() => go("urzad", "zus/form/zmiana")}>Zgłoś zmianę</Button>
                    <Button onClick={() => go("urzad", "zus/form/opiekun")}>
                      Sprawy opiekuna i rodziny
                    </Button>
                    <Button onClick={() => go("urzad", "pfron/home")}>
                      Przejdź do Wsparcia PFRON
                    </Button>
                  </div>
                </>
              ) : (
                <External href={ezus}>Sprawdź program w eZUS</External>
              )}
            </article>
          ))}
        </section>
      )}
      {section === "documents" && <ZusDocuments docs={docs} resource={resource} />}
      {section === "more" && <ZusCatalog />}
      {section === "visits" && (
        <Appointments data={data} change={change} office={zusOffice} selectedId={resource} />
      )}
      {section === "certificates" && <Preparations kind="certificate" />}
      {section === "archive" && <Preparations kind="archive" />}
      {section === "settings" && (
        <section className="nx-sheet civic-stack">
          <h2>Ustawienia powiadomień</h2>
          <p>
            Ustawienia demonstracyjne · konto osobiste. Kontakty Dobrego Startu mogą pochodzić z
            osobnego wniosku DS.
          </p>
          {zusSettings.map((group) => (
            <fieldset key={group} className="civic-stack">
              <legend>{group}</legend>
              {channels.map((channel) => {
                const key = `${data.scope}/${group}/${channel}`;
                return (
                  <Field key={key} label={`${channel} · ${group}`}>
                    {(field) => (
                      <select
                        {...field}
                        value={data.extra.preferences[key] ?? "Brak"}
                        onChange={(e) => {
                          const value = e.target.value;
                          change((s) => ({
                            ...s,
                            extra: {
                              ...s.extra,
                              preferences: { ...s.extra.preferences, [key]: value },
                            },
                          }));
                        }}
                      >
                        <option>Brak</option>
                        <option>Pojedynczo</option>
                        <option>Zbiorczo</option>
                      </select>
                    )}
                  </Field>
                );
              })}
            </fieldset>
          ))}
          <External href={ezus}>Otwórz ustawienia źródłowe w eZUS</External>
        </section>
      )}
      {section === "form" &&
        (useWizard ? (
          <CivicWizard
            key={resource ?? "pog"}
            data={data}
            change={change}
            spec={service}
            draftId={draft?.id}
            caseId={draft?.caseId ?? (cases.some((item) => item.id === resource) ? resource : null)}
            confirmText="Symuluj wysłanie"
          />
        ) : (
          <p role="status">Brak dostępu do formularza w tym kontekście.</p>
        ))}
    </div>
  );
}

function InsuranceView({ detail }: { detail: boolean }) {
  const data = useZus((s) => s.data);
  const go = useNexus((s) => s.go);
  const [year, setYear] = useState("2026");
  const [payer, setPayer] = useState("all");
  if (["empty", "forbidden", "expired", "loading"].includes(data.health))
    return <p role="status">Ubezpieczenia i składki nie są dostępne w bieżącym widoku.</p>;
  return (
    <>
      <section className="nx-sheet civic-stack">
        <h2>Zgłoszenie i płatnik</h2>
        <p>
          {insurance.payer} · od {warsaw(insurance.start)}
        </p>
        <p>{insurance.types.join(" · ")}</p>
        <p>Świadczenia i przerwy · brak informacji w tym scenariuszu.</p>
        {!detail && (
          <Button primary onClick={() => go("urzad", "zus/contributions")}>
            Sprawdź składki płatnika
          </Button>
        )}
      </section>
      <ZusHealthSource />
      {detail && (
        <section className="nx-sheet civic-stack">
          <h2>Podstawy i składki</h2>
          <Field label="Rok składek">
            {(field) => (
              <select {...field} value={year} onChange={(e) => setYear(e.target.value)}>
                <option>2026</option>
                <option>2025</option>
              </select>
            )}
          </Field>
          <Field label="Płatnik">
            {(field) => (
              <select {...field} value={payer} onChange={(e) => setPayer(e.target.value)}>
                <option value="all">Wszyscy płatnicy</option>
                <option>{insurance.payer}</option>
              </select>
            )}
          </Field>
          {contributions
            .filter((item) => item.year === year && (payer === "all" || payer === item.payer))
            .map((item) => (
              <details key={item.month} className="nx-note">
                <summary>
                  {item.month} {item.year}
                </summary>
                {item.base !== undefined && <p>Podstawa wymiaru · {money.format(item.base)}</p>}
                {item.due !== undefined && <p>Składka należna · {money.format(item.due)}</p>}
                {item.paid !== undefined && <p>Składka opłacona · {money.format(item.paid)}</p>}
              </details>
            ))}
        </section>
      )}
      <section className="nx-sheet civic-stack">
        <h2>Moje konto emerytalne</h2>
        <p>
          Konto · {money.format(pension.account)} · subkonto · {money.format(pension.subaccount)}
        </p>
        <details>
          <summary>Roczne informacje i szczegóły</summary>
          {pension.initial !== undefined && (
            <p>Kapitał początkowy · {money.format(pension.initial)}</p>
          )}
          <p>
            {pension.indexation} · raport {pension.reportYear}
          </p>
          <p>OFE · {pension.ofe}</p>
          <p>RIA · {pension.ria}</p>
          <p>{pension.special}</p>
        </details>
        <Button onClick={() => go("urzad", "zus/archive")}>Zamów dane archiwalne</Button>
        <External href={ezus}>Przejdź do kalkulatora w eZUS</External>
      </section>
    </>
  );
}

function Preparations({ kind }: { kind: Preparation["kind"] }) {
  const { data, change } = useZus();
  const go = useNexus((s) => s.go);
  const [scope, setScope] = useState("");
  const [error, setError] = useState("");
  const rows = data.extra.preparation.filter((item) => item.kind === kind);
  function prepare(item: Preparation) {
    change((s) => {
      if (s.health !== "ready") return s;
      const rows = s.extra.preparation;
      return {
        ...s,
        extra: {
          ...s.extra,
          preparation: [
            ...rows.filter((entry) => entry.id !== item.id),
            { ...item, state: "preparing" },
          ],
        },
      };
    });
  }
  useEffect(() => {
    const pending = data.extra.preparation.filter(
      (item) => item.kind === kind && item.state === "preparing",
    );
    const timers = pending.map((item) =>
      window.setTimeout(
        () =>
          change((s) => {
            if (
              !s.extra.preparation.some(
                (entry) => entry.id === item.id && entry.state === "preparing",
              )
            )
              return s;
            const fail = s.health !== "ready" || (kind === "archive" && s.extra.archiveError);
            const source: CivicDocument = {
              id: item.id,
              source: "zus",
              scope: "personal",
              caseId: null,
              office: zusOffice,
              direction: "incoming",
              publishedAt: demoNow,
              kind: kind === "certificate" ? "Zaświadczenie" : "Dane archiwalne",
              title: item.scope,
              version: "1.0",
              format: kind === "certificate" ? "pdf" : "txt",
              body:
                {
                  "Aktualne zgłoszenia": `Płatnik: ${insurance.payer}\nUbezpieczenia: ${insurance.types.join(", ")}`,
                  "Podstawy składek": `Październik 2026\nPodstawa składek demo: ${contributions[0].base} zł`,
                  "Przerwy w pracy": "Brak zapisanych przerw w danych demonstracyjnych.",
                  "Członkowie rodziny": insurance.family.join("\n"),
                }[item.scope] ?? "Przykładowe zestawienie danych z lokalnego scenariusza ZUS.",
            };
            return publish(
              {
                ...s,
                documents: fail
                  ? s.documents
                  : [source, ...s.documents.filter((doc) => doc.id !== item.id)],
                extra: {
                  ...s.extra,
                  preparation: patch(s.extra.preparation, item.id, {
                    state: fail ? "error" : "ready",
                  }),
                },
              },
              eventFor(
                source,
                fail ? "data.error" : "data.ready",
                fail ? "Nie udało się przygotować danych" : "Dane demonstracyjne są gotowe",
                fail
                  ? {
                      kind: "module",
                      id: `zus/${kind === "certificate" ? "certificates" : "archive"}`,
                    }
                  : { kind: "document", id: item.id },
                null,
              ),
            );
          }),
        600,
      ),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [change, data.extra.preparation, kind]);
  return (
    <section className="nx-sheet civic-stack">
      <h2>{kind === "certificate" ? "Zaświadczenia ubezpieczeniowe" : "Dane archiwalne"}</h2>
      <Field label="Zakres danych" error={error}>
        {(field) => (
          <select {...field} value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="">Wybierz zakres</option>
            {certificationScopes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        )}
      </Field>
      <Button
        primary
        onClick={() => {
          if (!scope || data.health !== "ready") {
            setError(!scope ? "Wybierz zakres." : "Usługa jest niedostępna.");
            return;
          }
          setError("");
          prepare({ id: demoId("zus", kind), state: "preparing", scope, kind });
        }}
      >
        {kind === "certificate" ? "Przygotuj zaświadczenie" : "Przygotuj dane archiwalne"}
      </Button>
      <div aria-live="polite">
        {rows.map((item) => (
          <article className="nx-note civic-stack" key={item.id}>
            <strong>{item.scope}</strong>
            <p>
              {item.state === "preparing"
                ? "Trwa przygotowanie"
                : item.state === "ready"
                  ? "Gotowe"
                  : "Błąd przygotowania"}
            </p>
            {item.state === "ready" && (
              <Button onClick={() => go("pismo", item.id)}>Otwórz podgląd</Button>
            )}
            {item.state === "error" && (
              <Button onClick={() => prepare(item)}>Spróbuj ponownie</Button>
            )}
          </article>
        ))}
      </div>
      <details>
        <summary>Format i sposób odbioru</summary>
        <p>
          Zaświadczenie demo jest dostępne jako PDF. Opcje XML, e-mail i dostępność plików sprawdź w
          pełnym eZUS.
        </p>
      </details>
    </section>
  );
}

function ZusDocuments({ docs, resource }: { docs: CivicDocument[]; resource?: string }) {
  const go = useNexus((s) => s.go);
  const drafts = useZus((s) => s.data.drafts);
  const data = useZus((s) => s.data);
  const [filter, setFilter] = useState(resource ?? "Pisma do odbioru");
  const known = ["Pisma do odbioru", "Odebrane", "Wysłane", "Robocze", "e-ZLA"];
  const matches = docs.filter((item) =>
    filter === known[0]
      ? item.delivery === "waiting"
      : filter === known[1]
        ? item.direction === "incoming" && item.delivery !== "waiting" && item.kind !== "e-ZLA"
        : filter === known[2]
          ? item.submission === "sent"
          : filter === known[4]
            ? item.kind === "e-ZLA"
            : false,
  );
  const active = drafts.filter((item) => visible(data, item) && !item.resultId);
  return (
    <section className="civic-stack">
      <h2>Dokumenty ZUS</h2>
      <Filters label="Rodzaj dokumentów ZUS" value={filter} options={known} onChange={setFilter} />
      <div className="nx-list">
        {matches.map((item) => (
          <Row
            key={item.id}
            glyph="letter"
            title={item.title}
            meta={warsaw(item.publishedAt)}
            onClick={() => go("pismo", item.id)}
          />
        ))}
        {filter === "Robocze" &&
          active.map((item) => (
            <Row
              key={item.id}
              glyph="draft"
              title={zusForm(item.serviceId).title}
              meta="Szkic NEXUS"
              onClick={() => go("urzad", `zus/form/${item.id}`)}
            />
          ))}
      </div>
      {matches.length === 0 && (filter !== "Robocze" || !active.length) && (
        <p>Brak dokumentów w tym widoku.</p>
      )}
      <div className="nx-actions">
        <Button onClick={() => go("pisma", "zus")}>Pisma z urzędów · ZUS</Button>
        <Button onClick={() => go("sprawy", "zus")}>Sprawy ZUS w OneFlow</Button>
        <Button onClick={() => go("urzad", "zus/certificates")}>
          Zaświadczenia ubezpieczeniowe
        </Button>
      </div>
      <details className="nx-sheet">
        <summary>Archiwum, eksport i kosz</summary>
        <p>
          Obsługę archiwizacji i kosza znajdziesz w eZUS. Dostępne pliki demo pobierzesz z podglądu
          dokumentu.
        </p>
        <External href={ezus}>Kontynuuj w eZUS</External>
      </details>
    </section>
  );
}

function ZusCatalog() {
  const go = useNexus((s) => s.go);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const results = zusCatalog.filter(([code, title]) =>
    searchKey(`${code} ${title}`).includes(searchKey(query)),
  );
  const demoForms: Record<string, string> = {
    POG: "pog",
    SWN: "swiadczenie",
    "SWN-INF": "zmiana",
    "USW-1–USW-7": "opiekun",
  };
  return (
    <section className="civic-stack">
      <h2>Katalog usług ZUS</h2>
      <Field label="Szukaj usługi ZUS">
        {(field) => (
          <input
            {...field}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        )}
      </Field>
      <div className="nx-list">
        {results.slice(page * 6, page * 6 + 6).map(([code, title]) => {
          const form = demoForms[code];
          return (
            <article key={title} className="nx-sheet civic-stack">
              <h3>{title}</h3>
              {code && <p className="nx-fine">{code}</p>}
              {form ? (
                <Button onClick={() => go("urzad", `zus/form/${form}`)}>
                  Otwórz formularz demo
                </Button>
              ) : (
                <External href={ezus}>Kontynuuj w eZUS</External>
              )}
            </article>
          );
        })}
      </div>
      {!results.length && <p>Brak usług pasujących do wyszukiwania.</p>}
      <div className="nx-actions">
        {page > 0 && <Button onClick={() => setPage(page - 1)}>Poprzednia strona</Button>}
        {results.length > (page + 1) * 6 && (
          <Button onClick={() => setPage(page + 1)}>Następna strona</Button>
        )}
      </div>
      <Button onClick={() => go("urzad", "zus/visits")}>Wizyty</Button>
      <Button onClick={() => go("urzad", "zus/settings")}>Ustawienia powiadomień</Button>
      <Button onClick={() => go("os")}>Historia zdarzeń w NEXUS</Button>
      <External href={ezus}>Kontakt, konto, pełnomocnictwa i ePłatnik w eZUS</External>
    </section>
  );
}

export function ZusCaseActions({ item }: { item: CivicCase }) {
  const go = useNexus((s) => s.go);
  if (item.sourceStatus !== "Wymaga uzupełnienia") return null;
  return (
    <section className="nx-sheet civic-stack">
      <h2>Uzupełnienie sprawy</h2>
      <p>{item.summary}</p>
      <Button primary onClick={() => go("urzad", `zus/form/${item.id}`)}>
        Przygotuj uzupełnienie
      </Button>
      <Button onClick={() => go("urzad", "pfron/home")}>Wsparcie PFRON · osobna usługa</Button>
    </section>
  );
}

export function ZusDocumentActions({ item }: { item: CivicDocument }) {
  if (item.delivery === "waiting") return <External href={ezus}>Kontynuuj odbiór w eZUS</External>;
  return null;
}
