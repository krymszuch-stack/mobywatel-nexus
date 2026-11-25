import { useState } from "react";
import { DOCUMENTS } from "@/lib/nexus/data";
import { daysUntil, minutesLeft, plDate, untilLabel } from "@/lib/nexus/format";
import { useNexus } from "@/lib/nexus/store";
import { Glyph } from "./glyph";
import { Watermark } from "./heritage";
import { ConfirmDialog, Missing, PageHead, Status } from "./ui";

function wellTone(id: string) {
  if (id === "prawojazdy") return "peach";
  if (id === "paszport") return "lilac";
  if (id === "ekuz") return "mint";
  return "sky";
}

function toneFor(id: string, expires: string | undefined, lost: boolean) {
  if (lost) return { label: "zgłoszono utratę", tone: "bad" as const };
  if (expires && daysUntil(expires) < 365) {
    return { label: `wygasa ${untilLabel(expires)}`, tone: "warn" as const };
  }
  return { label: "aktywny", tone: "ok" as const };
}

export function DocumentList() {
  const go = useNexus((s) => s.go);
  const lost = useNexus((s) => s.lost);
  return (
    <div className="nx-stage">
      <Watermark motif="rosette" />
      <PageHead
        kicker="Portfel"
        title="Dokumenty"
        lede="Wzory, nie prawdziwe dokumenty. Każdy ma znak WZÓR i zostaje na tym urządzeniu."
      />
      <div className="nx-list">
        {DOCUMENTS.map((doc) => {
          const status = toneFor(doc.id, doc.expires, lost.includes(doc.id));
          return (
            <button key={doc.id} type="button" className="nx-row" onClick={() => go("dokument", doc.id)}>
              <span className={`nx-well nx-tone-${wellTone(doc.id)}`}><Glyph name={doc.glyph} /></span>
              <span className="nx-row-copy">
                <strong>{doc.title}</strong>
                <small>
                  {doc.series} · {doc.kind}
                </small>
              </span>
              <Status tone={status.tone}>{status.label}</Status>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DocumentDetail({ id }: { id: string }) {
  const doc = DOCUMENTS.find((item) => item.id === id);
  const back = useNexus((s) => s.back);
  const lost = useNexus((s) => s.lost);
  const shares = useNexus((s) => s.shares);
  const shareDoc = useNexus((s) => s.shareDoc);
  const revokeShare = useNexus((s) => s.revokeShare);
  const reportLost = useNexus((s) => s.reportLost);
  const showToast = useNexus((s) => s.showToast);
  const [codeOn, setCodeOn] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  if (!doc) return <Missing title="Nie ma takiego dokumentu" onBack={back} />;
  const isLost = lost.includes(doc.id);
  const shareUntil = shares[doc.id];
  const activeShare = Boolean(shareUntil && shareUntil > Date.now());
  const status = toneFor(doc.id, doc.expires, isLost);

  return (
    <div className="nx-stage">
      <PageHead kicker={doc.kind} title={doc.title} lede={doc.issuer} />
      <article className="nx-sheet">
        <Watermark motif={doc.motif} />
        <p className="nx-specimen nx-specimen-inline">WZÓR</p>
        <h2>{doc.fields[0]?.value}</h2>
        <p className="nx-sheet-series">{doc.series}</p>
        <dl className="nx-dl">
          {doc.fields.slice(1).map((field) => (
            <div key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
          <div>
            <dt>Wydany</dt>
            <dd>{plDate(doc.issued)}</dd>
          </div>
          {doc.expires ? (
            <div>
              <dt>Ważny do</dt>
              <dd>{plDate(doc.expires)}</dd>
            </div>
          ) : null}
        </dl>
        <Status tone={status.tone}>{status.label}</Status>
      </article>
      {activeShare && shareUntil ? (
        <p className="nx-note">
          Podgląd włączony jeszcze przez {minutesLeft(shareUntil)} min. Działa tylko w tym prototypie.
          <button type="button" className="nx-textbtn" onClick={() => revokeShare(doc.id)}>
            Wyłącz podgląd
          </button>
        </p>
      ) : null}
      <div className="nx-actions">
        <button type="button" className="nx-btn nx-btn-primary" disabled={isLost} onClick={() => setCodeOn((value) => !value)}>
          <Glyph name="code" /> {codeOn ? "Ukryj kod" : "Pokaż kod"}
        </button>
        <button type="button" className="nx-btn" disabled={isLost} onClick={() => setShareOpen(true)}>
          <Glyph name="share" /> Udostępnij na 15 minut
        </button>
        <button type="button" className="nx-btn" disabled={isLost} onClick={() => setLostOpen(true)}>
          <Glyph name="alert" /> Zgłoś utratę
        </button>
      </div>
      {codeOn ? (
        <div className="nx-codeplate">
          <Glyph name="code" />
          <strong>NX-15-WZÓR</strong>
          <p className="nx-fine">Znak zastępczy. Nie jest kodem do urzędu.</p>
        </div>
      ) : null}
      <ConfirmDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Udostępnić podgląd na 15 minut?"
        body="Podgląd zostaje na tym urządzeniu. Nikt poza prototypem go nie zobaczy. Po czasie wyłączy się sam."
        confirm="Włącz na 15 minut"
        onConfirm={() => {
          shareDoc(doc.id, 15);
          showToast("Podgląd włączony na 15 minut");
        }}
      />
      <ConfirmDialog
        open={lostOpen}
        onOpenChange={setLostOpen}
        title="Zgłosić utratę tego wzoru?"
        body="W prawdziwej usłudze taki sygnał blokuje dokument. Tutaj zmienimy tylko status w prototypie i wyłączymy podgląd."
        confirm="Zgłoś utratę"
        danger
        onConfirm={() => {
          reportLost(doc.id);
          showToast("Zgłoszono utratę w prototypie");
        }}
      />
    </div>
  );
}
