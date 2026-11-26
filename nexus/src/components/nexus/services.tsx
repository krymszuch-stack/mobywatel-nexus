import { useState } from "react";
import { agencyNames, visible, warsaw } from "@/lib/nexus/civic/model";
import { caseVisible, useAgencySchedule, useCivicData, visibleEvents } from "@/lib/nexus/civic/select";
import { civicGlyph } from "./civic/navigation";
import { Field, TaskRows } from "./civic/ui";
import {
  ALARMS,
  BENEFITS,
  CITIZEN,
  DEVICE,
  DOCUMENTS,
  JOURNEYS,
  TRUSTED,
} from "@/lib/nexus/data";
import { getActivePersona } from "@/lib/nexus/demo-stories";
import { plDate } from "@/lib/nexus/format";
import {
  formatEventTime,
  selectAccessTransparencyLog,
  selectCaseById,
  selectDerivedCases,
  selectUnifiedTimeline,
} from "@/lib/nexus/oneflow";
import { useNexus } from "@/lib/nexus/store";
import type { HomeMode, ThemeName } from "@/lib/nexus/types";
import { Watermark } from "./heritage";
import { Glyph } from "./glyph";
import { ConfirmDialog, Missing, PageHead, Row, Status } from "./ui";

const CASE_TONE = {
  "w toku": "warn",
  przyznana: "ok",
  zakończona: "info",
  "odpowiedź zapisana (wzór)": "ok",
} as const;

const BENEFIT_TONE = {
  przysługuje: "ok",
  "warto sprawdzić": "warn",
  "nie widzimy podstaw": "info",
} as const;

export function CaseList() {
  const state = useNexus();
  const cases = selectDerivedCases(state);
  const sources = useCivicData();
  const source = state.selectedId ?? "all";
  const agencyCases = sources.flatMap((data) => data.cases.filter((item) => visible(data, item) && (source === "all" || source === item.source)));
  const agencyTasks = sources.flatMap((data) => data.tasks.filter((item) => visible(data, item) && caseVisible(data, item.caseId) && !item.completedAt && (source === "all" || source === item.source)));
  return (
    <div className="nx-stage">
      <Watermark motif="civic" />
      <PageHead
        kicker="Moje sprawy"
        title="To, co jest w toku"
        lede="Sprawy aktualizują się na żywo po odpowiedziach na pisma, ukończonych ścieżkach i planach ułożonych w „W czym mogę pomóc?”."
      />
      <Field label="Źródło sprawy">{(field) => <select {...field} value={source} onChange={(e) => state.select(e.target.value === "all" ? undefined : e.target.value)}>
        <option value="all">Wszystkie</option><option value="nexus">Wzory NEXUS</option>
        {sources.map((data) => <option key={data.source} value={data.source}>{agencyNames[data.source]}</option>)}
      </select>}</Field>
      {agencyTasks.length > 0 && <section className="civic-stack"><h2>Zadania w OneFlow</h2><TaskRows tasks={agencyTasks} /></section>}
      <div className="nx-list">
        {agencyCases.map((item) => <Row key={item.id} glyph={civicGlyph[item.source]} title={item.title}
          meta={`${agencyNames[item.source]} · ${item.sourceStatus ?? "Brak informacji o rozstrzygnięciu"} · ${warsaw(item.updatedAt)}`}
          onClick={() => state.go("sprawa", item.id)} />)}
        {source !== "all" && source !== "nexus" && agencyCases.length === 0 && <p>Brak spraw z tego źródła w bieżącym kontekście.</p>}
        {(source === "all" || source === "nexus") && cases.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-row"
            onClick={() => state.go("sprawa", item.id)}
          >
            <span className={`nx-well ${item.isPlanCase ? "nx-tone-sky" : "nx-tone-amber"}`}>
              <Glyph name={item.isPlanCase ? "orbit" : "case"} />
            </span>
            <span className="nx-row-copy">
              <strong>{item.title}</strong>
              <small>
                {item.office} · {plDate(item.updated)}
                {item.receipts.length > 0 ? ` · ${item.receipts[0].code}` : ""}
              </small>
            </span>
            <Status tone={CASE_TONE[item.status]}>{item.status}</Status>
          </button>
        ))}
      </div>
      <div className="nx-actions">
        <button type="button" className="nx-btn" onClick={() => state.go("pisma")}>
          Przejdź do e-Doręczeń
        </button>
        <button type="button" className="nx-btn" onClick={() => state.go("os")}>
          Otwórz oś czasu
        </button>
      </div>
    </div>
  );
}

export function CaseDetail({ id }: { id: string }) {
  const state = useNexus();
  const item = selectCaseById(state, id);
  const note = state.caseNotes[id] ?? "";
  if (!item) return <Missing title="Nie ma takiej sprawy" onBack={state.back} />;

  const plan = item.planCase;

  return (
    <div className="nx-stage">
      <PageHead kicker={item.office} title={item.title} lede={item.summary} />
      <div className="nx-actions">
        <Status tone={CASE_TONE[item.status]}>{item.status}</Status>
        <span className="nx-fine">Aktualizacja: {plDate(item.updated)}</span>
      </div>

      {plan ? (
        <section className="nx-plan" aria-label="Zapisany plan działania">
          <div className="nx-sheet">
            <p className="nx-kicker">Dane z mDowodu użyte raz</p>
            <dl className="nx-dl">
              {plan.reusedData.map((entry) => (
                <div key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>
                    {entry.value} <span className="nx-fine">({entry.source})</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="nx-sheet">
            <p className="nx-kicker">Fakty z Twojego profilu wzoru</p>
            <ul className="nx-bullets">
              {(item.evaluatedFacts ?? plan.facts).map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <p className="nx-kicker">Interpretacje prototypu (nie są decyzją urzędu)</p>
            <ul className="nx-bullets">
              {plan.interpretations.map((noteText) => (
                <li key={noteText}>{noteText}</li>
              ))}
            </ul>
          </div>

          <div className="nx-stack">
            <p className="nx-kicker">
              Zadania w planie ({(item.evaluatedTasks ?? []).filter((t) => t.done).length} z{" "}
              {(item.evaluatedTasks ?? plan.tasks).length} ukończonych)
            </p>
            {(item.evaluatedTasks ?? []).map((task) => {
              const checked = task.done;
              return (
                <article
                  key={task.id}
                  className="nx-plan-task"
                  data-done={checked ? "true" : "false"}
                  data-blocked={task.isBlocked ? "true" : "false"}
                >
                  <div className="nx-plan-task-head">
                    <label className="nx-task-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={task.completedByService}
                        onChange={() => {
                          state.togglePlanTask(item.id, task.id);
                          state.showToast(
                            checked ? "Przywrócono zadanie na liście" : "Odhaczono zadanie w planie",
                          );
                        }}
                      />
                      <span>
                        <span className="nx-cat" data-cat={task.category}>
                          {task.category}
                        </span>{" "}
                        <strong>{task.title}</strong>
                      </span>
                    </label>
                    <Status
                      tone={
                        checked
                          ? "ok"
                          : task.isBlocked
                            ? "warn"
                            : task.status === "wymaga danych"
                              ? "warn"
                              : "info"
                      }
                    >
                      {task.completedByService
                        ? "zrealizowane w usłudze"
                        : checked
                          ? "odhaczone"
                          : task.isBlocked
                            ? "czeka na krok"
                            : task.status}
                    </Status>
                  </div>
                  <p>{task.purpose}</p>
                  <p className="nx-fine">
                    <strong>Dlaczego to zadanie:</strong> {task.whyShown}
                  </p>
                  {task.isBlocked ? (
                    <p className="nx-blocked-note">
                      Najpierw ukończ: {task.blockedByTitles.join("; ")}. Po ich wykonaniu ten krok
                      odblokuje się automatycznie.
                    </p>
                  ) : null}
                  <p className="nx-fine">Instytucja: {task.institution}</p>
                  {task.dependencies.length > 0 ? (
                    <p className="nx-fine">Zależności: {task.dependencies.join("; ")}</p>
                  ) : null}
                  {task.requiredData.length > 0 ? (
                    <p className="nx-fine">Potrzebne dane: {task.requiredData.join("; ")}</p>
                  ) : null}
                  {task.missingInfo.length > 0 ? (
                    <p className="nx-fine">Czego jeszcze brakuje: {task.missingInfo.join("; ")}</p>
                  ) : null}
                  <div className="nx-actions">
                    {task.targetView ? (
                      <button
                        type="button"
                        className={checked ? "nx-btn" : "nx-btn nx-btn-primary"}
                        onClick={() => state.go(task.targetView!, task.targetId)}
                      >
                        Przejdź do usługi
                      </button>
                    ) : null}
                    {task.officialUrl ? (
                      <a
                        className="nx-extlink"
                        href={task.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {task.officialLabel ?? "Oficjalny serwis"} (link zewnętrzny)
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <ol className="nx-steps">
          {item.steps.map((step) => (
            <li key={step.label} data-state={step.state}>
              {step.label}
            </li>
          ))}
        </ol>
      )}

      {item.dependencies && item.dependencies.length > 0 ? (
        <section className="nx-sheet">
          <p className="nx-kicker">Zależności i brakujące informacje</p>
          <ul className="nx-bullets">
            {item.dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.receipts.length > 0 ? (
        <section className="nx-stack" aria-label="Symulowane potwierdzenia">
          <p className="nx-kicker">Potwierdzenia zapisane w prototypie</p>
          {item.receipts.map((receipt) => (
            <article key={receipt.id} className="nx-receipt">
              <div className="nx-sectionhead">
                <strong>{receipt.code}</strong>
                <small>{formatEventTime(receipt.createdAt)}</small>
              </div>
              <p>{receipt.title}</p>
              <p className="nx-fine">{receipt.summary}</p>
              <p className="nx-fine">{receipt.note}</p>
            </article>
          ))}
        </section>
      ) : null}

      {item.journeyId ? (
        <div className="nx-actions">
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            onClick={() => state.go("zdarzenie", item.journeyId)}
          >
            Przejdź ścieżkę krok po kroku
          </button>
        </div>
      ) : null}

      {item.relatedLinks.length > 0 ? (
        <section aria-label="Powiązane elementy">
          <p className="nx-kicker">Powiązane pisma, dokumenty i usługi</p>
          <div className="nx-list">
            {item.relatedLinks.map((link) =>
              link.view ? (
                <Row
                  key={link.id}
                  glyph={link.glyph}
                  title={link.label}
                  meta={link.meta}
                  onClick={() => state.go(link.view!, link.selectedId)}
                />
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <label className="nx-field">
        <span>Twoja notatka</span>
        <textarea
          value={note}
          rows={4}
          onChange={(event) => state.setCaseNote(item.id, event.target.value)}
        />
      </label>
      <p className="nx-fine">Notatka zostaje przy sprawie na tym urządzeniu. Urząd jej nie widzi.</p>
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
        kicker="Ważne zmiany w życiu"
        title="Ważne sprawy krok po kroku"
        lede="Wybierz sytuację życiową. Każda prowadzi krok po kroku, sprawdza zależności i aktualizuje sprawę."
      />
      <div className="nx-list">
        {JOURNEYS.map((journey) => (
          <Row
            key={journey.id}
            glyph={journey.glyph}
            title={journey.title}
            meta={
              journeys[journey.id]?.done
                ? "Zapisane w prototypie — otwórz, aby zobaczyć podsumowanie"
                : journeys[journey.id]
                  ? `W toku: krok ${(journeys[journey.id]?.step ?? 0) + 1} z ${journey.steps.length}`
                  : journey.lede
            }
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
  const go = useNexus((s) => s.go);
  const progress = useNexus((s) => s.journeys[id]);
  const activePersona = useNexus((s) => s.activePersona);
  const setStep = useNexus((s) => s.setJourneyStep);
  const setChoice = useNexus((s) => s.setJourneyChoice);
  const finish = useNexus((s) => s.finishJourney);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);
  if (!journey) return <Missing title="Nie ma takiej ścieżki" onBack={back} />;
  const persona = getActivePersona(activePersona);
  const stepIndex = progress?.step ?? 0;
  const step = journey.steps[Math.min(stepIndex, journey.steps.length - 1)];
  const stepBody =
    journey.id === "start-krakow" && step.id === "dane-wspolne"
      ? `W prototypie ponownie wykorzystujemy fikcyjne dane ${persona.given} ${persona.family} (PESEL ${persona.pesel}, ${persona.city}), żeby nie wypełniać ich osobno na uczelni, u pracodawcy i w urzędzie miasta.`
      : step.body;
  const choice = progress?.choices[step.id];
  const last = stepIndex >= journey.steps.length - 1;
  const missingAnyRequired = journey.steps.some((s) => s.options && !progress?.choices[s.id]);
  const blocked = Boolean(step.options && !choice) || (last && missingAnyRequired);

  return (
    <div className="nx-stage">
      <Watermark motif={journey.motif} />
      <PageHead
        kicker={`Krok ${stepIndex + 1} z ${journey.steps.length} · ${journey.office}`}
        title={journey.title}
        lede={journey.lede}
      />
      <section className="nx-sheet">
        <h2>{step.title}</h2>
        <p>{stepBody}</p>
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
        {journey.dependencies && journey.dependencies.length > 0 && stepIndex === 0 ? (
          <p className="nx-fine">Wymagania tej ścieżki: {journey.dependencies.join("; ")}.</p>
        ) : null}
        {progress?.done ? (
          <div className="nx-receipt">
            <strong>Ścieżka zapisana w prototypie</strong>
            <p className="nx-fine">
              Zaktualizowano powiązaną sprawę i oś czasu. Żaden wniosek nie został wysłany do urzędu.
            </p>
            <button
              type="button"
              className="nx-btn"
              onClick={() => go("sprawa", journey.caseId)}
            >
              Otwórz powiązaną sprawę
            </button>
          </div>
        ) : null}
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
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            disabled={blocked}
            onClick={() => setAsk(true)}
          >
            {progress?.done ? "Zaktualizuj zapis w prototypie" : "Zapisz w prototypie"}
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
        title="Zapisać ten krok i zaktualizować sprawę?"
        body="Wybór zostaje w prototypie, pojawia się na osi czasu i w Moich sprawach. Nie rezerwujemy terminu i nie wysyłamy wniosku do urzędu."
        confirm="Zapisz w prototypie"
        onConfirm={() => {
          finish(journey.id);
          showToast("Ścieżka zapisana — zaktualizowano sprawę i oś czasu");
        }}
      />
    </div>
  );
}

export function Benefits() {
  const go = useNexus((s) => s.go);
  const setOrbit = useNexus((s) => s.setOrbit);
  const mealAsk = useNexus((s) => s.mealAsk);
  const mealSent = useNexus((s) => s.mealSent);
  const setMealAsk = useNexus((s) => s.setMealAsk);
  const sendMealAsk = useNexus((s) => s.sendMealAsk);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Możliwe wsparcie"
        title="Potencjalne świadczenia i ulgi"
        lede="Oddzielamy potwierdzone dane ze wzoru od świadczeń, które warto dopiero sprawdzić. Prototyp nie wydaje decyzji urzędowych."
      />
      <div className="nx-list">
        <Row glyph="institution" title="ZUS — ubezpieczenia i świadczenia" onClick={() => go("urzad", "zus/home")} />
        <Row glyph="support" title="Wsparcie PFRON" onClick={() => go("urzad", "pfron/home")} />
      </div>
      <div className="nx-stack">
        {BENEFITS.map((item, index) => (
          <article
            key={item.id}
            className="nx-benefit"
            data-wash={["mint", "sky", "peach", "amber"][index % 4]}
          >
            <div className="nx-sectionhead">
              <p className="nx-kicker">{item.state}</p>
              <Status tone={BENEFIT_TONE[item.state]}>{item.state}</Status>
            </div>
            <h2>{item.title}</h2>
            {item.amount ? <p className="nx-amount">{item.amount}</p> : null}
            <p>{item.detail}</p>
            {item.officialUrl ? (
              <a
                className="nx-extlink"
                href={item.officialUrl}
                target="_blank"
                rel="noreferrer"
              >
                {item.officialLabel ?? "Sprawdź w oficjalnym serwisie"} (link zewnętrzny)
              </a>
            ) : null}
          </article>
        ))}
      </div>

      <section className="nx-sheet">
        <p className="nx-kicker">Nowa sytuacja życiowa?</p>
        <h2>Połącz dokumenty, wsparcie i formalności w jeden plan</h2>
        <p>
          Jeśli zmieniasz miasto, zaczynasz studia albo podejmujesz pierwszą pracę, asystent „W czym mogę pomóc?” ułoży
          spójny plan działania bez zgadywania uprawnień.
        </p>
        <div className="nx-actions">
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            onClick={() =>
              setOrbit(
                true,
                "Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę. Co muszę załatwić?",
              )
            }
          >
            Otwórz „W czym mogę pomóc?”
          </button>
          <button type="button" className="nx-btn" onClick={() => go("zalatw")}>
            Zobacz „Ważne zmiany w życiu”
          </button>
        </div>
      </section>

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
        <h2>Pytanie o dofinansowanie obiadów (szkic lokalny)</h2>
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
          <p className="nx-note">Pytanie zapisane w prototypie i widoczne na osi czasu. Szkoła go nie dostała.</p>
        ) : (
          <button type="submit" className="nx-btn nx-btn-primary">
            Zapisz pytanie w prototypie
          </button>
        )}
      </form>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zapisać pytanie w prototypie?"
        body="Nie wyślemy go do szkoły. Zostanie zapisane tutaj i odnotowane na osi czasu."
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
  const state = useNexus();
  const sources = useCivicData();
  const schedule = useAgencySchedule();
  const items = [
    ...selectUnifiedTimeline(state),
    ...sources.flatMap((data) => visibleEvents(data).map((entry) => ({
      id: entry.id, sortAt: entry.at, dateLabel: warsaw(entry.at, true), title: entry.title,
      meta: agencyNames[entry.source], glyph: civicGlyph[entry.source], source: "event" as const,
      targetView: entry.target.kind === "case" ? "sprawa" as const : entry.target.kind === "document" ? "pismo" as const : "urzad" as const,
      targetId: entry.target.id, receiptCode: undefined,
    }))),
  ].sort((a, b) => Date.parse(b.sortAt) - Date.parse(a.sortAt));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("2026-12-04");
  const [editTime, setEditTime] = useState("09:00");

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Moja oś czasu"
        title="Jedna historia wszystkich spraw"
        lede="Od najnowszego. Odpowiedzi na pisma, przypomnienia z mojeIKP, zapisane ścieżki i historia ze wzoru — kliknij dowolny wpis, aby przejść dalej."
      />

      {schedule.length > 0 && <section className="civic-stack" aria-label="Wizyty i przypomnienia usług">
        <h2>Wizyty i przypomnienia usług</h2>
        <div className="nx-list">{schedule.map((item) => <Row key={item.id} glyph="calendar" title={item.label}
          meta={`${agencyNames[item.agency]} · ${warsaw(item.at, true)}`} onClick={() => state.go("urzad", item.targetId)} />)}</div>
      </section>}
      {state.reminders.length > 0 ? (
        <section className="nx-stack" aria-label="Twoje przypomnienia">
          <p className="nx-kicker">Aktywne przypomnienia ({state.reminders.length})</p>
          {state.reminders.map((rem) => {
            const isEditing = editingId === rem.id;
            return (
              <article key={rem.id} className="nx-benefit" data-wash="mint">
                <p className="nx-kicker">Twoje przypomnienie</p>
                <h2>{rem.title}</h2>
                <p>{rem.when}</p>
                {rem.note ? <p className="nx-fine">{rem.note}</p> : null}
                {isEditing ? (
                  <div className="nx-inline-form">
                    <label className="nx-field">
                      <span>Data</span>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </label>
                    <label className="nx-field">
                      <span>Godzina</span>
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                      />
                    </label>
                    <div className="nx-actions">
                      <button
                        type="button"
                        className="nx-btn nx-btn-primary"
                        onClick={() => {
                          state.updateReminder(rem.id, { isoDate: editDate, time: editTime });
                          setEditingId(null);
                          state.showToast("Zaktualizowano termin przypomnienia");
                        }}
                      >
                        Zapisz termin
                      </button>
                      <button
                        type="button"
                        className="nx-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="nx-actions">
                    <button
                      type="button"
                      className="nx-btn"
                      onClick={() => state.go(rem.targetView, rem.targetId)}
                    >
                      Otwórz usługę
                    </button>
                    <button
                      type="button"
                      className="nx-btn"
                      onClick={() => {
                        setEditDate(rem.isoDate ?? "2026-12-04");
                        setEditTime(rem.time ?? "09:00");
                        setEditingId(rem.id);
                      }}
                    >
                      Zmień termin
                    </button>
                    <button
                      type="button"
                      className="nx-btn"
                      onClick={() => {
                        state.removeReminder(rem.id);
                        state.showToast("Usunięto przypomnienie");
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <p className="nx-fine">
          Nie masz jeszcze własnych przypomnień. Możesz dodać przypomnienie o skierowaniu w hubie{" "}
          <button type="button" className="nx-textbtn" onClick={() => state.go("zdrowie", "skierowania")}>
            mojeIKP
          </button>
          .
        </p>
      )}

      <div className="nx-list" role="list" aria-label="Zdarzenia na osi czasu">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-row"
            onClick={() => state.go(item.targetView, item.targetId)}
          >
            <span
              className={`nx-well ${
                item.source === "reminder"
                  ? "nx-tone-mint"
                  : item.source === "event"
                    ? "nx-tone-sky"
                    : "nx-tone-amber"
              }`}
            >
              <Glyph name={item.glyph} />
            </span>
            <span className="nx-row-copy">
              <strong>{item.title}</strong>
              <small>
                {item.dateLabel} · {item.meta}
              </small>
            </span>
            {item.receiptCode ? <Status tone="ok">{item.receiptCode}</Status> : <Glyph name="forward" />}
          </button>
        ))}
      </div>
      <p className="nx-fine">
        Starsze wpisy ze wzoru są skrótem demonstracyjnym. Wszystkie zdarzenia zapisane w tej sesji pochodzą ze stanu lokalnego OneFlow.
      </p>
    </div>
  );
}

export function Security() {
  const state = useNexus();
  const [docId, setDocId] = useState(DOCUMENTS[0]?.id ?? "dowod");
  const [ask, setAsk] = useState(false);
  const [askPesel, setAskPesel] = useState(false);

  const securityReceipts = state.receipts.filter(
    (r) => r.actionKey === "pesel:lock" || r.actionKey.startsWith("doc:lost:"),
  );

  return (
    <div className="nx-stage">
      <PageHead
        kicker="Ochrona tożsamości"
        title="Ochrona tożsamości i pilne kroki"
        lede="Najpierw numery alarmowe. Potem symulacja zastrzeżenia PESEL, zgłoszenia utraty oraz linki do oficjalnych usług."
      />

      <article className="nx-benefit" data-wash={state.peselLocked ? "mint" : "amber"}>
        <p className="nx-kicker">Zastrzeż PESEL (symulacja)</p>
        <h2>
          {state.peselLocked
            ? "Numer PESEL jest zastrzeżony w tym prototypie"
            : "Numer PESEL nie jest zastrzeżony"}
        </h2>
        <p>
          Prawdziwe zastrzeżenie wykonasz w oficjalnym serwisie gov.pl lub w aplikacji mObywatel. Tutaj
          zmieniamy status lokalnie, dodajemy potwierdzenie UPO-WZÓR i wpis na osi czasu.
        </p>
        <div className="nx-actions">
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            disabled={state.peselLocked}
            onClick={() => setAskPesel(true)}
          >
            {state.peselLocked ? "Już zastrzeżony (wzór)" : "Zastrzeż PESEL (symulacja)"}
          </button>
          <a
            className="nx-extlink"
            href="https://www.gov.pl/web/gov/zastrzez-numer-pesel"
            target="_blank"
            rel="noreferrer"
          >
            gov.pl — Zastrzeż PESEL (link zewnętrzny)
          </a>
        </div>
      </article>

      <ConfirmDialog
        open={askPesel}
        onOpenChange={setAskPesel}
        title="Zastrzec PESEL w prototypie?"
        body="Status zmieni się na ekranie Start, w profilu, na Mojej osi czasu i w historii dostępu. Żadne dane nie trafiają poza tę przeglądarkę."
        confirm="Zastrzeż w prototypie"
        onConfirm={() => {
          state.lockPesel();
          state.showToast("PESEL zastrzeżony w prototypie (UPO-WZÓR)");
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
        <p className="nx-kicker">Lista kroków przy utracie portfela</p>
        <h2>W jakiej kolejności reagować</h2>
        <ol className="nx-steps">
          <li data-state={state.lost.includes("dowod") ? "done" : "now"}>
            Zgłoś utratę dowodu osobistego —{" "}
            <a
              className="nx-extlink"
              href="https://www.gov.pl/web/gov/zglos-utrate-lub-uszkodzenie-swojego-dowodu-osobistego-uniewaznij-dowod"
              target="_blank"
              rel="noreferrer"
            >
              gov.pl (link zewnętrzny)
            </a>
          </li>
          <li data-state={state.peselLocked ? "done" : "next"}>
            Zastrzeż numer PESEL —{" "}
            <a
              className="nx-extlink"
              href="https://www.gov.pl/web/gov/zastrzez-numer-pesel"
              target="_blank"
              rel="noreferrer"
            >
              gov.pl (link zewnętrzny)
            </a>
          </li>
          <li data-state="next">
            Zablokuj karty płatnicze w banku i sprawdź system{" "}
            <a
              className="nx-extlink"
              href="https://dokumentyzastrzezone.pl/"
              target="_blank"
              rel="noreferrer"
            >
              Dokumenty Zastrzeżone (link zewnętrzny)
            </a>
          </li>
        </ol>
      </section>

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
          if (state.lost.includes(docId)) {
            state.showToast("Ten wzór ma już zgłoszoną utratę");
            return;
          }
          setAsk(true);
        }}
      >
        <h2>Zgłoś utratę dokumentu (symulacja)</h2>
        <label className="nx-field">
          <span>Który dokument</span>
          <select value={docId} onChange={(event) => setDocId(event.target.value)}>
            {DOCUMENTS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
                {state.lost.includes(doc.id) ? " — utrata zgłoszona" : ""}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="nx-btn nx-btn-danger">
          Zgłoś utratę w prototypie
        </button>
      </form>

      {securityReceipts.length > 0 ? (
        <section className="nx-stack" aria-label="Potwierdzenia bezpieczeństwa">
          <p className="nx-kicker">Zapisane potwierdzenia (UPO-WZÓR)</p>
          {securityReceipts.map((r) => (
            <article key={r.id} className="nx-receipt">
              <div className="nx-sectionhead">
                <strong>{r.code}</strong>
                <small>{formatEventTime(r.createdAt)}</small>
              </div>
              <p>{r.title}</p>
              <p className="nx-fine">{r.summary}</p>
            </article>
          ))}
        </section>
      ) : null}

      <div className="nx-actions">
        <button type="button" className="nx-btn" onClick={() => state.go("zaufana")}>
          Osoba zaufana
        </button>
        <button type="button" className="nx-btn" onClick={() => state.go("dostepy")}>
          Dostęp do moich danych
        </button>
        <button type="button" className="nx-btn" onClick={() => state.go("os")}>
          Moja oś czasu
        </button>
      </div>

      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zgłosić utratę w prototypie?"
        body="Oznaczymy dokument jako utracony i wyłączymy jego lokalny podgląd. Prawdziwy urząd ani bank nie dostaną zgłoszenia."
        confirm="Zgłoś w prototypie"
        danger
        onConfirm={() => {
          state.reportLost(docId);
          state.showToast("Zgłoszono utratę dokumentu w prototypie");
        }}
      />
    </div>
  );
}

export function AccessLog() {
  const state = useNexus();
  const entries = selectAccessTransparencyLog(state);
  return (
    <div className="nx-stage">
      <PageHead
        kicker="Dostęp do moich danych"
        title="Dostęp do moich danych"
        lede="Rejestr przejrzystości: każdy wiersz pokazuje kto, kiedy i w jakim celu sięgał po dane. Wpisy lokalne powstają na żywo podczas Twoich działań w prototypie."
      />
      <div className="nx-stack">
        {entries.map((event) => (
          <article key={event.id} className="nx-benefit" data-wash={event.source === "local" ? "sky" : undefined}>
            <div className="nx-sectionhead">
              <p className="nx-kicker">{event.at}</p>
              <Status tone={event.source === "local" ? "info" : "ok"}>
                {event.source === "local" ? "zdarzenie lokalne" : "wpis ze wzoru"}
              </Status>
            </div>
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
      <PageHead
        kicker="Osoba zaufana"
        title={TRUSTED.name}
        lede={`${TRUSTED.relation} · ${TRUSTED.phone}`}
      />
      <p>{TRUSTED.note}</p>
      <p className="nx-note">
        {on
          ? "Upoważnienie w tym prototypie jest włączone (odnotowano na Mojej osi czasu i w rejestrze dostępu)."
          : "Upoważnienie w prototypie jest wyłączone."}
      </p>
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
        title={next ? "Włączyć upoważnienie w prototypie?" : "Wyłączyć upoważnienie w prototypie?"}
        body={
          next
            ? "Marek będzie mógł w tym wzorze odebrać pismo. Nie nadaje to formalnego pełnomocnictwa w mojeIKP ani w prawdziwych urzędach."
            : "Odbieranie pism w prototypie wraca tylko do ciebie. Zmiana zostaje na urządzeniu."
        }
        confirm={next ? "Włącz" : "Wyłącz"}
        onConfirm={() => {
          setTrusted(next);
          showToast(next ? "Upoważnienie włączone w prototypie" : "Upoważnienie wyłączone");
        }}
      />
    </div>
  );
}

const MODES: { id: HomeMode; label: string }[] = [
  { id: "simple", label: "Prosto i wygodnie — duże przyciski" },
  { id: "daily", label: "Na co dzień" },
  { id: "dense", label: "Wszystko pod ręką" },
];

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "porcelain", label: "Porcelana — jasny" },
  { id: "midnight", label: "Północ — ciemny" },
  { id: "contrast", label: "Kontrast — czarno-biały" },
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
        kicker="Wygląd i wielkość liter"
        title="Wygodny wygląd i większe litery"
        lede="Wybierz jasny, ciemny albo kontrastowy wygląd, większe litery i prostszy ekran startowy. Ustawienia zostają na tym urządzeniu."
      />
      <fieldset className="nx-scale">
        <legend>Motyw</legend>
        {THEMES.map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="theme"
              checked={theme === item.id}
              onChange={() => setTheme(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Ekran startowy</legend>
        {MODES.map((item) => (
          <label key={item.id}>
            <input
              type="radio"
              name="mode"
              checked={mode === item.id}
              onChange={() => setMode(item.id)}
            />
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
          <input
            type="radio"
            name="motion"
            checked={motion === "system"}
            onChange={() => setMotion("system")}
          />
          <span>Jak w urządzeniu</span>
        </label>
        <label>
          <input
            type="radio"
            name="motion"
            checked={motion === "reduce"}
            onChange={() => setMotion("reduce")}
          />
          <span>Ogranicz ruch</span>
        </label>
      </fieldset>
      <fieldset className="nx-scale">
        <legend>Ważne dni</legend>
        <p className="nx-fine">
          11 listopada i 15 sierpnia dostają cienką linię. 3 maja lekko podnosi ślad rękopisu. Zwykłego
          dnia nic się nie zmienia.
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
            <input
              type="radio"
              name="day"
              checked={dayMode === id}
              onChange={() => setDayMode(id)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <p className="nx-fine">
        Wyszukiwarka i asystent „W czym mogę pomóc?”: Ctrl+K albo klawisz /. Niezależny prototyp konkursowy — nie
        jest aplikacją administracji publicznej.
      </p>
      <button type="button" className="nx-btn nx-btn-danger" onClick={() => setAsk(true)}>
        Przywróć prototyp
      </button>
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Wyczyścić zapisany stan?"
        body="Znikną szkice, odpowiedzi, zapisane plany, przypomnienia, udostępnienia i wybór układu. Dane wzoru zostaną."
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
