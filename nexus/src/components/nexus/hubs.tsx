import { useMemo, useState } from "react";
import { CASES, CITIZEN, DOCUMENTS } from "@/lib/nexus/data";
import { SERVICES, servicesByCategory } from "@/lib/nexus/registry";
import { useNexus } from "@/lib/nexus/store";
import { Glyph } from "./glyph";
import { PageHead, Row } from "./ui";

const AVAIL: Record<string, string> = {
  native: "w tym prototypie",
  simulated: "symulacja, nie połączenie z urzędem",
  external: "otwiera oficjalną stronę",
  concept: "pomysł, jeszcze bez obiegu",
};

export function ServiceCatalog() {
  const go = useNexus((s) => s.go);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "home">("all");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servicesByCategory()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (tab === "home" && !item.home && !item.simple) return false;
          if (!q) return true;
          return `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(q);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, tab]);

  return (
    <div className="nx-stage">
      <PageHead kicker="Katalog" title="Usługi" lede="Znajome nazwy z mObywatela. Każda mówi, czy działa tutaj, czy jest tylko pokazem." />
      <label className="nx-searchpill nx-searchpill-field">
        <Glyph name="orbit" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj usługi, sprawy, dokumentu…" />
      </label>
      <div className="nx-filters" role="tablist">
        <button type="button" aria-selected={tab === "all"} onClick={() => setTab("all")}>
          Wszystkie
        </button>
        <button type="button" aria-selected={tab === "home"} onClick={() => setTab("home")}>
          Na pulpicie
        </button>
      </div>
      {groups.length === 0 ? <p className="nx-fine">Nic nie pasuje. Spróbuj „zdrowie” albo „pojazd”.</p> : null}
      {groups.map((group) => (
        <section key={group.category}>
          <p className="nx-kicker nx-section">{group.category}</p>
          <div className="nx-list">
            {group.items.map((item) => (
              <button key={item.id} type="button" className="nx-row" onClick={() => go(item.view, item.selectedId)}>
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

export function HealthHub() {
  const go = useNexus((s) => s.go);
  const addReminder = useNexus((s) => s.addReminder);
  const showToast = useNexus((s) => s.showToast);
  const reminders = useNexus((s) => s.reminders ?? []);
  const saved = reminders.some((item) => item.id === "skierowanie");
  return (
    <div className="nx-stage">
      <PageHead
        kicker="mojeIKP"
        title="Twoje zdrowie w jednym miejscu"
        lede="Podgląd w prototypie. Prawdziwą receptę i termin umawiasz w mojeIKP albo na pacjent.gov.pl."
      />
      <div className="nx-tiles">
        <button type="button" className="nx-tile" onClick={() => go("dokument", "ekuz")}>
          <Glyph name="health" />
          <strong>Ubezpieczenie</strong>
          <small>Karta EKUZ w portfelu wzorów</small>
        </button>
        <a className="nx-tile" href="https://pacjent.gov.pl/" target="_blank" rel="noreferrer">
          <Glyph name="institution" />
          <strong>pacjent.gov.pl</strong>
          <small>Oficjalne przejście, poza prototypem</small>
        </a>
      </div>
      <article className="nx-benefit">
        <p className="nx-kicker">Nowe skierowanie · wzór</p>
        <h2>Skierowanie do kardiologa</h2>
        <p>Wystawione 22 listopada 2026 w przykładowej poradni POZ. Nie jest poradą lekarską i nie rezerwuje wizyty.</p>
        <button
          type="button"
          className="nx-btn"
          disabled={saved}
          onClick={() => {
            addReminder("skierowanie", "Przypomnienie: skierowanie do kardiologa", "wzór · bez umówionej godziny");
            showToast("Przypomnienie jest na osi czasu");
            go("os");
          }}
        >
          {saved ? "Przypomnienie zapisane" : "Zapisz przypomnienie"}
        </button>
      </article>
      <div className="nx-list">
        <Row glyph="health" title="Recepty" meta="Brak przykładowej recepty w tym wzorze" onClick={() => showToast("W wzorze nie ma recepty do pokazania")} />
        <Row glyph="documents" title="Skierowania" meta="Jedno przykładowe, powyżej" onClick={() => showToast("Szczegóły są na karcie skierowania")} />
        <Row glyph="calendar" title="Wizyty" meta={saved ? "Masz przypomnienie, bez terminu" : "Nie umawiamy wizyty z tego prototypu"} onClick={() => go("os")} />
        <Row glyph="trusted" title="Upoważnienia" meta="Osoba zaufana: Marek Baran" onClick={() => go("zaufana")} />
      </div>
    </div>
  );
}

export function DriverHub() {
  const go = useNexus((s) => s.go);
  const vehicle = CASES.find((item) => item.id === "rejestracja");
  return (
    <div className="nx-stage">
      <PageHead kicker="Kierowca" title="Pojazdy i uprawnienia" lede="mPrawo jazdy, pojazdy, punkty i mStłuczka. Liczby są zmyślone." />
      <div className="nx-list">
        <Row glyph="vehicle" title="mPrawo jazdy" meta="Kategoria B · ważne do 2035" onClick={() => go("dokument", "prawojazdy")} />
        <Row glyph="vehicle" title="Moje pojazdy" meta="KR NX851 · wzór, nie rejestr CEPiK" onClick={() => go("zdarzenie", "pojazd")} />
        <Row glyph="alert" title="Punkty karne" meta="Aktualna liczba w wzorze: 0" onClick={() => go("zdarzenie", "pojazd")} />
        <Row glyph="emergency" title="mStłuczka" meta="Pomysł konkursowy. Nie zgłasza kolizji na policję." onClick={() => go("bezpieczenstwo")} />
        <Row
          glyph="calendar"
          title="Badanie techniczne"
          meta={vehicle ? "Brakuje do wymiany dowodu rejestracyjnego" : "Brak terminu"}
          onClick={() => go("sprawa", "rejestracja")}
        />
      </div>
      <p className="nx-fine">Polisa nie jest podłączona. W prawdziwej usłudze pochodziłaby od ubezpieczyciela.</p>
    </div>
  );
}

export function Profile() {
  const go = useNexus((s) => s.go);
  const peselLocked = useNexus((s) => s.peselLocked);
  return (
    <div className="nx-stage">
      <PageHead kicker="Profil" title={`${CITIZEN.given} ${CITIZEN.family}`} lede="Wzorcowa mieszkanka. To nie jest Twoje konto w mObywatelu." />
      <article className="nx-benefit">
        <p className="nx-kicker">PESEL {peselLocked ? "· zastrzeżony w prototypie" : "· bez zastrzeżenia"}</p>
        <p>
          {CITIZEN.address}, {CITIZEN.city}
        </p>
        <button type="button" className="nx-btn" onClick={() => go("dokument", "dowod")}>
          Pokaż mDowód
        </button>
      </article>
      <div className="nx-list">
        <Row glyph="sliders" title="Wygląd i dostępność" meta="Motyw, tekst, ruch" onClick={() => go("wyglad")} />
        <Row glyph="shield" title="Bezpieczeństwo" meta="PESEL, utrata dokumentu, alarm" onClick={() => go("bezpieczenstwo")} />
        <Row glyph="eye" title="Kto widział dane" meta="Historia wglądu z wzoru" onClick={() => go("dostepy")} />
        <Row glyph="trusted" title="Osoba zaufana" meta="Marek Baran" onClick={() => go("zaufana")} />
        <Row glyph="timeline" title="Oś czasu" meta="Sprawy i przypomnienia" onClick={() => go("os")} />
        <Row glyph="support" title="Możliwe wsparcie" meta="Świadczenia, nie decyzje" onClick={() => go("wsparcie")} />
      </div>
      <p className="nx-fine">Dokumenty w portfelu: {DOCUMENTS.length}. Żaden nie jest dokumentem urzędowym.</p>
    </div>
  );
}
