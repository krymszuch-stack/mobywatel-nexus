import { useState } from "react";
import { activeCivicTasks, useCivicData } from "@/lib/nexus/civic/select";
import { TaskRows } from "./civic/ui";
import { LETTERS } from "@/lib/nexus/data";
import { getActivePersona } from "@/lib/nexus/demo-stories";
import { greeting, longDate } from "@/lib/nexus/format";
import {
  selectContextualNotifications,
  selectDerivedCases,
  selectHomePriority,
} from "@/lib/nexus/oneflow";
import { SERVICES } from "@/lib/nexus/registry";
import { useNexus } from "@/lib/nexus/store";
import type { ViewId } from "@/lib/nexus/types";
import { DemoLauncher } from "./demo-dock";
import { Glyph } from "./glyph";
import { letterPhase, openLetterCount } from "./letters-state";

const QUICK = SERVICES.filter((item) => item.home);
const SIMPLE = SERVICES.filter((item) => item.simple);

export function Home() {
  const state = useNexus();
  const { mode, go, setOrbit, readIds, replies, peselLocked, reminders } = state;

  const waiting = LETTERS.filter((letter) => letterPhase(letter, readIds, replies) === "wymaga odpowiedzi");
  const priority = selectHomePriority(state);
  const derivedCases = selectDerivedCases(state);
  const activeCases = derivedCases.filter((item) => item.status !== "zakończona");
  const notifications = selectContextualNotifications(state).filter(
    (item) => item.id !== "notif-letters" && !item.id.startsWith("notif-rem-"),
  );

  const civicTasks = useCivicData().flatMap(activeCivicTasks);
  const persona = getActivePersona(state.activePersona);

  return (
    <div className="nx-stage">
      <header className="nx-hello">
        <h1>
          {greeting()}, {persona.vocative}
        </h1>
        <p>
          {longDate()}
          {persona.id !== "default" ? ` · ${persona.roleLabel}` : ""}
        </p>
      </header>

      {mode !== "simple" ? (
        <button type="button" className="nx-mdowod" onClick={() => go("dokument", "dowod")}>
          <Glyph name="identity" />
          <span>
            <strong>mDowód</strong>
            <small>Pokaż dokument</small>
          </span>
          <Glyph name="forward" />
        </button>
      ) : null}

      {priority ? (
        <button
          type="button"
          className="nx-priority"
          onClick={() => go(priority.targetView, priority.targetId)}
        >
          <span className="nx-kicker">{priority.kicker}</span>
          <strong>{priority.title}</strong>
          <small>{priority.meta}</small>
        </button>
      ) : mode === "daily" ? (
        <button type="button" className="nx-quietcard" onClick={() => go("sprawy")}>
          <span className="nx-kicker">Skrzynka i sprawy</span>
          <strong>Brak pilnych pism wymagających odpowiedzi</strong>
          <small>Wszystkie pisma wymagające działania zostały obsłużone w tym prototypie.</small>
        </button>
      ) : null}

      {notifications.length > 0 ? (
        <div className="nx-list">
          {notifications.slice(0, 2).map((item) => (
            <button
              key={item.id}
              type="button"
              className="nx-row"
              onClick={() => go(item.targetView, item.targetId)}
            >
              <Glyph name={item.glyph} />
              <span className="nx-row-copy">
                <strong>{item.title}</strong>
                <small>
                  {item.kicker} · {item.meta}
                </small>
              </span>
              <Glyph name="forward" className="nx-row-go" />
            </button>
          ))}
        </div>
      ) : null}

      <button type="button" className="nx-searchpill" onClick={() => setOrbit(true)}>
        <Glyph name="orbit" />
        <span>
          {mode === "simple"
            ? "W czym mogę pomóc? Opisz swoją sprawę"
            : "W czym mogę pomóc? Co chcesz załatwić?"}
        </span>
      </button>

      {mode === "simple" ? <Simple go={go} count={openLetterCount(readIds, replies)} /> : null}
      {mode === "daily" ? (
        <Daily go={go} peselLocked={peselLocked} activeCases={activeCases} />
      ) : null}
      {mode === "dense" ? (
        <Dense go={go} waiting={waiting.length} activeCases={activeCases} />
      ) : null}

      {civicTasks.length > 0 && <section className="civic-stack">
        <h2>Zadania w usługach</h2>
        <TaskRows tasks={civicTasks.slice(0, mode === "simple" ? 1 : 3)} />
        <button className="nx-btn" type="button" onClick={() => go("sprawy")}>Wszystkie zadania i sprawy</button>
      </section>}
      {reminders.length > 0 ? (
        <section>
          <p className="nx-kicker nx-section">Przypomnienia</p>
          <div className="nx-list">
            {reminders.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nx-row"
                onClick={() => go(item.targetView, item.targetId)}
              >
                <Glyph name={item.serviceId === "ikp" ? "health" : "calendar"} />
                <span className="nx-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.when}</small>
                </span>
                <Glyph name="forward" className="nx-row-go" />
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <DemoLauncher />
    </div>
  );
}

function Simple({ go, count }: { go: (view: ViewId, id?: string) => void; count: number }) {
  const [open, setOpen] = useState(false);
  const simpleIds = new Set(SIMPLE.map((item) => item.id));
  const extraServices = QUICK.filter((item) => !simpleIds.has(item.id));
  return (
    <>
      <div className="nx-list">
        {SIMPLE.map((item) => {
          const title =
            item.id === "mdowod"
              ? "Pokaż mój dowód"
              : item.id === "ikp"
                ? "Zdrowie i lekarz (mojeIKP)"
                : item.id === "doreczenia"
                  ? "Pisma z urzędów"
                  : item.id === "wsparcie"
                    ? "Emerytura i wsparcie"
                    : item.name;
          const subtitle =
            item.id === "mdowod"
              ? "mDowód — dokument tożsamości"
              : item.id === "doreczenia"
                ? count
                  ? `e-Doręczenia · ${count} wymagają uwagi`
                  : "e-Doręczenia · skrzynka jest spokojna"
                : item.description;
          return (
            <button
              key={item.id}
              type="button"
              className="nx-big"
              onClick={() => go(item.view, item.selectedId)}
            >
              <Glyph name={item.glyph} />
              <span>
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="nx-morebar"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "Zwiń pozostałe usługi" : "Więcej usług"}
        <Glyph name="expand" />
      </button>
      {open ? <TileGrid go={go} items={extraServices} /> : null}
    </>
  );
}

function Daily({
  go,
  peselLocked,
  activeCases,
}: {
  go: (view: ViewId, id?: string) => void;
  peselLocked: boolean;
  activeCases: ReturnType<typeof selectDerivedCases>;
}) {
  return (
    <>
      <div className="nx-sectionhead">
        <p className="nx-kicker">Szybkie usługi</p>
        <button type="button" className="nx-textbtn" onClick={() => go("uslugi")}>
          Zobacz wszystkie
        </button>
      </div>
      <TileGrid
        go={go}
        items={QUICK}
        note={peselLocked ? "PESEL zastrzeżony w tym prototypie" : undefined}
      />
      <button type="button" className="nx-morebar" onClick={() => go("uslugi")}>
        Więcej usług
        <Glyph name="forward" />
      </button>
      <div className="nx-sectionhead nx-section">
        <p className="nx-kicker">Moje sprawy w toku</p>
        <button type="button" className="nx-textbtn" onClick={() => go("sprawy")}>
          Wszystkie sprawy
        </button>
      </div>
      <div className="nx-list">
        {activeCases.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-row"
            onClick={() => go("sprawa", item.id)}
          >
            <span className="nx-row-copy">
              <strong>{item.title}</strong>
              <small>
                {item.office} · {item.status}
              </small>
            </span>
            <Glyph name="forward" className="nx-row-go" />
          </button>
        ))}
      </div>
      <button type="button" className="nx-quietcard" onClick={() => go("wsparcie")}>
        <span className="nx-kicker">Możliwe wsparcie</span>
        <strong>Sprawdź, czy przysługuje Ci wsparcie</strong>
        <small>Świadczenie 800 zł (wzór wypłaty 15 grudnia) oraz programy do samodzielnego sprawdzenia.</small>
      </button>
    </>
  );
}

function Dense({
  go,
  waiting,
  activeCases,
}: {
  go: (view: ViewId, id?: string) => void;
  waiting: number;
  activeCases: ReturnType<typeof selectDerivedCases>;
}) {
  return (
    <>
      <p className="nx-fine">
        {waiting === 0
          ? "Brak pism wymagających pilnej odpowiedzi."
          : `${waiting} ${waiting === 1 ? "pismo wymaga działania" : "pisma wymagają działania"}.`}{" "}
        Aktywne sprawy: {activeCases.length}.
      </p>
      <TileGrid go={go} items={QUICK} />
      <p className="nx-kicker nx-section">Sprawy i korespondencja</p>
      <div className="nx-list">
        {activeCases.slice(0, 3).map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-row"
            onClick={() => go("sprawa", item.id)}
          >
            <span className="nx-row-copy">
              <strong>{item.title}</strong>
              <small>
                {item.office} · {item.status}
              </small>
            </span>
            <Glyph name="forward" className="nx-row-go" />
          </button>
        ))}
        {LETTERS.slice(0, 3).map((letter) => (
          <button
            key={letter.id}
            type="button"
            className="nx-row"
            onClick={() => go("pismo", letter.id)}
          >
            <span className="nx-row-copy">
              <strong>{letter.subject}</strong>
              <small>{letter.from}</small>
            </span>
            <Glyph name="forward" className="nx-row-go" />
          </button>
        ))}
      </div>
    </>
  );
}

function TileGrid({
  go,
  items,
  note,
}: {
  go: (view: ViewId, id?: string) => void;
  items: typeof QUICK;
  note?: string;
}) {
  return (
    <div className="nx-tiles">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nx-tile"
          onClick={() => go(item.view, item.selectedId)}
        >
          <Glyph name={item.glyph} />
          <strong>{item.name}</strong>
          <small>{item.id === "pesel" && note ? note : item.description}</small>
        </button>
      ))}
    </div>
  );
}
