import { useState } from "react";
import { openTarget } from "./navigation";
import {
  addCourtDocument,
  acceptRequest,
  changeHearing,
  courtDeliveries,
  courtHearings,
  courtOffices,
  courtPortal,
  courtProjection,
  hasCaseAccess,
  revokeCourtData,
  setCourtReminder,
  shareCourtData,
  useCourt,
  type CourtCase,
  type CourtDelivery,
  type CourtHearing,
} from "@/lib/nexus/civic/sady";
import {
  demoDate,
  demoId,
  demoNow,
  searchKey,
  visible,
  warsaw,
  type SourceHealth,
} from "@/lib/nexus/civic/model";
import { useNexus } from "@/lib/nexus/store";
import { PageHead, Row, Status } from "../ui";
import { Button, DemoPanel, Errors, External, Field, Filters, Freshness } from "./ui";

const courtTabs: [string, string][] = [
  ["home", "Przegląd"],
  ["cases", "Sprawy"],
  ["terms", "Terminy"],
];
const detailTabs: [string, string][] = [
  ["overview", "Podsumowanie"],
  ["history", "Przebieg"],
  ["documents", "Dokumenty"],
  ["terms", "Terminy"],
];
const listFilters = { query: "", court: "all", state: "Wszystkie" };
const detailSections = new Map<string, string>();
const today = Date.parse(demoNow);
const upcoming = (item: CourtHearing) => today <= Date.parse(item.at) && item.status === "Aktualne";

export function Courts({ section, resource }: { section: string; resource?: string }) {
  const { data, change, reset } = useCourt();
  const projected = courtProjection(data);
  const go = useNexus((s) => s.go);
  const mode = useNexus((s) => s.mode);
  const cases = projected.cases.filter((item) => visible(data, item));
  const documents = projected.documents.filter((item) => visible(data, item));
  const hearings = courtHearings(data);
  const deliveries = courtDeliveries(data);
  const hearing = hearings.find((entry) => entry.id === resource);
  const next = hearings.filter(upcoming).sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  const notices = projected.events
    .filter((entry) => visible(data, entry))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const health = (state: SourceHealth) => change((s) => ({ ...s, health: state }));
  const [requestId, setRequestId] = useState("DEMO-sady-request-1");
  const request = data.extra.requests.find((entry) => entry.id === requestId);
  const secondHearing = data.extra.hearings.find((item) => item.id === "DEMO-sady-202-hearing");
  const notifiedDoc = documents.find((item) => item.id === resource);
  return (
    <div className="nx-stage civic-view">
      <PageHead
        title="Sprawy sądowe"
        lede={
          mode === "simple"
            ? undefined
            : "Sprawy udostępnione w Portalu Informacyjnym i ich terminy"
        }
      />
      <Filters
        label="Sprawy sądowe"
        value={section}
        options={courtTabs}
        onChange={(key) => go("urzad", `sady/${key}`)}
      />
      <Freshness
        data={data}
        retry={() => health("ready")}
        reconnectLabel={
          data.health === "expired" ? "Połącz ponownie w demonstracji" : "Spróbuj ponownie"
        }
      />
      {section === "home" && (
        <>
          <section className="civic-stack">
            <h2>Co nowego</h2>
            <div className="nx-list">
              {notices.slice(0, mode === "simple" ? 1 : 3).map((item) => (
                <Row
                  key={item.id}
                  glyph={item.target.kind === "document" ? "documents" : "timeline"}
                  title={item.title}
                  meta={warsaw(item.at, true)}
                  onClick={() => openTarget(item.target)}
                />
              ))}
            </div>
            {!notices.length && <p>Brak ostatnich zmian w tym widoku.</p>}
          </section>
          {next && (
            <section className="nx-sheet civic-stack">
              <h2>Najbliższe posiedzenie</h2>
              <HearingRow item={next} />
            </section>
          )}
          <section className="nx-sheet civic-stack">
            <h2>Dokumenty i doręczenia</h2>
            {!["ready", "error", "stale"].includes(data.health) ? (
              <p>Brak informacji o nieprzeczytanych dokumentach.</p>
            ) : (
              <p>
                Nieprzeczytane dokumenty ·{" "}
                {documents.filter((item) => !item.readAt && item.sourceRead !== "Odczytane").length}
              </p>
            )}
            <Row
              glyph="letter"
              title="Doręczenia sądowe"
              meta={
                data.extra.deliveriesAvailable && ["ready", "error", "stale"].includes(data.health)
                  ? `Niedoręczone w źródle · ${deliveries.filter((item) => item.status === "Niedoręczone").length}`
                  : "Brak informacji"
              }
              onClick={() => go("urzad", "sady/deliveries")}
            />
            <Button onClick={() => go("pisma", "sady")}>Pisma z urzędów · Sądy</Button>
          </section>
          <div className="nx-actions">
            <Button primary onClick={() => go("urzad", "sady/cases")}>
              Zobacz sprawy
            </Button>
            <Button onClick={() => go("urzad", "sady/access")}>Uzyskaj dostęp do sprawy</Button>
          </div>
          <details className="nx-sheet civic-stack">
            <summary>Portal Informacyjny i inne usługi</summary>
            <div className="nx-actions">
              <External href={courtPortal}>Otwórz Portal Informacyjny</External>
              <External href={`${courtPortal}/biuro-podawcze`}>Biuro podawcze w portalu</External>
              <External href={`${courtPortal}/wnioski-ogolne`}>Wnioski ogólne w portalu</External>
            </div>
          </details>
          <DemoPanel
            reset={() => {
              reset();
              Object.assign(listFilters, { query: "", court: "all", state: "Wszystkie" });
              detailSections.clear();
            }}
          >
            <Filters
              label="Stan połączenia z sądami"
              value={data.health}
              options={[
                ["ready", "Połączono"],
                ["loading", "Ładowanie"],
                ["empty", "Brak udostępnionych spraw"],
                ["error", "Błąd synchronizacji"],
                ["stale", "Dane nieaktualne"],
                ["expired", "Wygaśnięcie sesji"],
              ]}
              onChange={(value) => health(value as SourceHealth)}
            />
            <label>
              <input
                type="checkbox"
                checked={data.extra.deliveriesAvailable}
                onChange={(e) =>
                  change((s) => ({
                    ...s,
                    extra: { ...s.extra, deliveriesAvailable: e.target.checked },
                  }))
                }
              />{" "}
              Źródłowe dane o doręczeniach dostępne
            </label>
            <Button onClick={() => change(addCourtDocument)}>Opublikuj nowy dokument demo</Button>
            <Button
              disabled={
                secondHearing?.status === "Odwołane" || secondHearing?.at === demoDate(16, "13:15")
              }
              onClick={() =>
                change((s) => changeHearing(s, "DEMO-sady-202-hearing", demoDate(16, "13:15")))
              }
            >
              Zmień termin posiedzenia
            </Button>
            <Button
              disabled={secondHearing?.status === "Odwołane"}
              onClick={() => change((s) => changeHearing(s, "DEMO-sady-202-hearing", null))}
            >
              Odwołaj posiedzenie
            </Button>
            <Field label="Wniosek do scenariusza dostępu">
              {(props) => (
                <select {...props} value={requestId} onChange={(e) => setRequestId(e.target.value)}>
                  {data.extra.requests.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.signature} · {item.role}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            {request && (
              <>
                <Button
                  disabled={request.state === "Zaakceptowany"}
                  onClick={() => change((s) => acceptRequest(s, request.id))}
                >
                  Zmień status wniosku na zaakceptowany
                </Button>
                <Button
                  disabled={
                    request.state !== "Zaakceptowany" ||
                    !request.caseId ||
                    hasCaseAccess(data, request.caseId)
                  }
                  onClick={() => change((s) => shareCourtData(s, request.id))}
                >
                  Udostępnij dane sprawy
                </Button>
              </>
            )}
            <Button
              disabled={!hasCaseAccess(data, "DEMO-sady-101")}
              onClick={() => change((s) => revokeCourtData(s, "DEMO-sady-101"))}
            >
              Cofnij dostęp do sprawy DEMO-C-101/2026
            </Button>
          </DemoPanel>
        </>
      )}
      {section === "cases" && <CourtList items={cases} />}
      {section === "terms" && <HearingList items={hearings} />}
      {section === "hearing" &&
        (hearing ? (
          <HearingInfo item={hearing} />
        ) : (
          <p role="status">Brak dostępu do tego terminu.</p>
        ))}
      {section === "deliveries" && (
        <DeliveryList
          entries={deliveries}
          available={
            data.extra.deliveriesAvailable && ["ready", "error", "stale"].includes(data.health)
          }
        />
      )}
      {section === "delivery" && (
        <DeliveryList
          entries={deliveries.filter((item) => item.id === resource)}
          available={
            data.extra.deliveriesAvailable && ["ready", "error", "stale"].includes(data.health)
          }
        />
      )}
      {section === "access" && <Access />}
      {section === "notice" &&
        (notifiedDoc ? (
          <section className="nx-sheet civic-stack">
            <h2>Opublikowano nowy dokument</h2>
            <p>Informacja o publikacji została przeczytana.</p>
            <Button primary onClick={() => go("pismo", notifiedDoc.id)}>
              Otwórz dokument
            </Button>
          </section>
        ) : (
          <p role="status">Brak dostępu do dokumentu z tego powiadomienia.</p>
        ))}
    </div>
  );
}

function CourtList({ items }: { items: CourtCase[] }) {
  const [filters, setFilters] = useState({ ...listFilters });
  const go = useNexus((s) => s.go);
  const data = useCourt((s) => s.data);
  const events = courtProjection(data).events;
  const set = (change: Partial<typeof listFilters>) => {
    Object.assign(listFilters, change);
    setFilters((s) => ({ ...s, ...change }));
  };
  const result = items.filter(
    (item) =>
      (filters.court === "all" || filters.court === item.office) &&
      (filters.state === "Wszystkie" ||
        (filters.state === "Zakończone"
          ? item.sourceStatus === "Zakończona"
          : item.sourceStatus === "W toku")) &&
      searchKey(`${item.title} ${item.number ?? ""} ${item.office}`).includes(
        searchKey(filters.query),
      ),
  );
  return (
    <section className="civic-stack">
      <h2>Udostępnione sprawy</h2>
      <Field label="Szukaj sygnatury, sprawy lub sądu">
        {(field) => (
          <input
            {...field}
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        )}
      </Field>
      <Filters
        label="Status sprawy sądowej"
        value={filters.state}
        options={["Wszystkie", "W toku", "Zakończone"]}
        onChange={(state) => set({ state })}
      />
      <Field label="Sąd">
        {(field) => (
          <select {...field} value={filters.court} onChange={(e) => set({ court: e.target.value })}>
            <option value="all">Wszystkie sądy</option>
            {courtOffices.map((court) => (
              <option key={court}>{court}</option>
            ))}
          </select>
        )}
      </Field>
      <Button onClick={() => set({ court: "all", query: "", state: "Wszystkie" })}>
        Wyczyść filtry
      </Button>
      {result.map((item) => {
        const next = courtHearings(data, item.id)
          .filter(upcoming)
          .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
        const updatedHearing = events.some(
          (event) => event.caseId === item.id && event.type === "court.hearing_changed",
        );
        const newDocument = data.documents.some(
          (doc) => doc.caseId === item.id && !doc.readAt && doc.sourceRead !== "Odczytane",
        );
        return (
          <article className="nx-sheet civic-stack" key={item.id}>
            <h3>{item.title}</h3>
            <p>
              {item.number} · {item.office} · {item.division}
            </p>
            <p>
              <Status tone="info">{item.sourceStatus ?? "Brak informacji o statusie"}</Status>
            </p>
            <p className="nx-fine">Ostatnia zmiana · {warsaw(item.updatedAt)}</p>
            {newDocument && <p>Nowy dokument</p>}
            {updatedHearing && <p>Zmieniono termin</p>}
            {next && <p>Najbliższe posiedzenie · {warsaw(next.at, true)}</p>}
            <Button primary onClick={() => go("sprawa", item.id)}>
              Zobacz sprawę<span className="nx-sr"> · {item.title}</span>
            </Button>
          </article>
        );
      })}
      {!result.length && (
        <p role="status">
          {items.length
            ? "Brak wyników dla tych filtrów."
            : ["ready", "empty"].includes(data.health)
              ? "Brak udostępnionych spraw."
              : "Nie można wyświetlić listy spraw w bieżącym stanie."}
        </p>
      )}
      <div className="nx-actions">
        <Button onClick={() => go("urzad", "sady/access")}>Uzyskaj dostęp do sprawy</Button>
        <Button onClick={() => go("sprawy", "sady")}>Otwórz Moje sprawy · Sądy</Button>
      </div>
    </section>
  );
}

function HearingRow({ item }: { item: CourtHearing }) {
  const go = useNexus((s) => s.go);
  const data = useCourt((s) => s.data);
  const linked = data.cases.find((entry) => entry.id === item.caseId);
  return (
    <Row
      glyph="calendar"
      title={`${item.title} · ${linked?.title ?? "Sprawa sądowa"}`}
      meta={[
        warsaw(item.at, true),
        item.place,
        item.room ?? "Sala niepodana",
        item.status === "Odwołane" ? item.status : null,
      ]
        .filter(Boolean)
        .join(" · ")}
      onClick={() => go("urzad", `sady/hearing/${item.id}`)}
    />
  );
}

function HearingList({ items }: { items: CourtHearing[] }) {
  const [section, setSection] = useState("Nadchodzące");
  const [date, setDate] = useState("");
  const rows = items
    .filter(
      (item) =>
        upcoming(item) === (section === "Nadchodzące") && (!date || item.at.slice(0, 10) === date),
    )
    .sort((a, b) => (section === "Nadchodzące" ? 1 : -1) * (Date.parse(a.at) - Date.parse(b.at)));
  return (
    <section className="civic-stack">
      <h2>Terminy posiedzeń</h2>
      <Filters
        label="Okres terminów"
        value={section}
        options={["Nadchodzące", "Historia"]}
        onChange={setSection}
      />
      <Field label="Filtr daty posiedzenia">
        {(field) => (
          <input {...field} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
      </Field>
      {date && <Button onClick={() => setDate("")}>Wyczyść datę</Button>}
      {rows.map((item) => (
        <HearingRow key={item.id} item={item} />
      ))}
      {!rows.length && (
        <p role="status">
          {section === "Nadchodzące"
            ? "Brak nadchodzących posiedzeń."
            : "Brak posiedzeń w tym widoku historii."}
        </p>
      )}
    </section>
  );
}

function HearingInfo({ item }: { item: CourtHearing }) {
  const { data, change } = useCourt();
  const go = useNexus((s) => s.go);
  const reminder = data.extra.reminders.find((entry) => entry.hearingId === item.id);
  const linked = data.cases.find((entry) => entry.id === item.caseId);
  return (
    <section className="nx-sheet civic-stack">
      <h2>{item.title}</h2>
      <p>
        {linked?.title} · {linked?.number}
      </p>
      <p>
        {warsaw(item.at, true)} · {item.place}
      </p>
      <p>
        {item.room ?? "Sala niepodana"}
        {item.mode ? ` · ${item.mode}` : ""}
      </p>
      <Status tone={item.status === "Odwołane" ? "warn" : "info"}>{item.status}</Status>
      {item.history.length > 0 && (
        <details open>
          <summary>Historia zmian terminu</summary>
          {item.history.map((change) => (
            <p key={`${change.change}/${change.previous}`}>
              {change.change === "przesunięte" ? "Poprzedni termin" : "Odwołany termin"} ·{" "}
              {warsaw(change.previous, true)} · odnotowano {warsaw(change.at, true)}
            </p>
          ))}
        </details>
      )}
      {reminder?.state === "active" && (
        <p role="status">Przypomnienie w osi czasu · {warsaw(reminder.at, true)}</p>
      )}
      {reminder?.state === "cancelled" && (
        <p role="status">Przypomnienie anulowane · {reminder.reason}</p>
      )}
      {upcoming(item) && (
        <Button
          primary
          onClick={() => change((s) => setCourtReminder(s, item.id, reminder?.state !== "active"))}
        >
          {reminder?.state === "active" ? "Usuń przypomnienie" : "Ustaw osobiste przypomnienie"}
        </Button>
      )}
      <div className="nx-actions">
        <Button onClick={() => go("sprawa", item.caseId)}>Otwórz sprawę</Button>
        <Button onClick={() => go("os")}>Zobacz oś czasu</Button>
      </div>
    </section>
  );
}

function DeliveryList({ entries, available }: { entries: CourtDelivery[]; available: boolean }) {
  const go = useNexus((s) => s.go);
  return (
    <section className="civic-stack">
      <h2>Doręczenia sądowe</h2>
      <p>
        Źródło · Portal Informacyjny Sądów Powszechnych. Otworzenie dokumentu w NEXUS zapisuje
        lokalny odczyt.
      </p>
      {!available ? (
        <p>Brak informacji o doręczeniu.</p>
      ) : !entries.length ? (
        <p>Brak doręczeń dla udostępnionych spraw.</p>
      ) : (
        entries.map((entry) => (
          <article key={entry.id} className="nx-sheet civic-stack">
            <h3>{entry.type}</h3>
            <Status tone={entry.status === "Niedoręczone" ? "warn" : "info"}>
              {entry.status ?? "Brak informacji o doręczeniu"}
            </Status>
            <p>
              {entry.sender} · odbiorca: {entry.recipient}
            </p>
            <p>Data publikacji · {warsaw(entry.publishedOn)}</p>
            {entry.deliveredOn && <p>Data doręczenia · {warsaw(entry.deliveredOn)}</p>}
            {entry.formalOn && <p>Data doręczenia (f) · {warsaw(entry.formalOn)}</p>}
            {entry.returnedOn && <p>Data zwrotu · {warsaw(entry.returnedOn)}</p>}
            <Button onClick={() => go("sprawa", entry.caseId)}>Otwórz powiązaną sprawę</Button>
            {entry.documentIds.map((id, index) => (
              <Button key={id} onClick={() => go("pismo", id)}>
                Otwórz dokument {entry.documentIds.length > 1 ? index + 1 : ""}
              </Button>
            ))}
          </article>
        ))
      )}
      <External href={`${courtPortal}/doreczenia`}>Otwórz doręczenia w portalu</External>
    </section>
  );
}

function Access() {
  const { data, change } = useCourt();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ office: "", signature: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((s) => ({ ...s, [key]: value }));
  return (
    <section className="civic-stack">
      <h2>Dostęp do sprawy</h2>
      <p>
        Wniosek demonstracyjny zapisuje się w NEXUS. Dane sprawy są widoczne po odrębnym
        udostępnieniu.
      </p>
      {data.extra.requests.map((item) => (
        <article className="nx-sheet civic-stack" key={item.id}>
          <h3>Wniosek o udzielenie dostępu do sprawy</h3>
          <p>
            {item.signature} · {item.office} · {item.role}
          </p>
          <p>Zapisano · {warsaw(item.submittedAt, true)}</p>
          {item.consideredAt && <p>Rozpatrzono · {warsaw(item.consideredAt, true)}</p>}
          <p>
            {item.state === "Zaakceptowany" && (!item.caseId || !hasCaseAccess(data, item.caseId))
              ? "Wniosek zaakceptowany — oczekiwanie na udostępnienie danych"
              : item.state}
          </p>
        </article>
      ))}
      {saved && <p role="status">Zapisano wniosek demonstracyjny</p>}
      {!show && (
        <Button
          primary
          onClick={() => {
            setShow(true);
            setSaved(false);
          }}
        >
          Rozpocznij wniosek demonstracyjny
        </Button>
      )}
      {show && (
        <section className="nx-sheet civic-stack">
          <h3>{["Sąd i sygnatura", "Rola", "Podsumowanie"][step]}</h3>
          <p>Krok {step + 1} z 3</p>
          <Errors errors={errors} />
          {step === 0 && (
            <>
              <Field label="Fikcyjny sąd" error={errors.office}>
                {(field) => (
                  <select
                    {...field}
                    value={form.office}
                    onChange={(e) => set("office", e.target.value)}
                  >
                    <option value="">Wybierz</option>
                    {courtOffices.map((office) => (
                      <option key={office}>{office}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Demonstracyjna sygnatura" error={errors.signature}>
                {(field) => (
                  <input
                    {...field}
                    value={form.signature}
                    onChange={(e) => set("signature", e.target.value)}
                    placeholder="DEMO-C-404/2026"
                  />
                )}
              </Field>
            </>
          )}
          {step === 1 && (
            <Field label="Rola w sprawie" error={errors.role}>
              {(field) => (
                <select {...field} value={form.role} onChange={(e) => set("role", e.target.value)}>
                  <option value="">Wybierz</option>
                  <option>Strona</option>
                  <option>Pełnomocnik</option>
                  <option>Przedstawiciel</option>
                </select>
              )}
            </Field>
          )}
          {step === 2 && (
            <>
              <p>
                {form.office} · {form.signature} · {form.role}
              </p>
              <p>Dane pozostaną w demonstracji na tym urządzeniu.</p>
            </>
          )}
          <div className="nx-actions">
            {step > 0 && (
              <Button
                onClick={() => {
                  setErrors({});
                  setStep(step - 1);
                }}
              >
                Wstecz
              </Button>
            )}
            <Button
              primary
              onClick={() => {
                const invalid: Record<string, string> = {};
                if (step === 0 && !form.office) invalid.office = "Wybierz fikcyjny sąd.";
                if (step === 0 && !/^DEMO-[A-Z0-9/-]+$/i.test(form.signature.trim()))
                  invalid.signature = "Wpisz sygnaturę z prefiksem DEMO-, np. DEMO-C-404/2026.";
                if (step === 1 && !form.role) invalid.role = "Wybierz rolę w sprawie.";
                setErrors(invalid);
                if (Object.keys(invalid).length) return;
                if (step < 2) {
                  setStep(step + 1);
                  return;
                }
                const signature = form.signature.trim().toUpperCase();
                if (
                  data.extra.requests.some(
                    (item) =>
                      item.signature === signature &&
                      item.office === form.office &&
                      item.role === form.role,
                  )
                ) {
                  setErrors({ request: "Taki wniosek jest już zapisany." });
                  return;
                }
                const linked = data.cases.find(
                  (item) => item.number === signature && item.office === form.office,
                );
                const request = {
                  ...form,
                  signature,
                  id: demoId("sady", "request"),
                  state: "Zapisany demonstracyjnie" as const,
                  submittedAt: demoNow,
                  caseId: linked?.id,
                };
                change((s) => ({
                  ...s,
                  extra: { ...s.extra, requests: [...s.extra.requests, request] },
                }));
                setShow(false);
                setSaved(true);
                setStep(0);
                setForm({ office: "", signature: "", role: "" });
              }}
            >
              {step === 2 ? "Zapisz wniosek demonstracyjny" : "Dalej"}
            </Button>
          </div>
        </section>
      )}
    </section>
  );
}

export function CourtCaseDetail({ id }: { id: string }) {
  const { data, change } = useCourt();
  const go = useNexus((s) => s.go);
  const back = useNexus((s) => s.back);
  const [section, setSection] = useState(detailSections.get(id) ?? "overview");
  const [query, setQuery] = useState("");
  const [read, setRead] = useState("Wszystkie");
  const item = data.cases.find(
    (entry) => entry.id === id && visible(data, entry) && hasCaseAccess(data, id),
  );
  const sync = (
    <Freshness
      data={data}
      retry={() => change((s) => ({ ...s, health: "ready" }))}
      reconnectLabel={
        data.health === "expired" ? "Połącz ponownie w demonstracji" : "Spróbuj ponownie"
      }
    />
  );
  if (!item)
    return (
      <div className="nx-stage civic-view">
        <PageHead title="Sprawa jest niedostępna" />
        {sync}
        <p>
          {data.health === "expired"
            ? "Po połączeniu odtworzymy otwarty widok, jeśli dostęp jest aktywny."
            : "Do szczegółów sprawy wymagany jest aktywny dostęp."}
        </p>
        {data.health !== "expired" && (
          <Button primary onClick={() => go("urzad", "sady/access")}>
            Uzyskaj dostęp do sprawy
          </Button>
        )}
        <Button onClick={back}>Wróć</Button>
      </div>
    );

  const projected = courtProjection(data);
  const hearings = courtHearings(data, item.id);
  const next = hearings.filter(upcoming).sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  const activities = projected.events
    .filter((event) => event.caseId === id)
    .sort((a, b) => Date.parse(b.occurredOn ?? b.at) - Date.parse(a.occurredOn ?? a.at));
  const docs = projected.documents.filter((entry) => entry.caseId === id && visible(data, entry));
  const readLabel = (doc: (typeof docs)[number]) =>
    doc.readAt || doc.sourceRead === "Odczytane" ? "Przeczytane" : "Nieprzeczytane";
  const filtered = docs.filter(
    (doc) =>
      (read === "Wszystkie" || readLabel(doc) === read) &&
      searchKey(doc.title).includes(searchKey(query)),
  );
  return (
    <div className="nx-stage civic-view">
      <PageHead
        kicker="Sądy"
        title={item.title}
        lede={`${item.number} · ${item.office} · ${item.division}`}
      />
      <Status tone="info">{item.sourceStatus ?? "Brak informacji o statusie"}</Status>
      {sync}
      <Filters
        label="Szczegóły sprawy sądowej"
        value={section}
        options={detailTabs}
        onChange={(key) => {
          detailSections.set(id, key);
          setSection(key);
        }}
      />
      {section === "overview" && (
        <>
          <section className="nx-sheet civic-stack">
            <h2>Informacje o sprawie</h2>
            <p>{item.summary}</p>
            <p>{item.appeal}</p>
            <p>
              Wpłynęła · {warsaw(item.filedOn)} · opublikowano · {warsaw(item.postedOn)}
            </p>
            {item.clerk && <p>Referent · {item.clerk}</p>}
            {item.closedOn && <p>Data zakończenia · {warsaw(item.closedOn)}</p>}
            {item.resolution && <p>Rozstrzygnięcie · {item.resolution}</p>}
            {activities[0] && <p>Ostatnia zmiana · {activities[0].title}</p>}
            {next && <HearingRow item={next} />}
            {docs.find((doc) => readLabel(doc) === "Nieprzeczytane") && (
              <Button
                primary
                onClick={() => {
                  detailSections.set(id, "documents");
                  setSection("documents");
                }}
              >
                Zobacz nowe dokumenty
              </Button>
            )}
          </section>
          <details className="nx-sheet civic-stack">
            <summary>Więcej o sprawie</summary>
            <h3>Uczestnicy i role</h3>
            {item.participants.map((entry) => (
              <p key={entry.name}>
                {entry.name} · {entry.role}
              </p>
            ))}
            <h3>Dostęp do sprawy</h3>
            <p>
              {hasCaseAccess(data, id, true)
                ? "Dostęp do sprawy i dokumentów"
                : "Dostęp do podsumowania"}
            </p>
            <Button onClick={() => go("urzad", "sady/access")}>Zobacz wnioski o dostęp</Button>
            <h3>Powiązane sprawy</h3>
            {item.relatedIds.length ? (
              item.relatedIds.map((key) => (
                <Button key={key} onClick={() => go("sprawa", key)}>
                  Otwórz powiązaną sprawę
                </Button>
              ))
            ) : (
              <p>Brak powiązanych spraw.</p>
            )}
            <h3>Nagrania posiedzeń</h3>
            {item.recordings.length ? (
              item.recordings.map((entry) => (
                <p key={entry.id}>
                  {entry.title} · {warsaw(entry.at)}
                </p>
              ))
            ) : (
              <p>Brak nagrań w udostępnionych danych.</p>
            )}
          </details>
          <DeliveryList
            entries={courtDeliveries(data, id)}
            available={data.extra.deliveriesAvailable && hasCaseAccess(data, id, true)}
          />
        </>
      )}
      {section === "history" && (
        <section className="civic-stack">
          <h2>Przebieg sprawy</h2>
          {activities.length ? (
            activities.map((activity) => (
              <article key={activity.id} className="nx-sheet civic-stack">
                <h3>{activity.title}</h3>
                {activity.occurredOn && <p>Data czynności · {warsaw(activity.occurredOn)}</p>}
                <p>Data publikacji · {warsaw(activity.at, true)}</p>
                {activity.target.kind !== "case" && (
                  <Button onClick={() => openTarget(activity.target)}>
                    {activity.target.kind === "document"
                      ? "Otwórz dokument"
                      : "Zobacz szczegóły zdarzenia"}
                  </Button>
                )}
              </article>
            ))
          ) : (
            <p>Brak zdarzeń w tej sprawie.</p>
          )}
        </section>
      )}
      {section === "documents" && (
        <section className="civic-stack">
          <h2>Dokumenty sprawy</h2>
          <Field label="Szukaj dokumentu">
            {(field) => (
              <input
                {...field}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
          </Field>
          <Filters
            label="Stan przeczytania"
            value={read}
            options={["Wszystkie", "Nieprzeczytane", "Przeczytane"]}
            onChange={setRead}
          />
          <div className="nx-list">
            {filtered.map((doc) => (
              <Row
                key={doc.id}
                glyph="documents"
                title={doc.title}
                meta={`${readLabel(doc)} · sporządzono ${doc.authoredOn ? warsaw(doc.authoredOn) : "—"} · opublikowano ${warsaw(doc.publishedAt)}`}
                onClick={() => go("pismo", doc.id)}
              />
            ))}
          </div>
          {!filtered.length && <p>Brak dokumentów w tym widoku.</p>}
        </section>
      )}
      {section === "terms" && <HearingList items={hearings} />}
    </div>
  );
}
