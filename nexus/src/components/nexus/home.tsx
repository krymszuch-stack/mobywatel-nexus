import { useState } from "react";
import { CASES, CITIZEN, LETTERS } from "@/lib/nexus/data";
import { greeting, longDate } from "@/lib/nexus/format";
import { SERVICES } from "@/lib/nexus/registry";
import { useNexus } from "@/lib/nexus/store";
import type { ViewId } from "@/lib/nexus/types";
import { Glyph } from "./glyph";
import { Watermark } from "./heritage";
import { letterPhase, openLetterCount } from "./letters-state";

const QUICK = SERVICES.filter((item) => item.home);
const SIMPLE = SERVICES.filter((item) => item.simple);

export function Home() {
  const mode = useNexus((s) => s.mode);
  const go = useNexus((s) => s.go);
  const setOrbit = useNexus((s) => s.setOrbit);
  const readIds = useNexus((s) => s.readIds);
  const replies = useNexus((s) => s.replies);
  const peselLocked = useNexus((s) => s.peselLocked);
  const reminders = useNexus((s) => s.reminders ?? []);
  const waiting = LETTERS.filter((letter) => {
    const phase = letterPhase(letter, readIds, replies);
    return phase === "wymaga odpowiedzi";
  });
  const lead = waiting[0] ?? LETTERS.find((letter) => letter.needsReply);

  return (
    <div className="nx-stage">
      <Watermark motif="orbits" />
      <header className="nx-hello">
        <h1>
          {greeting()}, {CITIZEN.vocative}
        </h1>
        <p>{longDate()}</p>
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

      {lead && mode === "daily" ? (
        <button type="button" className="nx-priority" onClick={() => go("pismo", lead.id)}>
          <span className="nx-kicker">Masz sprawę do załatwienia</span>
          <strong>{lead.subject}</strong>
          <small>
            {lead.from}
            {lead.id === "komunikacja" ? " · do 18 grudnia" : ""}
          </small>
        </button>
      ) : null}

      <button type="button" className="nx-searchpill" onClick={() => setOrbit(true)}>
        <Glyph name="orbit" />
        <span>{mode === "simple" ? "Pomóż mi" : "Załatw sprawę, znajdź usługę…"}</span>
      </button>

      {mode === "simple" ? <Simple go={go} count={openLetterCount(readIds, replies)} /> : null}
      {mode === "daily" ? <Daily go={go} peselLocked={peselLocked} /> : null}
      {mode === "dense" ? <Dense go={go} waiting={waiting.length} /> : null}

      {reminders.length > 0 ? (
        <section>
          <p className="nx-kicker nx-section">Przypomnienia</p>
          <div className="nx-list">
            {reminders.map((item) => (
              <button key={item.id} type="button" className="nx-row" onClick={() => go("os")}>
                <Glyph name="calendar" />
                <span className="nx-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.when}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Simple({ go, count }: { go: (view: ViewId, id?: string) => void; count: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="nx-list">
        {SIMPLE.map((item) => (
          <button key={item.id} type="button" className="nx-big" onClick={() => go(item.view, item.selectedId)}>
            <Glyph name={item.glyph} />
            <span>
              <strong>{item.id === "mdowod" ? "Pokaż mój dowód" : item.name}</strong>
              <small>
                {item.id === "doreczenia" ? (count ? `${count} wymagają uwagi` : "Skrzynka jest spokojna") : item.description}
              </small>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="nx-morebar" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Zwiń usługi" : "Więcej usług"}
        <Glyph name="expand" />
      </button>
      {open ? <TileGrid go={go} items={QUICK} /> : null}
    </>
  );
}

function Daily({ go, peselLocked }: { go: (view: ViewId, id?: string) => void; peselLocked: boolean }) {
  return (
    <>
      <div className="nx-sectionhead">
        <p className="nx-kicker">Szybkie usługi</p>
        <button type="button" className="nx-textbtn" onClick={() => go("uslugi")}>
          Zobacz wszystkie
        </button>
      </div>
      <TileGrid go={go} items={QUICK} note={peselLocked ? "PESEL zastrzeżony w tym prototypie" : undefined} />
      <button type="button" className="nx-morebar" onClick={() => go("uslugi")}>
        Więcej usług
        <Glyph name="forward" />
      </button>
      <p className="nx-kicker nx-section">Sprawy w toku</p>
      <div className="nx-list">
        {CASES.filter((item) => item.status !== "zakończona").map((item) => (
          <button key={item.id} type="button" className="nx-row" onClick={() => go("sprawa", item.id)}>
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
        <strong>Świadczenie 800 zł na Maję</strong>
        <small>Wypłata 15 grudnia. To decyzja z wzoru, nie nowy wniosek.</small>
      </button>
    </>
  );
}

function Dense({ go, waiting }: { go: (view: ViewId, id?: string) => void; waiting: number }) {
  return (
    <>
      <p className="nx-fine">
        {waiting} {waiting === 1 ? "pismo wymaga działania" : "pisma wymagają działania"}.
      </p>
      <TileGrid go={go} items={QUICK} />
      <div className="nx-list">
        {LETTERS.slice(0, 3).map((letter) => (
          <button key={letter.id} type="button" className="nx-row" onClick={() => go("pismo", letter.id)}>
            <span className="nx-row-copy">
              <strong>{letter.subject}</strong>
              <small>{letter.from}</small>
            </span>
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
        <button key={item.id} type="button" className="nx-tile" onClick={() => go(item.view, item.selectedId)}>
          <Glyph name={item.glyph} />
          <strong>{item.name}</strong>
          <small>{item.id === "pesel" && note ? note : item.description}</small>
        </button>
      ))}
    </div>
  );
}
