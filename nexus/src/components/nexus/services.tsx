import { useState } from "react";
import {
  ACCESS,
  ALARMS,
  BENEFITS,
  CASES,
  CITIZEN,
  DEVICE,
  DOCUMENTS,
  JOURNEYS,
  TIMELINE,
  TRUSTED,
} from "@/lib/nexus/data";
import { plDate } from "@/lib/nexus/format";
import { useNexus } from "@/lib/nexus/store";
import type { HomeMode, ThemeName } from "@/lib/nexus/types";
import { Watermark } from "./heritage";
import { Glyph } from "./glyph";
import { ConfirmDialog, Missing, PageHead, Row, Status } from "./ui";

const CASE_TONE = {
  "w toku": "warn",
  przyznana: "ok",
  zakończona: "info",
} as const;

export function CaseList() {
  const go = useNexus((s) => s.go);
  return (
    <div className="nx-stage">
      <Watermark motif="civic" />
      <PageHead kicker="Sprawy" title="To, co jest w toku" lede="Każda sprawa mówi, na którym jest kroku i kto ją prowadzi." />
      <div className="nx-list">
        {CASES.map((item) => (
          <button key={item.id} type="button" className="nx-row" onClick={() => go("sprawa", item.id)}>
            <span className="nx-well nx-tone-amber"><Glyph name="case" /></span>
            <span className="nx-row-copy">
              <strong>{item.title}</strong>
              <small>
                {item.office} · {plDate(item.updated)}
              </small>
            </span>
            <Status tone={CASE_TONE[item.status]}>{item.status}</Status>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CaseDetail({ id }: { id: string }) {
  const item = CASES.find((entry) => entry.id === id);
  const back = useNexus((s) => s.back);
  const note = useNexus((s) => s.caseNotes[id] ?? "");
  const setNote = useNexus((s) => s.setCaseNote);
  const go = useNexus((s) => s.go);
  if (!item) return <Missing title="Nie ma takiej sprawy" onBack={back} />;
  return (
    <div className="nx-stage">
      <PageHead kicker={item.office} title={item.title} lede={item.summary} />
      <ol className="nx-steps">
        {item.steps.map((step) => (
          <li key={step.label} data-state={step.state}>
            {step.label}
          </li>
        ))}
      </ol>
      {item.journeyId ? (
        <button type="button" className="nx-btn nx-btn-primary" onClick={() => go("zdarzenie", item.journeyId)}>
          Przejdź ścieżkę
        </button>
      ) : null}
      <label className="nx-field">
        <span>Twoja notatka</span>
        <textarea value={note} rows={4} onChange={(event) => setNote(item.id, event.target.value)} />
      </label>
      <p className="nx-fine">Notatka zostaje przy sprawie. Urząd jej nie widzi.</p>
    </div>
  );
}

export function JourneyList() {
  const go = useNexus((s) => s.go);
  const journeys = useNexus((s) => s.journeys);
  return (
    <div className="nx-stage">
      <Watermark motif="civic" />
      <PageHead
        kicker="Załatw sprawę"
        title="Ścieżki, nie okienka"
        lede="Wybierz zdarzenie. Każde prowadzi krok po kroku i mówi, czego jeszcze brakuje."
      />
      <div className="nx-list">
        {JOURNEYS.map((journey) => (
          <Row
            key={journey.id}
            glyph={journey.glyph}
            title={journey.title}
            meta={journeys[journey.id]?.done ? "zapisane w prototypie" : journey.lede}
            onClick={() => go("zdarzenie", journey.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function JourneyDetail({ id }: { id: string }) {
  const journey = JOURNEYS.find((item) => item.id === id);
  const back = useNexus((s) => s.back);
  const progress = useNexus((s) => s.journeys[id]);
  const setStep = useNexus((s) => s.setJourneyStep);
  const setChoice = useNexus((s) => s.setJourneyChoice);
  const finish = useNexus((s) => s.finishJourney);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);
  if (!journey) return <Missing title="Nie ma takiej ścieżki" onBack={back} />;
  const stepIndex = progress?.step ?? 0;
  const step = journey.steps[Math.min(stepIndex, journey.steps.length - 1)];
  const choice = progress?.choices[step.id];
  const last = stepIndex >= journey.steps.length - 1;
  const blocked = Boolean(step.options && !choice);

  return (
    <div className="nx-stage">
      <Watermark motif={journey.motif} />
      <PageHead kicker={`Krok ${stepIndex + 1} z ${journey.steps.length}`} title={journey.title} lede={journey.lede} />
      <section className="nx-sheet">
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        {step.options ? (
          <div className="nx-choices" role="group" aria-label={step.title}>
            {step.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="nx-choice"
                aria-pressed={choice === option.id}
                onClick={() => setChoice(journey.id, step.id, option.id)}
              >
                <strong>{option.label}</strong>
                {option.meta ? <small>{option.meta}</small> : null}
              </button>
            ))}
          </div>
        ) : null}
        {progress?.done ? <p className="nx-note">Ta ścieżka jest zapisana na urządzeniu.</p> : null}
      </section>
      <div className="nx-actions">
        <button
          type="button"
          className="nx-btn"
          disabled={stepIndex === 0}
          onClick={() => setStep(journey.id, Math.max(0, stepIndex - 1))}
        >
          Wstecz
        </button>
        {last ? (
          <button type="button" className="nx-btn nx-btn-primary" disabled={blocked} onClick={() => setAsk(true)}>
            Zapisz w prototypie
          </button>
        ) : (
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            disabled={blocked}
            onClick={() => setStep(journey.id, stepIndex + 1)}
          >
            Dalej
          </button>
        )}
      </div>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zapisać ten krok?"
        body="Wybór zostaje w aplikacji. Nie rezerwujemy terminu i nie wysyłamy pisma."
        confirm="Zapisz"
        onConfirm={() => {
          finish(journey.id);
          showToast("Ścieżka zapisana w prototypie");
        }}
      />
    </div>
  );
}

export function Benefits() {
  const mealAsk = useNexus((s) => s.mealAsk);
  const mealSent = useNexus((s) => s.mealSent);
  const setMealAsk = useNexus((s) => s.setMealAsk);
  const sendMealAsk = useNexus((s) => s.sendMealAsk);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);
  return (
    <div className="nx-stage">
      <Watermark motif="lattice" />
      <PageHead
        kicker="Możliwe wsparcie"
        title="Co już masz i co warto sprawdzić"
        lede="Podpowiedź nie jest decyzją urzędu. Tam, gdzie danych brakuje, mówimy to wprost."
      />
      <div className="nx-stack">
        {BENEFITS.map((item, index) => (
          <article key={item.id} className="nx-benefit" data-wash={["mint", "sky", "peach", "amber"][index % 4]}>
            <p className="nx-kicker">{item.state}</p>
            <h2>{item.title}</h2>
            {item.amount ? <p className="nx-amount">{item.amount}</p> : null}
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
      <form
        className="nx-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (mealSent) return;
          if (!mealAsk.trim()) {
            showToast("Dopisz jedno zdanie, o co pytasz");
            return;
          }
          setAsk(true);
        }}
      >
        <h2>Pytanie o obiady</h2>
        <label className="nx-field">
          <span>Dla {CITIZEN.child}</span>
          <textarea
            rows={4}
            value={mealAsk}
            disabled={mealSent}
            onChange={(event) => setMealAsk(event.target.value)}
            placeholder="Na przykład: proszę o informację, jakie dochody bierzecie pod uwagę"
          />
        </label>
        {mealSent ? (
          <p className="nx-note">Pytanie zapisane w prototypie. Szkoła go nie dostała.</p>
        ) : (
          <button type="submit" className="nx-btn nx-btn-primary">
            Zapisz pytanie
          </button>
        )}
      </form>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zostawić pytanie w prototypie?"
        body="Nie wyślemy go do szkoły. Zostanie tutaj, razem z resztą szkiców."
        confirm="Zapisz pytanie"
        onConfirm={() => {
          sendMealAsk();
          showToast("Pytanie zapisane w prototypie");
        }}
      />
    </div>
  );
}

export function Timeline() {
  const reminders = useNexus((s) => s.reminders ?? []);
  return (
    <div className="nx-stage">
      <Watermark motif="orbits" />
      <PageHead kicker="Oś czasu" title="Co działo się po kolei" lede="Od najnowszego. Zdarzenia z wzoru i przypomnienia zapisane tutaj." />
      {reminders.length > 0 ? (
        <div className="nx-list">
          {reminders.map((item) => (
            <article key={item.id} className="nx-benefit">
              <p className="nx-kicker">Twoje przypomnienie</p>
              <h2>{item.title}</h2>
              <p>{item.when}</p>
            </article>
          ))}
        </div>
      ) : null}
      <ol className="nx-steps nx-steps-loose">
        {TIMELINE.map((event) => (
          <li key={event.id} data-state="done">
            <div className="nx-stepbtn">
              <strong>{event.title}</strong>
              <small>
                {plDate(event.date)} · {event.meta}
              </small>
            </div>
          </li>
        ))}
      </ol>
      <p className="nx-fine">Starsze wpisy są skrótem, nie pełną aktą.</p>
    </div>
  );
}

export function Security() {
  const go = useNexus((s) => s.go);
  const lost = useNexus((s) => s.lost);
  const reportLost = useNexus((s) => s.reportLost);
  const showToast = useNexus((s) => s.showToast);
  const [docId, setDocId] = useState(DOCUMENTS[0]?.id ?? "dowod");
  const [ask, setAsk] = useState(false);
  const peselLocked = useNexus((s) => s.peselLocked);
  const lockPesel = useNexus((s) => s.lockPesel);
  const [askPesel, setAskPesel] = useState(false);
  return (
    <div className="nx-stage">
      <Watermark motif="lattice" />
      <PageHead
        kicker="Bezpieczeństwo"
        title="Gdy coś jest nie tak"
        lede="Najpierw numer alarmowy. Potem utrata dokumentu albo zastrzeżenie PESEL. To wzór, nie zgłoszenie."
      />
      <article className="nx-benefit">
        <p className="nx-kicker">Zastrzeż PESEL</p>
        <h2>{peselLocked ? "Numer jest zastrzeżony w tym prototypie" : "Numer nie jest zastrzeżony"}</h2>
        <p>Prawdziwe zastrzeżenie robisz w oficjalnej usłudze. Tutaj zmieniamy tylko status na tym urządzeniu.</p>
        <button type="button" className="nx-btn" disabled={peselLocked} onClick={() => setAskPesel(true)}>
          {peselLocked ? "Już zastrzeżony" : "Zastrzeż PESEL"}
        </button>
      </article>
      <ConfirmDialog
        open={askPesel}
        onOpenChange={setAskPesel}
        title="Zastrzec PESEL w prototypie?"
        body="Status zobaczysz na pulpicie i w profilu. Nikt poza tą przeglądarką go nie dostanie."
        confirm="Zastrzeż"
        onConfirm={() => {
          lockPesel();
          showToast("PESEL zastrzeżony w prototypie");
          setAskPesel(false);
        }}
      />
      <div className="nx-alarms">
        {ALARMS.map((alarm) => (
          <a key={alarm.id} className="nx-alarm" href={alarm.href}>
            <strong>{alarm.name}</strong>
            <small>{alarm.meta}</small>
          </a>
        ))}
      </div>
      <section className="nx-sheet">
        <p className="nx-kicker">To urządzenie</p>
        <h2>{DEVICE.name}</h2>
        <p>
          {DEVICE.place}. {DEVICE.since}. W prototypie nie ma innych sesji do wylogowania.
        </p>
      </section>
      <form
        className="nx-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (lost.includes(docId)) {
            showToast("Ten wzór ma już zgłoszoną utratę");
            return;
          }
          setAsk(true);
        }}
      >
        <h2>Zgłoś utratę</h2>
        <label className="nx-field">
          <span>Który dokument</span>
          <select value={docId} onChange={(event) => setDocId(event.target.value)}>
            {DOCUMENTS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
                {lost.includes(doc.id) ? " — utrata zgłoszona" : ""}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="nx-btn nx-btn-danger">
          Zgłoś utratę
        </button>
      </form>
      <button type="button" className="nx-textbtn" onClick={() => go("zaufana")}>
        Osoba zaufana
      </button>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zgłosić utratę?"
        body="Status zmieni się tylko w prototypie. Prawdziwy urząd nie dostanie sygnału."
        confirm="Zgłoś"
        danger
        onConfirm={() => {
          reportLost(docId);
          showToast("Zgłoszono utratę w prototypie");
        }}
      />
    </div>
  );
}

export function AccessLog() {
  return (
    <div className="nx-stage">
      <Watermark motif="lab" />
      <PageHead
        kicker="Twoje dane"
        title="Kto widział dane"
        lede="Każdy wiersz mówi kto, co i po co. To wzór historii, nie log z systemu."
      />
      <div className="nx-stack">
        {ACCESS.map((event) => (
          <article key={event.id} className="nx-benefit">
            <p className="nx-kicker">{event.at}</p>
            <h2>{event.who}</h2>
            <p>{event.what}</p>
            <p className="nx-fine">{event.why}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TrustedPerson() {
  const on = useNexus((s) => s.trustedOn);
  const setTrusted = useNexus((s) => s.setTrusted);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);
  const [next, setNext] = useState(false);
  return (
    <div className="nx-stage">
      <PageHead kicker="Osoba zaufana" title={TRUSTED.name} lede={`${TRUSTED.relation} · ${TRUSTED.phone}`} />
      <p>{TRUSTED.note}</p>
      <p className="nx-note">{on ? "Upoważnienie jest włączone w prototypie." : "Upoważnienie jest wyłączone."}</p>
      <button
        type="button"
        className={on ? "nx-btn" : "nx-btn nx-btn-primary"}
        onClick={() => {
          setNext(!on);
          setAsk(true);
        }}
      >
        {on ? "Wyłącz upoważnienie" : "Włącz upoważnienie"}
      </button>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title={next ? "Włączyć upoważnienie?" : "Wyłączyć upoważnienie?"}
        body={
          next
            ? "Marek będzie mógł w tym wzorze odebrać pismo. Poza prototypem nic się nie zmienia."
            : "Odbieranie pism wraca tylko do ciebie. Zmiana zostaje na urządzeniu."
        }
        confirm={next ? "Włącz" : "Wyłącz"}
        onConfirm={() => {
          setTrusted(next);
          showToast(next ? "Upoważnienie włączone" : "Upoważnienie wyłączone");
        }}
      />
    </div>
  );
}

const MODES: { id: HomeMode; label: string }[] = [
  { id: "simple", label: "Prosto i wygodnie" },
  { id: "daily", label: "Na co dzień" },
  { id: "dense", label: "Wszystko pod ręką" },
];

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "porcelain", label: "Porcelana" },
  { id: "midnight", label: "Północ" },
  { id: "contrast", label: "Kontrast" },
];

export function Settings() {
  const theme = useNexus((s) => s.theme);
  const mode = useNexus((s) => s.mode);
  const scale = useNexus((s) => s.textScale);
  const motion = useNexus((s) => s.motion);
  const dayMode = useNexus((s) => s.dayMode);
  const setTheme = useNexus((s) => s.setTheme);
  const setMode = useNexus((s) => s.setMode);
  const setTextScale = useNexus((s) => s.setTextScale);
  const setMotion = useNexus((s) => s.setMotion);
  const setDayMode = useNexus((s) => s.setDayMode);
  const resetAll = useNexus((s) => s.resetAll);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Wygląd i dostępność"
        title="Spokojnie i czytelnie"
        lede="Motyw, gęstość startu, wielkość tekstu i ruch. Ustawienia zostają na urządzeniu."
      />
      <fieldset className="nx-scale">
        <legend>Motyw</legend>
        {THEMES.map((item) => (
          <label key={item.id}>
            <input type="radio" name="theme" checked={theme === item.id} onChange={() => setTheme(item.id)} />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Ekran startowy</legend>
        {MODES.map((item) => (
          <label key={item.id}>
            <input type="radio" name="mode" checked={mode === item.id} onChange={() => setMode(item.id)} />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Wielkość tekstu</legend>
        {[1, 1.25, 1.5, 1.75, 2].map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="scale"
              checked={scale === value}
              onChange={() => setTextScale(value)}
            />
            <span>{Math.round(value * 100)}%</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Ruch</legend>
        <label>
          <input type="radio" name="motion" checked={motion === "system"} onChange={() => setMotion("system")} />
          <span>Jak w urządzeniu</span>
        </label>
        <label>
          <input type="radio" name="motion" checked={motion === "reduce"} onChange={() => setMotion("reduce")} />
          <span>Ogranicz ruch</span>
        </label>
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Ważne dni</legend>
        <p className="nx-fine">
          11 listopada i 15 sierpnia dostają cienką linię. 3 maja lekko podnosi ślad rękopisu. Zwykłego dnia nic się nie
          zmienia.
        </p>
        {(
          [
            ["auto", "Według daty"],
            ["off", "Wyłącz"],
            ["nov11", "Podgląd 11 listopada"],
            ["may3", "Podgląd 3 maja"],
            ["aug15", "Podgląd 15 sierpnia"],
          ] as const
        ).map(([id, label]) => (
          <label key={id}>
            <input type="radio" name="day" checked={dayMode === id} onChange={() => setDayMode(id)} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <p className="nx-fine">
        Szukanie: Ctrl+K albo klawisz /. Niezależny prototyp konkursowy — nie jest aplikacją administracji.
      </p>
      <button type="button" className="nx-btn nx-btn-danger" onClick={() => setAsk(true)}>
        Przywróć prototyp
      </button>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Wyczyścić zapisany stan?"
        body="Znikną szkice, odpowiedzi, udostępnienia i wybór układu. Dane wzoru zostaną. Potem zobaczysz ekran pierwszego uruchomienia."
        confirm="Przywróć"
        danger
        onConfirm={() => {
          resetAll();
          showToast("Prototyp przywrócony");
        }}
      />
    </div>
  );
}
