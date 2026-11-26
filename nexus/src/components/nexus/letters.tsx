import { useEffect, useState } from "react";
import { agencyNames, visible, warsaw } from "@/lib/nexus/civic/model";
import { caseVisible, useCivicData } from "@/lib/nexus/civic/select";
import { Field } from "./civic/ui";
import { LETTERS } from "@/lib/nexus/data";
import { plDate } from "@/lib/nexus/format";
import {
  formatEventTime,
  selectLetterReceipt,
  selectRelatedLinksForLetter,
} from "@/lib/nexus/oneflow";
import { useNexus } from "@/lib/nexus/store";
import { Glyph } from "./glyph";
import { Watermark } from "./heritage";
import { letterPhase } from "./letters-state";
import { ConfirmDialog, Missing, PageHead, Row } from "./ui";

export function LetterList() {
  const go = useNexus((s) => s.go);
  const readIds = useNexus((s) => s.readIds);
  const replies = useNexus((s) => s.replies);
  const drafts = useNexus((s) => s.drafts);
  const all = useCivicData();
  const initial = useNexus((s) => s.selectedId);
  const source = initial ?? "all";
  const selectSource = useNexus((s) => s.select);
  const docs = all.flatMap((data) => data.documents.filter((doc) => visible(data, doc) && caseVisible(data, doc.caseId) && (source === "all" || source === doc.source)));
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
        title="Pisma z urzędów"
        lede="Podgląd skrzynki z wyjaśnieniem po ludzku, szkicami i lokalnym potwierdzeniem. Nic nie wychodzi do urzędu."
      />
      <Field label="Źródło pisma">{(field) => <select {...field} value={source} onChange={(e) => selectSource(e.target.value === "all" ? undefined : e.target.value)}>
        <option value="all">Wszystkie</option><option value="nexus">e-Doręczenia</option>
        {all.map((data) => <option key={data.source} value={data.source}>{agencyNames[data.source]}</option>)}
      </select>}</Field>
      {source !== "nexus" && <div className="nx-list">
        {docs.map((doc) => <Row key={doc.id} glyph="letter" title={doc.title} meta={`${agencyNames[doc.source]} · ${warsaw(doc.publishedAt)}`} onClick={() => go("pismo", doc.id)} />)}
        {source !== "all" && !docs.length && <p>Brak pism z tego źródła w bieżącym kontekście.</p>}
      </div>}
      {(source === "all" || source === "nexus") && <>
      <div className="nx-filters" role="tablist" aria-label="Filtr pism">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "act"}
          onClick={() => setFilter("act")}
        >
          Do załatwienia
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "info"}
          onClick={() => setFilter("info")}
        >
          Informacje
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "done"}
          onClick={() => setFilter("done")}
        >
          Załatwione
        </button>
      </div>
      <div className="nx-mail-list">
        {rows.length === 0 ? (
          <p className="nx-fine">
            {filter === "act"
              ? "Nie masz pisma wymagającego odpowiedzi."
              : filter === "done"
                ? "Nie masz jeszcze zapisanych odpowiedzi."
                : "Brak pism informacyjnych w tej zakładce."}
          </p>
        ) : null}
        {rows.map((letter) => {
          const phase = letterPhase(letter, readIds, replies);
          const kind = phase === "wymaga odpowiedzi" ? "act" : phase === "nowe" ? "info" : "done";
          const label =
            phase === "wymaga odpowiedzi"
              ? "Wymaga działania"
              : phase === "nowe"
                ? "Informacja"
                : phase === "odpowiedziane"
                  ? "Odpowiedziane"
                  : "Przeczytane";
          const hasDraft = Boolean((drafts[letter.id] ?? "").trim()) && !replies[letter.id];
          return (
            <button
              key={letter.id}
              type="button"
              className="nx-mail"
              onClick={() => go("pismo", letter.id)}
            >
              <span>
                <strong>{letter.from}</strong>
                <small>
                  {letter.subject}
                  {hasDraft ? " · zapisany szkic" : ""}
                </small>
              </span>
              <span className="nx-pill" data-kind={kind}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="nx-fine nx-section">
        Oficjalny serwis:{" "}
        <a
          href="https://www.gov.pl/web/e-doreczenia"
          target="_blank"
          rel="noreferrer"
          className="nx-extlink"
        >
          gov.pl/web/e-doreczenia (otwiera stronę poza prototypem)
        </a>
      </p>
      </>}
    </div>
  );
}

export function LetterDetail({ id }: { id: string }) {
  const letter = LETTERS.find((item) => item.id === id);
  const state = useNexus();
  const { back, go, markRead, setDraft, sendReply, showToast } = state;
  const draft = state.drafts[id] ?? "";
  const reply = state.replies[id];
  const receipt = selectLetterReceipt(state, id);
  const [ask, setAsk] = useState(false);
  const [plainOpen, setPlainOpen] = useState(true);

  useEffect(() => {
    if (letter) markRead(letter.id);
  }, [letter, markRead]);

  if (!letter) return <Missing title="Nie ma takiego pisma" onBack={back} />;

  const relatedLinks = selectRelatedLinksForLetter(letter);

  return (
    <article className="nx-stage">
      <PageHead
        kicker={`${letter.office} · ${letter.reference}`}
        title={letter.subject}
        lede={`${letter.from} · ${plDate(letter.date)}`}
      />

      <section className="nx-benefit" aria-label="Wyjaśnienie pisma po ludzku">
        <div className="nx-sectionhead">
          <p className="nx-kicker">Wyjaśnij mi to prościej · interpretacja prototypu</p>
          <button
            type="button"
            className="nx-textbtn"
            aria-expanded={plainOpen}
            onClick={() => setPlainOpen((v) => !v)}
          >
            {plainOpen ? "Ukryj" : "Rozwiń"}
          </button>
        </div>
        <p>
          <strong>{letter.plain.whatItMeans}</strong>
        </p>
        {plainOpen ? (
          <div className="nx-stack">
            <div>
              <p className="nx-kicker">Fakty z treści pisma</p>
              <ul className="nx-bullets">
                {letter.plain.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
            <blockquote className="nx-quote">{letter.plain.sourceExcerpt}</blockquote>
            <div>
              <p className="nx-kicker">Wymagania i załączniki</p>
              <ul className="nx-bullets">
                {letter.plain.requiredItems.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="nx-kicker">Czego prototyp nie rozstrzyga</p>
              <ul className="nx-bullets">
                {letter.plain.ambiguities.map((amb) => (
                  <li key={amb}>{amb}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <div className="nx-sheet nx-prose">
        <Watermark motif="manuscript" />
        <p className="nx-kicker">Treść pisma ze wzoru</p>
        {letter.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {reply ? (
        <section className="nx-note">
          <p className="nx-kicker">Twoja odpowiedź · zapisana w prototypie</p>
          <p>{reply}</p>
          {receipt ? (
            <div className="nx-receipt">
              <p className="nx-kicker">Potwierdzenie lokalne · {receipt.code}</p>
              <p>{receipt.summary}</p>
              <p className="nx-fine">
                Zapisano: {formatEventTime(receipt.createdAt)}. {receipt.note}
              </p>
            </div>
          ) : null}
          <div className="nx-actions">
            {letter.relatedCaseId ? (
              <button
                type="button"
                className="nx-btn nx-btn-primary"
                onClick={() => go("sprawa", letter.relatedCaseId)}
              >
                <Glyph name="case" /> Otwórz powiązaną sprawę
              </button>
            ) : null}
            <button type="button" className="nx-btn" onClick={() => go("os")}>
              <Glyph name="timeline" /> Zobacz na osi czasu
            </button>
          </div>
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
          <div className="nx-sectionhead">
            <label htmlFor="nx-letter-draft" className="nx-kicker">
              Twoja odpowiedź (szkic lokalny)
            </label>
            {letter.plain.suggestedDraft && !draft.trim() ? (
              <button
                type="button"
                className="nx-textbtn"
                onClick={() => setDraft(letter.id, letter.plain.suggestedDraft ?? "")}
              >
                Wstaw propozycję szkicu
              </button>
            ) : null}
          </div>
          <div className="nx-field">
            <textarea
              id="nx-letter-draft"
              value={draft}
              onChange={(event) => setDraft(letter.id, event.target.value)}
              rows={5}
              placeholder="Napisz krótko, po co odpowiadasz"
            />
          </div>
          <p className="nx-fine">
            Szkic zostaje na tym urządzeniu, także gdy wyjdziesz z pisma. Zatwierdzenie zaktualizuje Moje pisma, powiązaną sprawę, priorytet na ekranie Start i Moją oś czasu.
          </p>
          <button type="submit" className="nx-btn nx-btn-primary">
            Sprawdź i zapisz odpowiedź
          </button>
        </form>
      )}

      {relatedLinks.length > 0 ? (
        <section>
          <p className="nx-kicker nx-section">Powiązane sprawy i usługi</p>
          <div className="nx-list">
            {relatedLinks.map((link) => (
              <Row
                key={link.id}
                glyph={link.glyph}
                title={link.label}
                meta={link.meta}
                onClick={() => link.view && go(link.view, link.selectedId)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={ask}
        onOpenChange={setAsk}
        title="Zapisać odpowiedź w prototypie?"
        body={`Treść do zapisu: „${draft.trim().slice(0, 180)}${draft.trim().length > 180 ? "…" : ""}”. Nie wyślemy jej do prawdziwego urzędu — utworzymy potwierdzenie UPO-WZÓR i zaktualizujemy sprawę oraz oś czasu.`}
        confirm="Zapisz odpowiedź"
        onConfirm={() => {
          sendReply(letter.id);
          showToast("Odpowiedź zapisana — zaktualizowano sprawę i oś czasu");
        }}
      />
    </article>
  );
}
