import * as Dialog from "@radix-ui/react-dialog";
import { useRef } from "react";
import { LETTERS } from "@/lib/nexus/data";
import { analyzeOrbitQuery } from "@/lib/nexus/orbit-match";
import { useNexus } from "@/lib/nexus/store";
import type { ViewId } from "@/lib/nexus/types";
import { Glyph, type GlyphName } from "./glyph";
import { Mark } from "./heritage";
import { openLetterCount } from "./letters-state";
import { Status } from "./ui";

const TABS: { id: ViewId | "szukaj"; label: string; glyph: GlyphName }[] = [
  { id: "start", label: "Start", glyph: "start" },
  { id: "dokumenty", label: "Dokumenty", glyph: "documents" },
  { id: "szukaj", label: "Pomoc", glyph: "orbit" },
  { id: "uslugi", label: "Usługi", glyph: "more" },
  { id: "profil", label: "Profil", glyph: "profile" },
];

const SIDE: { id: ViewId; label: string; glyph: GlyphName; group: string }[] = [
  { id: "start", label: "Start", glyph: "start", group: "Na co dzień" },
  { id: "dokumenty", label: "Dokumenty", glyph: "documents", group: "Na co dzień" },
  { id: "pisma", label: "Moje pisma", glyph: "letter", group: "Na co dzień" },
  { id: "sprawy", label: "Moje sprawy", glyph: "case", group: "Na co dzień" },
  { id: "uslugi", label: "Wszystkie usługi", glyph: "more", group: "Na co dzień" },
  { id: "zdrowie", label: "Zdrowie (mojeIKP)", glyph: "health", group: "Zdrowie i kierowca" },
  { id: "kierowca", label: "Kierowca i pojazdy", glyph: "vehicle", group: "Zdrowie i kierowca" },
  { id: "zalatw", label: "Ważne zmiany w życiu", glyph: "signpost", group: "Życie i wsparcie" },
  { id: "wsparcie", label: "Możliwe wsparcie", glyph: "support", group: "Życie i wsparcie" },
  { id: "os", label: "Moja oś czasu", glyph: "timeline", group: "Życie i wsparcie" },
  { id: "profil", label: "Mój profil", glyph: "profile", group: "Konto i bezpieczeństwo" },
  { id: "bezpieczenstwo", label: "Ochrona tożsamości", glyph: "shield", group: "Konto i bezpieczeństwo" },
  { id: "dostepy", label: "Dostęp do moich danych", glyph: "eye", group: "Konto i bezpieczeństwo" },
  { id: "zaufana", label: "Osoba zaufana", glyph: "trusted", group: "Konto i bezpieczeństwo" },
  { id: "wyglad", label: "Wygląd i wielkość liter", glyph: "sliders", group: "Konto i bezpieczeństwo" },
];

const ORBIT_PROMPTS = [
  {
    label: "1. Studia + przeprowadzka + praca",
    query: "Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę. Co muszę załatwić?",
  },
  {
    label: "2. Senior: skierowanie + pismo + syn",
    query: "Mam skierowanie do kardiologa, dostałam ważne pismo urzędowe i chcę, żeby syn mógł mi pomagać w sprawach",
  },
  {
    label: "3. Pismo KR/2026/4412 + pojazd",
    query: "Wyjaśnij pismo KR/2026/4412 i powiedz, co muszę zrobić z dowodem rejestracyjnym",
  },
  {
    label: "4. Zgubiłam portfel i dowód",
    query: "Zgubiłam portfel z dowodem osobistym i kartami. Co robić po kolei?",
  },
];

export function SideNav() {
  const view = useNexus((s) => s.view);
  const tab = useNexus((s) => s.tab);
  const readIds = useNexus((s) => s.readIds);
  const replies = useNexus((s) => s.replies);
  const count = openLetterCount(readIds, replies);
  let lastGroup = "";
  return (
    <aside className="nx-side">
      <div className="nx-side-brand">
        <Mark />
        <span className="nx-side-brand-copy">
          <strong>mObywatel</strong>
          <small>NEXUS</small>
        </span>
      </div>
      <nav aria-label="Główne">
        {SIDE.map((item) => {
          const head = item.group !== lastGroup;
          lastGroup = item.group;
          const current =
            view === item.id ||
            (item.id === "pisma" && view === "pismo") ||
            (item.id === "dokumenty" && view === "dokument") ||
            (item.id === "sprawy" && view === "sprawa") ||
            (item.id === "zalatw" && view === "zdarzenie");
          return (
            <div key={item.id}>
              {head ? <p className="nx-kicker nx-side-kicker">{item.group}</p> : null}
              <button
                type="button"
                className="nx-sidebtn"
                aria-current={current ? "page" : undefined}
                onClick={() => tab(item.id)}
              >
                <Glyph name={item.glyph} selected={current} />
                <span>{item.label}</span>
                {item.id === "pisma" && count > 0 ? <em>{count}</em> : null}
              </button>
            </div>
          );
        })}
      </nav>
      <p className="nx-fine nx-side-note">
        Niezależny prototyp konkursowy. Nie jest aplikacją administracji publicznej.
      </p>
    </aside>
  );
}

export function TopBar() {
  const stack = useNexus((s) => s.stack);
  const back = useNexus((s) => s.back);
  const setOrbit = useNexus((s) => s.setOrbit);
  return (
    <header className="nx-top">
      {stack.length > 0 ? (
        <button type="button" className="nx-iconbtn" onClick={back}>
          <Glyph name="back" />
          <span className="nx-sr">Wróć</span>
        </button>
      ) : (
        <Mark />
      )}
      <p className="nx-brand">
        <strong>mObywatel</strong>
        <small>NEXUS</small>
      </p>
      <span className="nx-specimen">WZÓR</span>
      <button
        type="button"
        className="nx-iconbtn"
        aria-haspopup="dialog"
        onClick={() => setOrbit(true)}
      >
        <Glyph name="orbit" />
        <span className="nx-sr">W czym mogę pomóc?</span>
      </button>
    </header>
  );
}

export function TabBar() {
  const view = useNexus((s) => s.view);
  const orbit = useNexus((s) => s.orbit);
  const tab = useNexus((s) => s.tab);
  const setOrbit = useNexus((s) => s.setOrbit);
  const profileViews = new Set<ViewId>(["profil", "wyglad", "bezpieczenstwo", "dostepy", "zaufana"]);
  return (
    <nav className="nx-tabbar" aria-label="Dół ekranu">
      {TABS.map((item) => {
        const current =
          item.id === "szukaj"
            ? orbit
            : item.id === "profil"
              ? profileViews.has(view)
              : item.id === "uslugi"
                ? view === "uslugi" ||
                  view === "zdrowie" ||
                  view === "kierowca" ||
                  view === "zalatw" ||
                  view === "zdarzenie"
                : item.id === "dokumenty"
                  ? view === "dokumenty" || view === "dokument"
                  : view === "start";
        return (
          <button
            key={item.id}
            type="button"
            className="nx-navbtn"
            aria-current={current ? "page" : undefined}
            onClick={() => {
              if (item.id === "szukaj") setOrbit(true);
              else tab(item.id);
            }}
          >
            <Glyph name={item.glyph} selected={current} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MoreSheet() {
  const open = useNexus((s) => s.more);
  const setMore = useNexus((s) => s.setMore);
  const tab = useNexus((s) => s.tab);
  const items = SIDE.filter((item) => item.group !== "Na co dzień");
  return (
    <Dialog.Root open={open} onOpenChange={setMore}>
      <Dialog.Portal>
        <Dialog.Overlay className="nx-overlay" />
        <Dialog.Content className="nx-dialog" aria-describedby="nx-more-desc">
          <span className="nx-grab" aria-hidden="true" />
          <Dialog.Title className="nx-dialog-title">Więcej</Dialog.Title>
          <Dialog.Description id="nx-more-desc" className="nx-sr">
            Pozostałe miejsca w prototypie
          </Dialog.Description>
          <div className="nx-list">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nx-row"
                onClick={() => tab(item.id)}
              >
                <Glyph name={item.glyph} />
                <span className="nx-row-copy">
                  <strong>{item.label}</strong>
                </span>
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Orbit() {
  const state = useNexus();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = state.orbitDraft;
  const analysis = analyzeOrbitQuery(query, state);
  const plan = analysis.actionPlan;
  const explainedLetter = analysis.letterExplanation;

  return (
    <Dialog.Root open={state.orbit} onOpenChange={(next) => state.setOrbit(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="nx-overlay" />
        <Dialog.Content
          className="nx-orbit"
          aria-describedby="nx-orbit-desc"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="nx-sectionhead">
            <p className="nx-kicker">W czym mogę pomóc? · OneFlow</p>
            <button
              type="button"
              className="nx-iconbtn"
              onClick={() => state.setOrbit(false)}
              aria-label="Zamknij okno W czym mogę pomóc?"
            >
              <Glyph name="close" />
            </button>
          </div>
          <Dialog.Title className="nx-dialog-title">Co chcesz załatwić?</Dialog.Title>
          <Dialog.Description id="nx-orbit-desc" className="nx-fine">
            Opisz swoją sytuację po polsku. Działa lokalnie na urządzeniu — łączy usługi, wykrywa brakujące dane i układa wspólny plan działania.
          </Dialog.Description>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (plan) {
                const caseId = state.saveActionPlan(plan);
                state.showToast("Plan działania zapisany w Moich sprawach");
                state.go("sprawa", caseId);
                return;
              }
              const first = analysis.results[0];
              if (!first) return;
              state.go(first.view, first.selectedId);
            }}
          >
            <label className="nx-sr" htmlFor="nx-orbit-q">
              Opisz sytuację życiową, pytanie albo szukaną usługę
            </label>
            <input
              id="nx-orbit-q"
              ref={inputRef}
              value={query}
              onChange={(event) => state.setOrbitDraft(event.target.value)}
              placeholder="Np. Zaczynam studia, przeprowadzam się do Krakowa i podejmuję pierwszą pracę..."
              autoComplete="off"
            />
          </form>

          <div className="nx-chips" aria-label="Przykładowe pytania">
            {ORBIT_PROMPTS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="nx-chip"
                onClick={() => state.setOrbitDraft(chip.query)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {plan ? (
            <section className="nx-plan" aria-label="Zjednoczony plan działania">
              <div className="nx-sheet">
                <div className="nx-sectionhead">
                  <p className="nx-kicker">
                    {plan.intents.length === 1
                      ? "Plan skoordynowany (1 obszar)"
                      : `Plan wielowątkowy (${plan.intents.length} wątki)`}
                  </p>
                  <Status tone="info">{plan.tasks.length} zadań</Status>
                </div>
                <h2>{plan.title}</h2>
                <p>{plan.summary}</p>
                <div className="nx-actions">
                  <button
                    type="button"
                    className="nx-btn nx-btn-primary"
                    onClick={() => {
                      const caseId = state.saveActionPlan(plan);
                      state.showToast("Plan zapisany w Moich sprawach — możesz odhaczać zadania");
                      state.go("sprawa", caseId);
                    }}
                  >
                    Zapisz plan jako sprawę i kontynuuj później
                  </button>
                </div>

                <p className="nx-kicker">Fakty (dane z mDowodu i zapytania)</p>
                <ul className="nx-bullets">
                  {plan.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>

                <p className="nx-kicker">Interpretacje prototypu (nie zastępują decyzji urzędu)</p>
                <ul className="nx-bullets">
                  {plan.interpretations.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <p className="nx-kicker">Zdeduplikowane wymagania (podajesz raz)</p>
                <ul className="nx-bullets">
                  {plan.deduplicatedRequirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>

                {plan.missingInfo.length > 0 ? (
                  <>
                    <p className="nx-kicker">Wykryte brakujące informacje</p>
                    <ul className="nx-bullets">
                      {plan.missingInfo.map((miss) => (
                        <li key={miss}>{miss}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <div className="nx-stack">
                {plan.tasks.map((task) => {
                  const blockerNames = (task.blockedByTaskIds ?? [])
                    .map((depId) => plan.tasks.find((t) => t.id === depId)?.title)
                    .filter((t): t is string => Boolean(t));
                  return (
                    <article key={task.id} className="nx-plan-task">
                      <div className="nx-plan-task-head">
                        <span>
                          <span className="nx-cat" data-cat={task.category}>
                            {task.category}
                          </span>{" "}
                          <strong>{task.title}</strong>
                        </span>
                        <Status
                          tone={
                            task.status === "gotowe"
                              ? "ok"
                              : task.status === "wymaga danych"
                                ? "warn"
                                : "info"
                          }
                        >
                          {task.status}
                        </Status>
                      </div>
                      <p>{task.purpose}</p>
                      <p className="nx-fine">
                        <strong>Dlaczego to zadanie:</strong> {task.whyShown}
                      </p>
                      {blockerNames.length > 0 ? (
                        <p className="nx-blocked-note">
                          Zależy od wcześniejszego kroku: {blockerNames.join("; ")}.
                        </p>
                      ) : null}
                      <p className="nx-fine">Instytucja: {task.institution}</p>
                      {task.dependencies.length > 0 ? (
                        <p className="nx-fine">Zależności: {task.dependencies.join("; ")}</p>
                      ) : null}
                      {task.requiredData.length > 0 ? (
                        <p className="nx-fine">Wymagane dane: {task.requiredData.join("; ")}</p>
                      ) : null}
                      {task.missingInfo.length > 0 ? (
                        <p className="nx-fine">Brakuje: {task.missingInfo.join("; ")}</p>
                      ) : null}
                      <div className="nx-actions">
                        {task.targetView ? (
                          <button
                            type="button"
                            className="nx-btn"
                            onClick={() => state.go(task.targetView!, task.targetId)}
                          >
                            Przejdź w aplikacji
                          </button>
                        ) : null}
                        {task.officialUrl ? (
                          <a
                            className="nx-extlink"
                            href={task.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {task.officialLabel ?? "Oficjalne źródło"} (link zewnętrzny)
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {explainedLetter ? (
            <section className="nx-sheet" aria-label="Wyjaśnij mi to prościej">
              <p className="nx-kicker">Wyjaśnij mi to prościej · {explainedLetter.reference}</p>
              <h2>{explainedLetter.subject}</h2>
              <p>{explainedLetter.plain.whatItMeans}</p>
              <blockquote className="nx-quote">{explainedLetter.plain.sourceExcerpt}</blockquote>
              {explainedLetter.plain.ambiguities.length > 0 ? (
                <p className="nx-fine">
                  Na co uważać: {explainedLetter.plain.ambiguities.join(" ")}
                </p>
              ) : null}
              <div className="nx-actions">
                <button
                  type="button"
                  className="nx-btn nx-btn-primary"
                  onClick={() => state.go("pismo", explainedLetter.id)}
                >
                  Otwórz pełne pismo i odpowiedz
                </button>
              </div>
            </section>
          ) : null}

          {!query.trim() && analysis.nextActions.length > 0 ? (
            <section aria-label="Sugerowane następne kroki">
              <p className="nx-kicker">Najbliższe kroki w Twoich sprawach</p>
              <div className="nx-list">
                {analysis.nextActions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    className="nx-row"
                    onClick={() => state.go(act.view, act.selectedId)}
                  >
                    <Glyph name={act.glyph} />
                    <span className="nx-row-copy">
                      <strong>{act.label}</strong>
                      <small>{act.meta}</small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-label="Pasujące usługi, dokumenty i sprawy">
            <p className="nx-kicker">
              {query.trim() ? "Powiązane usługi, dokumenty i sprawy" : "Szybki dostęp"}
            </p>
            <div className="nx-list">
              {analysis.results.length === 0 ? (
                <p className="nx-fine">
                  Nic nie pasuje. Opisz sytuację własnymi słowami albo spróbuj „studia”, „pismo”, „skierowanie”, „PESEL”.
                </p>
              ) : null}
              {analysis.results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="nx-row"
                  onClick={() => state.go(item.view, item.selectedId)}
                >
                  <Glyph name={item.glyph} />
                  <span className="nx-row-copy">
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <p className="nx-fine">
            Skrót: Ctrl+K lub /. Pism w skrzynce: {LETTERS.length}. Działa w 100% offline bez zewnętrznych API.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Toast() {
  const toast = useNexus((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="nx-toast" role="status">
      <Glyph name="check" />
      <p>{toast}</p>
    </div>
  );
}
