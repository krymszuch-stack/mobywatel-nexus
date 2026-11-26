import { ZusHealthSource } from "./civic/zus";
import { useMemo, useState } from "react";
import {
  DOCUMENTS,
  HEALTH_REFERRAL_SAMPLE,
  PENALTY_POINTS_SAMPLE,
  TRUSTED,
  VEHICLE_SAMPLE,
} from "@/lib/nexus/data";
import { getActivePersona } from "@/lib/nexus/demo-stories";
import { plDate } from "@/lib/nexus/format";
import { selectCaseById, selectDerivedCases } from "@/lib/nexus/oneflow";
import { HUBS, servicesByCategory } from "@/lib/nexus/registry";
import { useNexus } from "@/lib/nexus/store";
import type { HubId } from "@/lib/nexus/types";
import { Glyph } from "./glyph";
import { Watermark } from "./heritage";
import { PageHead, Row, Status } from "./ui";

const AVAIL: Record<string, string> = {
  native: "w tym prototypie",
  simulated: "symulacja, bez połączenia z urzędem",
  external: "oficjalny serwis poza prototypem",
  concept: "koncepcja, bez zgłaszania zdarzeń",
};

export function ServiceCatalog() {
  const go = useNexus((s) => s.go);
  const [query, setQuery] = useState("");
  const [hubFilter, setHubFilter] = useState<"all" | HubId>("all");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servicesByCategory()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (hubFilter !== "all" && item.hub !== hubFilter) return false;
          if (!q) return true;
          return `${item.name} ${item.description} ${item.category} ${item.scopeNote}`
            .toLowerCase()
            .includes(q);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, hubFilter]);

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Katalog usług"
        title="Wszystkie usługi"
        lede="Pięć spójnych obszarów z rozpoznawalnymi nazwami mObywatela. Każda usługa jawnie oddziela prototyp od oficjalnego serwisu."
      />
      <label className="nx-searchpill nx-searchpill-field">
        <Glyph name="search" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj usługi, sprawy, dokumentu…"
        />
      </label>
      <div className="nx-filters" role="tablist" aria-label="Obszary usług">
        <button
          type="button"
          role="tab"
          aria-selected={hubFilter === "all"}
          onClick={() => setHubFilter("all")}
        >
          Wszystkie
        </button>
        {HUBS.map((hub) => (
          <button
            key={hub.id}
            type="button"
            role="tab"
            aria-selected={hubFilter === hub.id}
            onClick={() => setHubFilter(hub.id)}
          >
            {hub.name}
          </button>
        ))}
      </div>
      {groups.length === 0 ? (
        <p className="nx-fine">Nic nie pasuje. Spróbuj „mojeIKP”, „pojazd” albo „e-Doręczenia”.</p>
      ) : null}
      {groups.map((group) => (
        <section key={group.category}>
          <p className="nx-kicker nx-section">{group.category}</p>
          <div className="nx-list">
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nx-row"
                onClick={() => go(item.view, item.selectedId)}
              >
                <Glyph name={item.glyph} />
                <span className="nx-row-copy">
                  <strong>{item.name}</strong>
                  <small>
                    {item.description} · {AVAIL[item.availability]}
                  </small>
                </span>
                <Glyph name="forward" className="nx-row-go" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type HealthTab = "skierowania" | "recepty" | "wizyty" | "ubezpieczenie" | "upowaznienia";

export function HealthHub({ section }: { section?: string }) {
  const go = useNexus((s) => s.go);
  const addReminder = useNexus((s) => s.addReminder);
  const updateReminder = useNexus((s) => s.updateReminder);
  const removeReminder = useNexus((s) => s.removeReminder);
  const showToast = useNexus((s) => s.showToast);
  const reminders = useNexus((s) => s.reminders);
  const trustedOn = useNexus((s) => s.trustedOn);

  const initialTab: HealthTab =
    section === "recepty" ||
    section === "wizyty" ||
    section === "ubezpieczenie" ||
    section === "upowaznienia"
      ? section
      : "skierowania";

  const [activeTab, setActiveTab] = useState<HealthTab>(initialTab);
  const existing = reminders.find((item) => item.id === "skierowanie");
  const [remDate, setRemDate] = useState(existing?.isoDate ?? "2026-12-04");
  const [remTime, setRemTime] = useState(existing?.time ?? "09:30");

  const healthReminders = reminders.filter((item) => item.serviceId === "ikp" || item.targetView === "zdrowie");

  const handleSaveReminder = () => {
    const formattedWhen = `${plDate(remDate)}, ${remTime}`;
    if (existing) {
      updateReminder("skierowanie", {
        isoDate: remDate,
        time: remTime,
        when: formattedWhen,
      });
      showToast("Zaktualizowano przypomnienie na osi czasu");
    } else {
      addReminder(
        "skierowanie",
        "Skierowanie do kardiologa (mojeIKP)",
        formattedWhen,
        {
          isoDate: remDate,
          time: remTime,
          serviceId: "ikp",
          targetView: "zdrowie",
          targetId: "skierowania",
          note: "Własne przypomnienie — termin wizyty umawiasz na pacjent.gov.pl",
        },
      );
      showToast("Przypomnienie dodane do mojeIKP i na oś czasu");
    }
  };

  return (
    <div className="nx-stage">
      <Watermark motif="lab" />
      <PageHead
        kicker="Zdrowie · mojeIKP"
        title="Twoje zdrowie w jednym miejscu"
        lede="Podgląd w prototypie bez porad medycznych i bez rezerwacji wizyt. Prawdziwe recepty i terminy obsługuje pacjent.gov.pl."
      />
      <ZusHealthSource compact />

      <div className="nx-filters" role="tablist" aria-label="Zakładki zdrowia">
        {(
          [
            ["skierowania", "Skierowania (1)"],
            ["recepty", "Recepty"],
            ["wizyty", "Wizyty"],
            ["ubezpieczenie", "Ubezpieczenie"],
            ["upowaznienia", "Upoważnienia"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "skierowania" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">
            Skierowanie · wzór · {plDate(HEALTH_REFERRAL_SAMPLE.issuedDate)}
          </p>
          <h2>{HEALTH_REFERRAL_SAMPLE.title}</h2>
          <p>
            Kod wzoru: <strong>{HEALTH_REFERRAL_SAMPLE.code}</strong> · {HEALTH_REFERRAL_SAMPLE.issuer}
          </p>
          <p>{HEALTH_REFERRAL_SAMPLE.note}</p>

          <div className="nx-inline-form">
            <label className="nx-field">
              <span>Data przypomnienia</span>
              <input
                type="date"
                value={remDate}
                onChange={(event) => setRemDate(event.target.value)}
              />
            </label>
            <label className="nx-field">
              <span>Godzina</span>
              <input
                type="time"
                value={remTime}
                onChange={(event) => setRemTime(event.target.value)}
              />
            </label>
          </div>
          <div className="nx-actions">
            <button type="button" className="nx-btn nx-btn-primary" onClick={handleSaveReminder}>
              <Glyph name="calendar" />{" "}
              {existing ? "Zmień termin przypomnienia" : "Zapisz przypomnienie"}
            </button>
            {existing ? (
              <>
                <button type="button" className="nx-btn" onClick={() => go("os")}>
                  <Glyph name="timeline" /> Zobacz na osi czasu
                </button>
                <button
                  type="button"
                  className="nx-btn nx-btn-danger"
                  onClick={() => {
                    removeReminder("skierowanie");
                    showToast("Usunięto przypomnienie z osi czasu");
                  }}
                >
                  Usuń
                </button>
              </>
            ) : null}
          </div>
          {existing ? (
            <p className="nx-fine">
              Aktywne przypomnienie: <strong>{existing.when}</strong> (widoczne także na Mojej osi czasu i ekranie Start).
            </p>
          ) : null}
        </article>
      ) : null}

      {activeTab === "recepty" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">e-Recepty · brak danych w prototypie</p>
          <h2>Brak aktywnych e-Recept w danych wzoru</h2>
          <p>
            Dla fikcyjnego profilu Zofii Baran nie zapisano żadnej e-Recepty. Prawdziwe recepty i kody realizacji sprawdzisz wyłącznie w oficjalnym mojeIKP.
          </p>
          <a
            className="nx-btn nx-btn-primary"
            href="https://pacjent.gov.pl/internetowe-konto-pacjenta/erecepta"
            target="_blank"
            rel="noreferrer"
          >
            Otwórz pacjent.gov.pl — e-Recepta (poza prototypem)
          </a>
        </article>
      ) : null}

      {activeTab === "wizyty" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">Wizyty i przypomnienia</p>
          <h2>Prototyp nie umawia wizyt lekarskich</h2>
          <p>
            Możesz zapisać tutaj własne przypomnienie, żeby zadzwonić do rejestracji lub sprawdzić termin w oficjalnym serwisie.
          </p>
          {healthReminders.length > 0 ? (
            <div className="nx-list">
              {healthReminders.map((rem) => (
                <Row
                  key={rem.id}
                  glyph="calendar"
                  title={rem.title}
                  meta={rem.when}
                  onClick={() => go("os")}
                />
              ))}
            </div>
          ) : (
            <p className="nx-fine">Nie masz jeszcze przypomnień zdrowotnych. Ustaw je w zakładce Skierowania.</p>
          )}
          <a
            className="nx-btn"
            href="https://pacjent.gov.pl/"
            target="_blank"
            rel="noreferrer"
          >
            Przejdź do pacjent.gov.pl (oficjalny serwis)
          </a>
        </article>
      ) : null}

      {activeTab === "ubezpieczenie" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">Ubezpieczenie zdrowotne · ważna różnica</p>
          <h2>EKUZ nie potwierdza ubezpieczenia w Polsce</h2>
          <p>
            Karta EKUZ widoczna w portfelu wzorów służy wyłącznie do korzystania z niezbędnych świadczeń podczas pobytu w państwach UE/EFTA. Status ubezpieczenia zdrowotnego w Polsce potwierdzają systemy eWUŚ, NFZ oraz ZUS.
          </p>
          <div className="nx-actions">
            <button type="button" className="nx-btn" onClick={() => go("dokument", "ekuz")}>
              <Glyph name="health" /> Otwórz kartę EKUZ (wzór)
            </button>
            <a
              className="nx-btn"
              href="https://pacjent.gov.pl/"
              target="_blank"
              rel="noreferrer"
            >
              Sprawdź w pacjent.gov.pl
            </a>
          </div>
        </article>
      ) : null}

      {activeTab === "upowaznienia" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">Upoważnienia medyczne vs osoba zaufana</p>
          <h2>Osobne uprawnienia w mojeIKP</h2>
          <p>
            Osoba zaufana w tym prototypie ({TRUSTED.name} — obecnie{" "}
            <strong>{trustedOn ? "włączona" : "wyłączona"}</strong>) dotyczy wyłącznie lokalnego odbioru pism w prototypie. Nie daje dostępu do dokumentacji medycznej ani e-Recept w mojeIKP.
          </p>
          <div className="nx-actions">
            <button type="button" className="nx-btn" onClick={() => go("zaufana")}>
              <Glyph name="trusted" /> Zarządzaj osobą zaufaną
            </button>
            <a
              className="nx-btn nx-btn-primary"
              href="https://pacjent.gov.pl/internetowe-konto-pacjenta/upowaznij-bliska-osobe"
              target="_blank"
              rel="noreferrer"
            >
              Upoważnienia w pacjent.gov.pl (oficjalne)
            </a>
          </div>
        </article>
      ) : null}

      <div className="nx-tiles nx-section">
        <button type="button" className="nx-tile" onClick={() => go("dokument", "ekuz")}>
          <Glyph name="health" />
          <strong>Karta EKUZ</strong>
          <small>Wyjazdy UE/EFTA (nie zastępuje eWUŚ)</small>
        </button>
        <a className="nx-tile" href="https://pacjent.gov.pl/" target="_blank" rel="noreferrer">
          <Glyph name="institution" />
          <strong>pacjent.gov.pl</strong>
          <small>Oficjalne przejście, poza prototypem</small>
        </a>
      </div>
    </div>
  );
}

type DriverTab = "pojazdy" | "punkty" | "stluczka";

export function DriverHub({ section }: { section?: string }) {
  const state = useNexus();
  const { go } = state;
  const vehicleCase = selectCaseById(state, "rejestracja");

  const initialTab: DriverTab =
    section === "punkty" || section === "stluczka" ? section : "pojazdy";
  const [activeTab, setActiveTab] = useState<DriverTab>(initialTab);

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Kierowca"
        title="Pojazdy i uprawnienia"
        lede="Osobne widoki dla mPrawa jazdy, Moich pojazdów, Punktów karnych i koncepcji mStłuczka. Dane w prototypie są fikcyjne."
      />

      <div className="nx-filters" role="tablist" aria-label="Zakładki kierowcy">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "pojazdy"}
          onClick={() => setActiveTab("pojazdy")}
        >
          Moje pojazdy
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "punkty"}
          onClick={() => setActiveTab("punkty")}
        >
          Punkty karne ({PENALTY_POINTS_SAMPLE.activePoints})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "stluczka"}
          onClick={() => setActiveTab("stluczka")}
        >
          mStłuczka (koncepcja)
        </button>
      </div>

      {activeTab === "pojazdy" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">Moje pojazdy · podgląd wzoru (nie rejestr CEPiK)</p>
          <h2>{VEHICLE_SAMPLE.plate}</h2>
          <p>{VEHICLE_SAMPLE.model} · rocznik {VEHICLE_SAMPLE.year}</p>
          <dl className="nx-dl">
            <div>
              <dt>Numer VIN (wzór)</dt>
              <dd>{VEHICLE_SAMPLE.vin}</dd>
            </div>
            <div>
              <dt>Badanie techniczne</dt>
              <dd>{VEHICLE_SAMPLE.inspectionStatus}</dd>
            </div>
            <div>
              <dt>Polisa OC</dt>
              <dd>{VEHICLE_SAMPLE.policyStatus}</dd>
            </div>
            <div>
              <dt>Powiązana sprawa</dt>
              <dd>{vehicleCase ? `${vehicleCase.title} — ${vehicleCase.status}` : "Brak"}</dd>
            </div>
          </dl>
          <div className="nx-actions">
            <button type="button" className="nx-btn nx-btn-primary" onClick={() => go("sprawa", "rejestracja")}>
              <Glyph name="case" /> Otwórz sprawę KR/2026/4412
            </button>
            <button type="button" className="nx-btn" onClick={() => go("zdarzenie", "pojazd")}>
              <Glyph name="vehicle" /> Ścieżka dowodu rejestracyjnego
            </button>
          </div>
          <p className="nx-fine">
            Oficjalna informacja:{" "}
            <a
              href="https://info.mobywatel.gov.pl/uslugi/moje-pojazdy"
              target="_blank"
              rel="noreferrer"
              className="nx-extlink"
            >
              info.mobywatel.gov.pl — Moje pojazdy
            </a>
          </p>
        </article>
      ) : null}

      {activeTab === "punkty" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">Punkty karne · podgląd wzoru</p>
          <h2>Aktualna liczba: {PENALTY_POINTS_SAMPLE.activePoints}</h2>
          <p>Punkty tymczasowe: {PENALTY_POINTS_SAMPLE.temporaryPoints}</p>
          <p>{PENALTY_POINTS_SAMPLE.checkedNote}</p>
          <Status tone="ok">0 punktów w danych wzoru</Status>
          <div className="nx-actions">
            <button type="button" className="nx-btn" onClick={() => go("dokument", "prawojazdy")}>
              <Glyph name="wheel" /> Otwórz mPrawo jazdy
            </button>
            <a
              className="nx-btn nx-btn-primary"
              href={PENALTY_POINTS_SAMPLE.officialUrl}
              target="_blank"
              rel="noreferrer"
            >
              Oficjalna usługa na info.mobywatel.gov.pl
            </a>
          </div>
        </article>
      ) : null}

      {activeTab === "stluczka" ? (
        <article className="nx-benefit">
          <p className="nx-kicker">mStłuczka · wyłącznie koncepcja w tym prototypie</p>
          <h2>Koncepcja oświadczenia sprawcy zdarzenia</h2>
          <p>
            „mStłuczka” jest prawdziwą nazwą usługi w ekosystemie mObywatela, lecz w tym prototypie konkursowym ma wyłącznie charakter koncepcyjny — nie sporządza ważnego oświadczenia i nie zgłasza szkody do ubezpieczyciela ani policji.
          </p>
          <ul className="nx-bullets">
            <li>Jeżeli ktoś ucierpiał lub droga jest zablokowana — zadzwoń pod 112.</li>
            <li>W prototypie nie przesyłamy zdjęć, lokalizacji ani danych drugiego kierowcy.</li>
          </ul>
          <div className="nx-actions">
            <a className="nx-btn nx-btn-danger" href="tel:112">
              <Glyph name="emergency" /> Zadzwoń 112 (numer alarmowy)
            </a>
            <a
              className="nx-btn"
              href="https://www.gov.pl/web/mobywatel"
              target="_blank"
              rel="noreferrer"
            >
              Oficjalne informacje — gov.pl/web/mobywatel
            </a>
          </div>
        </article>
      ) : null}

      <p className="nx-kicker nx-section">Powiązane dokumenty kierowcy</p>
      <div className="nx-list">
        <Row
          glyph="wheel"
          title="mPrawo jazdy"
          meta="Kategoria B · ważne do 2035 (wzór)"
          onClick={() => go("dokument", "prawojazdy")}
        />
        <Row
          glyph="letter"
          title="Pismo KR/2026/4412 — Wydział Komunikacji"
          meta="Uzupełnij wniosek o dowód rejestracyjny"
          onClick={() => go("pismo", "komunikacja")}
        />
      </div>
    </div>
  );
}

export function Profile() {
  const state = useNexus();
  const { go, peselLocked, reminders, receipts, lost } = state;
  const cases = selectDerivedCases(state);
  const persona = getActivePersona(state.activePersona);
  return (
    <div className="nx-stage">
      <PageHead
        kicker="Profil"
        title={`${persona.given} ${persona.family}`}
        lede={`${persona.roleLabel}. To nie jest Twoje konto w mObywatelu — wszystko zostaje w tej przeglądarce.`}
      />
      <article className="nx-benefit">
        <p className="nx-kicker">
          PESEL {peselLocked ? "· zastrzeżony w prototypie" : "· bez zastrzeżenia"}
        </p>
        <p>
          {persona.address}, {persona.city}
        </p>
        <p className="nx-fine">
          Sprawy: {cases.length} · Przypomnienia: {reminders.length} · Potwierdzenia UPO-WZÓR: {receipts.length}
          {lost.length > 0 ? ` · Zgłoszone utraty: ${lost.length}` : ""}
        </p>
        <button type="button" className="nx-btn" onClick={() => go("dokument", "dowod")}>
          Pokaż mDowód
        </button>
      </article>
      <div className="nx-list">
        <Row glyph="sliders" title="Wygląd i wielkość liter" meta="Motyw, wielkość tekstu, prosty ekran" onClick={() => go("wyglad")} />
        <Row glyph="shield" title="Ochrona tożsamości" meta="PESEL, utrata dokumentu, alarm" onClick={() => go("bezpieczenstwo")} />
        <Row glyph="eye" title="Dostęp do moich danych" meta="Historia wglądu i operacji lokalnych" onClick={() => go("dostepy")} />
        <Row glyph="trusted" title="Osoba zaufana" meta="Marek Baran (poza mojeIKP)" onClick={() => go("zaufana")} />
        <Row glyph="timeline" title="Moja oś czasu" meta="Sprawy, potwierdzenia i przypomnienia" onClick={() => go("os")} />
        <Row glyph="support" title="Możliwe wsparcie" meta="Świadczenia do sprawdzenia, nie decyzje" onClick={() => go("wsparcie")} />
      </div>
      <p className="nx-fine">
        Dokumenty w portfelu: {DOCUMENTS.length}. Żaden nie jest dokumentem urzędowym.
      </p>
    </div>
  );
}
