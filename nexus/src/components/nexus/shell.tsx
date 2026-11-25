import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { LETTERS } from "@/lib/nexus/data";
import { matchOrbit } from "@/lib/nexus/orbit-match";
import { useNexus } from "@/lib/nexus/store";
import type { ViewId } from "@/lib/nexus/types";
import { Glyph, type GlyphName } from "./glyph";
import { Mark } from "./heritage";
import { openLetterCount } from "./letters-state";

const TABS: { id: ViewId | "szukaj"; label: string; glyph: GlyphName }[] = [
  { id: "start", label: "Pulpit", glyph: "start" },
  { id: "dokumenty", label: "Dokumenty", glyph: "documents" },
  { id: "szukaj", label: "Szukaj", glyph: "orbit" },
  { id: "uslugi", label: "Usługi", glyph: "institution" },
  { id: "profil", label: "Profil", glyph: "trusted" },
];

const SIDE: { id: ViewId; label: string; glyph: GlyphName; group: string }[] = [
  { id: "start", label: "Pulpit", glyph: "start", group: "Codziennie" },
  { id: "dokumenty", label: "Dokumenty", glyph: "documents", group: "Codziennie" },
  { id: "uslugi", label: "Usługi", glyph: "institution", group: "Codziennie" },
  { id: "pisma", label: "e-Doręczenia", glyph: "letter", group: "Codziennie" },
  { id: "sprawy", label: "Sprawy", glyph: "case", group: "Codziennie" },
  { id: "zdrowie", label: "mojeIKP", glyph: "health", group: "Zdrowie i droga" },
  { id: "kierowca", label: "Pojazdy", glyph: "vehicle", group: "Zdrowie i droga" },
  { id: "zalatw", label: "Załatw sprawę", glyph: "institution", group: "Życie" },
  { id: "wsparcie", label: "Możliwe wsparcie", glyph: "support", group: "Życie" },
  { id: "os", label: "Oś czasu", glyph: "timeline", group: "Życie" },
  { id: "profil", label: "Profil", glyph: "trusted", group: "Konto" },
  { id: "bezpieczenstwo", label: "Bezpieczeństwo", glyph: "shield", group: "Konto" },
  { id: "dostepy", label: "Kto widział dane", glyph: "eye", group: "Konto" },
  { id: "zaufana", label: "Osoba zaufana", glyph: "trusted", group: "Konto" },
  { id: "wyglad", label: "Wygląd", glyph: "sliders", group: "Konto" },
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
        <span>
          <small>mObywatel</small>
          <strong>NEXUS</strong>
        </span>
      </div>
      <nav aria-label="Główne">
        {SIDE.map((item) => {
          const head = item.group !== lastGroup;
          lastGroup = item.group;
          const current = view === item.id || (item.id === "pisma" && view === "pismo") || (item.id === "dokumenty" && view === "dokument") || (item.id === "sprawy" && view === "sprawa") || (item.id === "zalatw" && view === "zdarzenie");
          return (
            <div key={item.id}>
              {head ? <p className="nx-kicker nx-side-kicker">{item.group}</p> : null}
              <button type="button" className="nx-sidebtn" aria-current={current ? "page" : undefined} onClick={() => tab(item.id)}>
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
  const [spin, setSpin] = useState(false);
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
        <small>mObywatel</small>
        <strong>NEXUS</strong>
      </p>
      <span className="nx-specimen">WZÓR</span>
      <button
        type="button"
        className="nx-iconbtn"
        aria-haspopup="dialog"
        onClick={() => {
          setSpin(true);
          setOrbit(true);
        }}
      >
        <Glyph name="orbit" className={spin ? "nx-spin" : undefined} />
        <span className="nx-sr">Szukaj i polecenia</span>
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
                ? view === "uslugi" || view === "zdrowie" || view === "kierowca" || view === "zalatw" || view === "zdarzenie"
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
  const items = SIDE.filter((item) => item.group !== "Codziennie");
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
  const open = useNexus((s) => s.orbit);
  const setOrbit = useNexus((s) => s.setOrbit);
  const go = useNexus((s) => s.go);
  const readIds = useNexus((s) => s.readIds);
  const replies = useNexus((s) => s.replies);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const unread = openLetterCount(readIds, replies);
  const results = matchOrbit(query, unread);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOrbit}>
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
          <p className="nx-kicker">NEXUS</p>
          <Dialog.Title className="nx-dialog-title">W czym mogę pomóc?</Dialog.Title>
          <Dialog.Description id="nx-orbit-desc" className="nx-fine">
            Szukam w prototypie. Nie wysyłam pytania nigdzie dalej.
          </Dialog.Description>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const first = results[0];
              if (!first) return;
              go(first.view, first.selectedId);
            }}
          >
            <label className="nx-sr" htmlFor="nx-orbit-q">
              Polecenie albo szukana sprawa
            </label>
            <input
              id="nx-orbit-q"
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Na przykład: paszport, 800, utrata"
              autoComplete="off"
            />
          </form>
          <div className="nx-list">
            {results.length === 0 ? <p className="nx-fine">Nic nie pasuje. Spróbuj „pismo”, „dowód” albo „motyw”.</p> : null}
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nx-row"
                onClick={() => go(item.view, item.selectedId)}
              >
                <Glyph name={item.glyph} />
                <span className="nx-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </span>
              </button>
            ))}
          </div>
          <p className="nx-fine">Skrót: Ctrl+K. Otwartych pism w skrzynce: {LETTERS.length}.</p>
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

export function useGlobalKeys() {
  const setOrbit = useNexus((s) => s.setOrbit);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOrbit(true);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOrbit(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOrbit]);
}
