import { useEffect, useState } from "react";
import { LETTERS } from "@/lib/nexus/data";
import { plDate } from "@/lib/nexus/format";
import { useNexus } from "@/lib/nexus/store";
import { Watermark } from "./heritage";
import { letterPhase } from "./letters-state";
import { ConfirmDialog, Missing, PageHead, Status } from "./ui";
import { Glyph } from "./glyph";

const TONE = {
  nowe: "info",
  "wymaga odpowiedzi": "warn",
  odpowiedziane: "ok",
  przeczytane: "ok",
} as const;

export function LetterList() {
  const go = useNexus((s) => s.go);
  const readIds = useNexus((s) => s.readIds);
  const replies = useNexus((s) => s.replies);
  const [filter, setFilter] = useState<"act" | "info" | "done">("act");
  const rows = LETTERS.filter((letter) => {
    const phase = letterPhase(letter, readIds, replies);
    if (filter === "act") return phase === "wymaga odpowiedzi";
    if (filter === "info") return phase === "nowe" || phase === "przeczytane";
    return phase === "odpowiedziane";
  });
  return (
    <div className="nx-stage">
      <PageHead
        kicker="e-Doręczenia"
        title="Moje pisma"
        lede="Podgląd skrzynki. Nic stąd nie wychodzi do prawdziwego urzędu."
      />
      <div className="nx-filters" role="tablist">
        <button type="button" aria-selected={filter === "act"} onClick={() => setFilter("act")}>
          Do załatwienia
        </button>
        <button type="button" aria-selected={filter === "info"} onClick={() => setFilter("info")}>
          Informacje
        </button>
        <button type="button" aria-selected={filter === "done"} onClick={() => setFilter("done")}>
          Załatwione
        </button>
      </div>
      <div className="nx-mail-list">
        {rows.length === 0 ? <p className="nx-fine">Nie masz pisma, które wymaga ruchu.</p> : null}
        {rows.map((letter) => {
          const phase = letterPhase(letter, readIds, replies);
          const kind = phase === "wymaga odpowiedzi" ? "act" : phase === "nowe" ? "info" : "done";
          const label = phase === "wymaga odpowiedzi" ? "Wymaga działania" : phase === "nowe" ? "Informacja" : phase === "odpowiedziane" ? "Odpowiedziane" : "Przeczytane";
          return (
            <button key={letter.id} type="button" className="nx-mail" onClick={() => go("pismo", letter.id)}>
              <span>
                <strong>{letter.from}</strong>
                <small>{letter.subject}</small>
              </span>
              <span className="nx-pill" data-kind={kind}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LetterDetail({ id }: { id: string }) {
  const letter = LETTERS.find((item) => item.id === id);
  const back = useNexus((s) => s.back);
  const markRead = useNexus((s) => s.markRead);
  const draft = useNexus((s) => s.drafts[id] ?? "");
  const reply = useNexus((s) => s.replies[id]);
  const setDraft = useNexus((s) => s.setDraft);
  const sendReply = useNexus((s) => s.sendReply);
  const showToast = useNexus((s) => s.showToast);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (letter) markRead(letter.id);
  }, [letter, markRead]);

  if (!letter) return <Missing title="Nie ma takiego pisma" onBack={back} />;

  return (
    <article className="nx-stage">
      <PageHead kicker={letter.office} title={letter.subject} lede={`${letter.from} · ${plDate(letter.date)}`} />
      <div className="nx-sheet nx-prose">
        <Watermark motif={letter.motif} />
        {letter.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {reply ? (
        <section className="nx-note">
          <p className="nx-kicker">Twoja odpowiedź</p>
          <p>{reply}</p>
          <p className="nx-fine">Zapisana w prototypie. Nie została wysłana do urzędu.</p>
        </section>
      ) : (
        <form
          className="nx-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) {
              showToast("Najpierw napisz choć zdanie");
              return;
            }
            setAsk(true);
          }}
        >
          <label className="nx-field">
            <span>Twoja odpowiedź</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(letter.id, event.target.value)}
              rows={5}
              placeholder="Napisz krótko, po co odpowiadasz"
            />
          </label>
          <p className="nx-fine">Szkic zostaje na tym urządzeniu, także gdy wyjdziesz z pisma.</p>
          <button type="submit" className="nx-btn nx-btn-primary">
            Wyślij odpowiedź
          </button>
        </form>
      )}
      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zapisać odpowiedź w prototypie?"
        body="Nie wyślemy jej do urzędu. Zostanie przy tym piśmie, żebyś widział, że sprawa ma twój głos."
        confirm="Zapisz odpowiedź"
        onConfirm={() => {
          sendReply(letter.id);
          showToast("Odpowiedź zapisana w prototypie");
        }}
      />
    </article>
  );
}
