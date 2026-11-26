import { useState } from "react";
import { download } from "@/lib/nexus/civic/files";
import { ePraca } from "@/lib/nexus/civic/epraca";
import { workOffice } from "@/lib/nexus/civic/forms";
import {
  demoId,
  demoNow,
  saveDraft,
  searchKey,
  visible,
  warsaw,
  type CivicCase,
  type CivicDocument,
  type SourceHealth,
} from "@/lib/nexus/civic/model";
import { pracaPortal, workCatalog, workForm, workGroups } from "@/lib/nexus/civic/praca-catalog";
import {
  continueWork,
  useWork,
  workReceive,
  workSendSigned,
  workSign,
  type WorkCase,
  type WorkData,
} from "@/lib/nexus/civic/praca";
import { useNexus } from "@/lib/nexus/store";
import { PageHead, Row, Status } from "../ui";
import { Appointments } from "./appointments";
import { Action, Button, DemoPanel, External, Field, Filters, Freshness, TaskRows } from "./ui";
import { CivicWizard } from "./wizard";

const sections: [string, string][] = [
  ["cases", "Moje sprawy"],
  ["catalog", "Załatw sprawę"],
  ["documents", "Pisma i dokumenty"],
  ["visits", "Wizyty"],
];
const more: [string, string, "work" | "documents" | "institution" | "info" | "bell"][] = [
  ["offers", "Oferty pracy i wydarzenia — ePraca", "work"],
  ["contracts", "Umowy elektroniczne", "documents"],
  ["office", "Mój urząd", "institution"],
  ["help", "Pomoc", "info"],
  ["settings", "Ustawienia powiadomień", "bell"],
];
const casesFilter = { query: "", office: "all", date: "", needsAction: false };
const portalBase = "https://www.praca.gov.pl/eurzad";
const ePracaUrl = "https://oferty.praca.gov.pl/";

export function Praca({ section, resource }: { section: string; resource?: string }) {
  const { data, change, reset } = useWork();
  const go = useNexus((s) => s.go);
  const cases = data.cases.filter((item) => visible(data, item));
  const tasks = data.tasks.filter((item) => visible(data, item) && !item.completedAt);
  const visit = data.appointments
    .filter(
      (item) =>
        visible(data, item) &&
        item.state === "booked" &&
        Date.parse(item.at) >= Date.parse(demoNow),
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  const draft = data.drafts.find((item) => item.id === resource && visible(data, item));
  const [formKey, linked] = (resource ?? "pu").split("~");
  const linkedCase = linked ? cases.find((item) => item.id === linked) : undefined;
  const service = workForm(draft?.serviceId ?? formKey);
  const catalog = workCatalog.find((item) => item.id === resource);
  const office = workOffice;
  const health = (state: SourceHealth) => change((s) => ({ ...s, health: state }));

  return (
    <div className="nx-stage civic-view">
      <PageHead title="Praca i urząd pracy" lede={office} />
      <Field label="Kontekst urzędu pracy">
        {(field) => (
          <select
            {...field}
            value={data.scope}
            onChange={(e) =>
              change((s) => ({
                ...s,
                scope: e.target.value === "organization" ? "organization" : "personal",
              }))
            }
          >
            <option value="personal">Osoba fizyczna</option>
            <option value="organization">Organizacja Demo</option>
          </select>
        )}
      </Field>
      <Freshness data={data} retry={() => health("ready")} />
      {section !== "home" && (
        <Button onClick={() => go("urzad", "praca/home")}>Przegląd urzędu pracy</Button>
      )}
      {section === "home" && (
        <>
          <section className="civic-stack">
            <h2>Do zrobienia</h2>
            <TaskRows tasks={tasks} />
          </section>
          {visit && (
            <section className="nx-sheet civic-stack">
              <h2>Najbliższa wizyta</h2>
              <p>
                {visit.title} · {warsaw(visit.at, true)} · {visit.location}
              </p>
              <Button onClick={() => go("urzad", `praca/visits/${visit.id}`)}>Zobacz wizytę</Button>
            </section>
          )}
          <div className="nx-list">
            {sections.map(([key, text]) => (
              <Row
                key={key}
                glyph={key === "visits" ? "calendar" : key === "documents" ? "letter" : "case"}
                title={text}
                onClick={() => go("urzad", `praca/${key}`)}
              />
            ))}
          </div>
          <section className="civic-stack">
            <h2>Ostatnie sprawy</h2>
            {cases.length ? (
              <WorkRows items={cases.slice(0, 3)} />
            ) : (
              <p>Brak spraw w bieżącym kontekście. Możesz rozpocząć usługę z katalogu.</p>
            )}
          </section>
          <section className="civic-stack">
            <h2>Więcej</h2>
            <div className="nx-list">
              {more.map(([id, title, glyph]) => (
                <Row
                  key={id}
                  glyph={glyph}
                  title={title}
                  onClick={() => go("urzad", `praca/${id}`)}
                />
              ))}
            </div>
            <Row
              glyph="letter"
              title={`Ankiety opinii (${data.extra.surveyAnswered ? 0 : 1})`}
              meta="Dobrowolne"
              onClick={() => go("urzad", "praca/survey")}
            />
          </section>
          <DemoPanel reset={reset}>
            <Filters
              label="Stan danych urzędu pracy"
              value={data.health}
              options={[
                ["ready", "Dane przykładowe"],
                ["empty", "Brak spraw"],
                ["loading", "Ładowanie"],
                ["error", "Awaria źródła"],
                ["stale", "Dane nieaktualne"],
                ["forbidden", "Brak uprawnień"],
              ]}
              onChange={(value) => health(value as SourceHealth)}
            />
            <label>
              <input
                type="checkbox"
                checked={data.extra.unknownOutcome}
                onChange={(e) =>
                  change((s) => ({ ...s, extra: { ...s.extra, unknownOutcome: e.target.checked } }))
                }
              />{" "}
              Nieznany wynik pierwszej wysyłki
            </label>
            <label>
              <input
                type="checkbox"
                checked={data.extra.expiredSlot}
                onChange={(e) =>
                  change((s) => ({ ...s, extra: { ...s.extra, expiredSlot: e.target.checked } }))
                }
              />{" "}
              Wygaśnięcie terminu przed rezerwacją
            </label>
          </DemoPanel>
        </>
      )}
      {section === "cases" && <WorkCases items={cases} />}
      {section === "documents" && <WorkDocuments data={data} />}
      {section === "catalog" && <WorkCatalog />}
      {section === "service" && catalog && (
        <section className="nx-sheet civic-stack">
          <h2>{catalog.title}</h2>
          <p>
            {catalog.official} · {catalog.code}
            {catalog.mode ? ` · ${catalog.mode}` : ""}
          </p>
          <p>{workGroups[catalog.group]}</p>
          {catalog.organizationsOnly && data.scope !== "organization" ? (
            <p>Ta pozycja jest dostępna w demonstracyjnym kontekście organizacji.</p>
          ) : catalog.form ? (
            <Button primary onClick={() => go("urzad", `praca/form/${catalog.id}`)}>
              Uruchom kreator demonstracyjny
            </Button>
          ) : (
            <External href={pracaPortal}>Otwórz katalog praca.gov.pl</External>
          )}
        </section>
      )}
      {section === "form" &&
        (service &&
        (!linked || linkedCase) &&
        (service.id !== "krb" || data.scope === "personal") ? (
          <CivicWizard
            key={`${resource}/${data.scope}`}
            data={data}
            change={change}
            spec={service}
            caseId={draft?.caseId ?? linkedCase?.id}
            draftId={draft?.id}
            unknown={data.extra.unknownOutcome}
            confirmText="Symuluj podpisanie i wysłanie"
          />
        ) : (
          <p role="status">Brak dostępu do tego formularza w bieżącym kontekście.</p>
        ))}
      {section === "visits" && (
        <Appointments
          key={data.scope}
          data={data}
          change={change}
          office={office}
          expiredSlot={data.extra.expiredSlot}
          selectedId={resource}
        />
      )}
      {(section === "offers" || section === "offer" || section === "events") && (
        <Offers section={section} resource={resource} />
      )}
      {section === "contracts" && (
        <section className="nx-sheet civic-stack">
          <h2>Umowy elektroniczne</h2>
          <p>Umowy elektroniczne to odrębna usługa publiczna.</p>
          <External href="https://www.praca.gov.pl/umowy/main-page#page=login">
            Otwórz Umowy elektroniczne
          </External>
        </section>
      )}
      {section === "office" && (
        <section className="nx-sheet civic-stack">
          <h2>Mój urząd</h2>
          <p>{office} · Punkt Obsługi Demo i Filia Demo.</p>
          <Button onClick={() => go("urzad", "praca/visits")}>Zobacz wizyty</Button>
          <External href={`${portalBase}/strona-glowna`}>
            Otwórz praca.gov.pl, aby znaleźć kontakt do urzędu
          </External>
        </section>
      )}
      {section === "help" && (
        <section className="nx-sheet civic-stack">
          <h2>Pomoc</h2>
          <p>
            UPP potwierdza złożenie dokumentu. UPD dotyczy odbioru. Rezerwację lub zmianę urzędowej
            wizyty sprawdzisz w portalu.
          </p>
          <External href={`${portalBase}/html/pomoc/sprawy.htm`}>Otwórz pomoc e-Urzędu</External>
        </section>
      )}
      {section === "settings" && (
        <section className="nx-sheet civic-stack">
          <h2>Ustawienia powiadomień</h2>
          <label>
            <input
              type="checkbox"
              checked={data.extra.localNotices}
              onChange={(e) =>
                change((s) => ({ ...s, extra: { ...s.extra, localNotices: e.target.checked } }))
              }
            />{" "}
            Włącz podgląd push w demonstracji
          </label>
          {data.extra.localNotices && <p>Podgląd push · Nowa informacja w aplikacji NEXUS.</p>}
          <label>
            <input
              type="checkbox"
              checked={data.extra.email}
              onChange={(e) =>
                change((s) => ({ ...s, extra: { ...s.extra, email: e.target.checked } }))
              }
            />{" "}
            Pokaż przykład subskrypcji e-mail
          </label>
          {data.extra.email && (
            <p>Typ zdarzenia · zmiana w sprawie · Konto Demo · kanał e-mail. Ustawienie lokalne.</p>
          )}
          <External href={`${portalBase}/zarzadzanie-kontem/subskrypcje`}>
            Otwórz subskrypcje w praca.gov.pl
          </External>
        </section>
      )}
      {section === "survey" && (
        <section className="nx-sheet civic-stack">
          <h2>Ankieta opinii</h2>
          <p>Opcjonalna ankieta o wysłaniu wniosku. Wydano {warsaw(demoNow)}.</p>
          {data.extra.surveyAnswered ? (
            <p role="status">Zapisano opinię demonstracyjną.</p>
          ) : (
            <Button
              onClick={() => change((s) => ({ ...s, extra: { ...s.extra, surveyAnswered: true } }))}
            >
              Zapisz przykładową opinię
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

function WorkRows({ items }: { items: WorkCase[] }) {
  const data = useWork((s) => s.data);
  const go = useNexus((s) => s.go);
  return (
    <div className="nx-list">
      {items.map((item) => {
        const count = data.tasks.filter(
          (entry) => entry.caseId === item.id && !entry.completedAt && visible(data, entry),
        ).length;
        return (
          <Row
            key={item.id}
            glyph="case"
            title={item.title}
            meta={[
              item.office,
              item.sourceStatus ?? "Brak informacji o rozstrzygnięciu",
              warsaw(item.updatedAt),
              count ? `Otwarte zadania: ${count}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            onClick={() => go("sprawa", item.id)}
          />
        );
      })}
    </div>
  );
}

function WorkCases({ items }: { items: WorkCase[] }) {
  const data = useWork((s) => s.data);
  const go = useNexus((s) => s.go);
  const [filter, setFilter] = useState({ ...casesFilter });
  const set = (next: Partial<typeof casesFilter>) => {
    Object.assign(casesFilter, next);
    setFilter((current) => ({ ...current, ...next }));
  };
  const results = items.filter(
    (item) =>
      searchKey(`${item.title} ${item.formCode ?? ""} ${item.number ?? ""}`).includes(
        searchKey(filter.query),
      ) &&
      (filter.office === "all" || item.office === filter.office) &&
      (!filter.date || item.updatedAt.slice(0, 10) === filter.date) &&
      (!filter.needsAction ||
        data.tasks.some((task) => task.caseId === item.id && !task.completedAt)),
  );
  return (
    <section className="civic-stack">
      <h2>Moje sprawy w urzędzie pracy</h2>
      <Field label="Szukaj sprawy lub kodu">
        {(field) => (
          <input
            {...field}
            type="search"
            value={filter.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        )}
      </Field>
      <Field label="Filtr urzędu">
        {(field) => (
          <select
            {...field}
            value={filter.office}
            onChange={(e) => set({ office: e.target.value })}
          >
            <option value="all">Wszystkie urzędy</option>
            {[...new Set(items.map((item) => item.office))].map((office) => (
              <option key={office}>{office}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Data aktualizacji">
        {(field) => (
          <input
            {...field}
            type="date"
            value={filter.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        )}
      </Field>
      <Field label="Tylko sprawy wymagające działania">
        {(field) => (
          <input
            {...field}
            type="checkbox"
            checked={filter.needsAction}
            onChange={(e) => set({ needsAction: e.target.checked })}
          />
        )}
      </Field>
      {results.length ? (
        <WorkRows items={results} />
      ) : (
        <p role="status">
          {items.length
            ? "Brak wyników dla tych filtrów."
            : data.health === "ready" || data.health === "empty"
              ? "Brak spraw w tym kontekście."
              : "Nie można wyświetlić spraw w bieżącym stanie."}
        </p>
      )}
      <div className="nx-actions">
        <Button onClick={() => go("urzad", "praca/catalog")}>Załatw sprawę</Button>
        <Button onClick={() => go("sprawy", "praca")}>Otwórz wspólne Moje sprawy</Button>
      </div>
    </section>
  );
}

function WorkDocuments({ data }: { data: WorkData }) {
  const go = useNexus((s) => s.go);
  const [section, setSection] = useState("Skrzynka odbiorcza");
  const [bucket, setBucket] = useState("Wszystkie");
  const rows = data.documents.filter(
    (item) =>
      visible(data, item) &&
      (section === "Skrzynka odbiorcza"
        ? item.direction === "incoming" &&
          (bucket === "Wszystkie" ||
            (bucket === "Oczekujące na odbiór" && item.delivery === "waiting") ||
            (bucket === "Odebrane" && ["received", "deemed"].includes(item.delivery ?? "")) ||
            (bucket === "Powiązane ze sprawą" && item.caseId))
        : section === "Dokumenty do podpisu"
          ? item.submission === "ready"
          : section === "Dokumenty wysłane" && item.submission === "sent"),
  );
  const drafts = data.drafts.filter((item) => visible(data, item) && !item.resultId);
  return (
    <section className="civic-stack">
      <h2>Pisma i dokumenty</h2>
      <Filters
        label="Widok dokumentów"
        value={section}
        options={[
          "Skrzynka odbiorcza",
          "Dokumenty robocze",
          "Dokumenty do podpisu",
          "Dokumenty wysłane",
        ]}
        onChange={setSection}
      />
      {section === "Skrzynka odbiorcza" && (
        <Filters
          label="Filtr odbioru"
          value={bucket}
          options={["Wszystkie", "Oczekujące na odbiór", "Odebrane", "Powiązane ze sprawą"]}
          onChange={setBucket}
        />
      )}
      <div className="nx-list">
        {rows.map((item) => (
          <Row
            key={item.id}
            glyph="letter"
            title={item.title}
            meta={`${item.office} · ${warsaw(item.publishedAt)}`}
            onClick={() => go("pismo", item.id)}
          />
        ))}
        {section === "Dokumenty robocze" &&
          drafts.map((draft) => (
            <Row
              key={draft.id}
              glyph="draft"
              title={workForm(draft.serviceId)?.title ?? "Szkic"}
              meta={draft.pending ? "Sprawdzamy wynik" : "Zapisano lokalnie"}
              onClick={() => go("urzad", `praca/form/${draft.id}`)}
            />
          ))}
      </div>
      {!rows.length && (section !== "Dokumenty robocze" || !drafts.length) && (
        <p>Brak dokumentów w tym widoku.</p>
      )}
      <Button onClick={() => go("pisma", "praca")}>Otwórz wspólne Pisma z urzędów</Button>
    </section>
  );
}

function WorkCatalog() {
  const go = useNexus((s) => s.go);
  const scope = useWork((s) => s.data.scope);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [group, setGroup] = useState("all");
  const results = workCatalog.filter(
    (item) =>
      (expanded || query || item.shortcut) &&
      (group === "all" || Number(group) === item.group) &&
      searchKey(`${item.title} ${item.official} ${item.code}`).includes(searchKey(query)),
  );
  return (
    <section className="civic-stack">
      <h2>Załatw sprawę</h2>
      <Field label="Szukaj usługi w katalogu">
        {(field) => (
          <input
            {...field}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </Field>
      <Button
        onClick={() => {
          setExpanded(!expanded);
          setGroup("all");
        }}
      >
        {expanded ? "Pokaż skróty" : "Wszystkie usługi"}
      </Button>
      {(expanded || query) && (
        <Field label="Grupa usług">
          {(field) => (
            <select {...field} value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="all">Wszystkie grupy</option>
              {workGroups.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}
      <div className="nx-list">
        {results.map((item) => (
          <Row
            key={item.id}
            glyph="work"
            title={item.title}
            meta={
              item.organizationsOnly && scope !== "organization"
                ? "Kontekst organizacji"
                : workGroups[item.group]
            }
            onClick={() => go("urzad", `praca/service/${item.id}`)}
          />
        ))}
      </div>
      {!results.length && <p>Brak usług pasujących do wyszukiwania.</p>}
    </section>
  );
}

function Offers({ section, resource }: { section: string; resource?: string }) {
  const { data, change } = useWork();
  const go = useNexus((s) => s.go);
  const [filters, setFilters] = useState({
    query: "",
    place: "",
    contract: "",
    hours: "",
    gross: "",
    saved: false,
  });
  const set = (key: keyof typeof filters, value: string | boolean) =>
    setFilters((s) => ({ ...s, [key]: value }));
  const gross = (offer: (typeof ePraca.offers)[number]) =>
    offer.gross
      ? `${offer.gross.toLocaleString("pl-PL")} zł brutto / ${offer.period}`
      : "Brak danych o wynagrodzeniu";
  const item = ePraca.offers.find((offer) => offer.id === resource);
  const results = ePraca.offers.filter(
    (offer) =>
      searchKey(offer.title).includes(searchKey(filters.query)) &&
      searchKey(offer.place).includes(searchKey(filters.place)) &&
      (!filters.contract || offer.contract === filters.contract) &&
      (!filters.hours || offer.hours === filters.hours) &&
      (!filters.gross || (offer.gross !== undefined && offer.gross >= Number(filters.gross))) &&
      (!filters.saved || data.extra.favourites.includes(offer.id)),
  );
  return (
    <section className="civic-stack">
      <h2>
        {section === "events"
          ? "Kalendarz targów, giełd i szkoleń"
          : section === "offer"
            ? (item?.title ?? "Brak oferty")
            : "Oferty pracy i wydarzenia — ePraca"}
      </h2>
      <p className="nx-fine">
        {ePraca.source} · aktualizacja {warsaw(ePraca.fetchedAt, true)}
      </p>
      {section === "offers" && (
        <>
          <Field label="Stanowisko">
            {(field) => (
              <input
                {...field}
                type="search"
                value={filters.query}
                onChange={(e) => set("query", e.target.value)}
              />
            )}
          </Field>
          <Field label="Miejscowość">
            {(field) => (
              <input
                {...field}
                type="search"
                value={filters.place}
                onChange={(e) => set("place", e.target.value)}
              />
            )}
          </Field>
          <Field label="Rodzaj umowy">
            {(field) => (
              <select
                {...field}
                value={filters.contract}
                onChange={(e) => set("contract", e.target.value)}
              >
                <option value="">Wszystkie</option>
                <option>Umowa o pracę</option>
                <option>Staż</option>
              </select>
            )}
          </Field>
          <Field label="Wymiar etatu">
            {(field) => (
              <select
                {...field}
                value={filters.hours}
                onChange={(e) => set("hours", e.target.value)}
              >
                <option value="">Wszystkie</option>
                <option>Pełny etat</option>
                <option>Pół etatu</option>
              </select>
            )}
          </Field>
          <Field label="Minimalne miesięczne wynagrodzenie brutto (zł)">
            {(field) => (
              <input
                {...field}
                type="number"
                min="0"
                value={filters.gross}
                onChange={(e) => set("gross", e.target.value)}
              />
            )}
          </Field>
          <Field label="Tylko zapisane oferty">
            {(field) => (
              <input
                {...field}
                type="checkbox"
                checked={filters.saved}
                onChange={(e) => set("saved", e.target.checked)}
              />
            )}
          </Field>
          <div className="nx-list">
            {results.map((offer) => (
              <Row
                key={offer.id}
                glyph="work"
                title={offer.title}
                meta={`${offer.place} · ${offer.contract} · ${gross(offer)}`}
                onClick={() => go("urzad", `praca/offer/${offer.id}`)}
              />
            ))}
          </div>
          {!results.length && <p>Brak ofert spełniających filtry.</p>}
          <Button onClick={() => go("urzad", "praca/events")}>
            Kalendarz targów, giełd i szkoleń
          </Button>
        </>
      )}
      {section === "offer" && item && (
        <article className="nx-sheet civic-stack">
          <p>
            {item.place} · {item.contract} · {item.hours} · {gross(item)}
          </p>
          <p>{item.description}</p>
          <Button
            onClick={() =>
              change((s) => ({
                ...s,
                extra: {
                  ...s.extra,
                  favourites: s.extra.favourites.includes(item.id)
                    ? s.extra.favourites.filter((id) => id !== item.id)
                    : [...s.extra.favourites, item.id],
                },
              }))
            }
          >
            {data.extra.favourites.includes(item.id) ? "Usuń z zapisanych ofert" : "Zapisz ofertę"}
          </Button>
        </article>
      )}
      {section === "events" &&
        ePraca.events.map((event) => (
          <article className="nx-sheet" key={event.id}>
            <h3>{event.title}</h3>
            <p>
              {warsaw(event.at, true)} · {event.place}
            </p>
          </article>
        ))}
      <External href={ePracaUrl}>Otwórz odrębny serwis ePraca</External>
    </section>
  );
}

export function WorkCaseActions({ item }: { item: CivicCase }) {
  const { data } = useWork();
  const go = useNexus((s) => s.go);
  const current = data.cases.find((entry) => entry.id === item.id && visible(data, entry));
  if (!current) return null;
  return (
    <section className="nx-sheet civic-stack">
      <h2>Podsumowanie</h2>
      <Status tone="info">{current.sourceStatus ?? "Brak informacji o rozstrzygnięciu"}</Status>
      {current.formCode && <p>Formularz · {current.formCode}</p>}
      <p>Status osoby w urzędzie · {current.labourStatus ?? "Brak informacji ze źródła"}</p>
      <Button onClick={() => go("urzad", "praca/cases")}>Sprawy w urzędzie pracy</Button>
    </section>
  );
}

export function WorkDocumentActions({ item }: { item: CivicDocument }) {
  const { data, change } = useWork();
  const go = useNexus((s) => s.go);
  const [receiving, setReceiving] = useState(false);
  const signed = item.signature && item.signature.completed >= item.signature.required;
  return (
    <>
      {item.delivery === "waiting" &&
        (receiving ? (
          <section className="nx-note civic-stack">
            <h2>Potwierdzenie odbioru demonstracyjnego</h2>
            <p>
              {item.title} · {item.office}
            </p>
            <p>Symulacja udostępni treść i wzór UPD. Rzeczywisty odbiór odbywa się w urzędzie.</p>
            <Action
              title="Potwierdzić odbiór demonstracyjny?"
              body="Zmiana będzie dotyczyć wyłącznie wzoru w NEXUS."
              onConfirm={() => change((s) => workReceive(s, item.id))}
            >
              Symuluj odbiór pisma
            </Action>
            <Button onClick={() => setReceiving(false)}>Wróć do metadanych pisma</Button>
          </section>
        ) : (
          <Button primary onClick={() => setReceiving(true)}>
            Przejdź do odbioru demonstracyjnego
          </Button>
        ))}
      {item.submission === "ready" &&
        (signed ? (
          <Action
            title="Wysłać podpisany dokument w demonstracji?"
            body="Powstanie lokalny wzór potwierdzenia UPP."
            onConfirm={() => change((s) => workSendSigned(s, item.id))}
          >
            Symuluj wysłanie dokumentu
          </Action>
        ) : (
          <Action
            title="Dodać demonstracyjny podpis?"
            body="Podpis zostanie zapisany lokalnie. Dokument będzie można wysłać osobno."
            onConfirm={() => change((s) => workSign(s, item.id))}
          >
            Symuluj kolejny podpis
          </Action>
        ))}
      {item.canContinue && item.delivery !== "waiting" && (
        <Button
          onClick={() => {
            const draft = continueWork(data, item, demoId("praca", "draft"));
            if (!draft) return;
            change((s) => saveDraft(s, draft));
            go("urzad", `praca/form/${draft.id}`);
          }}
        >
          Kontynuuj korespondencję
        </Button>
      )}
      {item.body && item.delivery !== "waiting" && (
        <Button
          onClick={() =>
            download(
              `${item.id}-eksport.txt`,
              `WZÓR — DANE FIKCYJNE\n${item.title}\n${item.body}`,
              "text/plain;charset=utf-8",
            )
          }
        >
          Eksportuj treść
        </Button>
      )}
    </>
  );
}
