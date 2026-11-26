import { useEffect, useState } from "react";
import { DOCUMENTS } from "@/lib/nexus/data";
import { daysUntil, plDate, untilLabel } from "@/lib/nexus/format";
import { selectActiveShare, selectRelatedLinksForDoc } from "@/lib/nexus/oneflow";
import { useNexus } from "@/lib/nexus/store";
import { Glyph } from "./glyph";
import { Watermark } from "./heritage";
import { ConfirmDialog, Missing, PageHead, Row, Status } from "./ui";

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
  const peselLocked = useNexus((s) => s.peselLocked);
  return (
    <div className="nx-stage">
      <PageHead
        kicker="Dokumenty i tożsamość"
        title="Dokumenty"
        lede="Wzory, nie prawdziwe dokumenty. Każdy ma znak WZÓR i zostaje wyłącznie na tym urządzeniu."
      />
      <div className="nx-list">
        {DOCUMENTS.map((doc) => {
          const status = toneFor(doc.id, doc.expires, lost.includes(doc.id));
          return (
            <button
              key={doc.id}
              type="button"
              className="nx-row"
              onClick={() => go("dokument", doc.id)}
            >
              <span className={`nx-well nx-tone-${wellTone(doc.id)}`}>
                <Glyph name={doc.glyph} />
              </span>
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

      <p className="nx-kicker nx-section">Ochrona tożsamości</p>
      <div className="nx-list">
        <Row
          glyph="key"
          title="Zastrzeż PESEL"
          meta={peselLocked ? "Zastrzeżony w tym prototypie" : "Nie jest zastrzeżony · zmiana lokalna"}
          onClick={() => go("bezpieczenstwo")}
        />
        <Row
          glyph="eye"
          title="Dostęp do moich danych"
          meta="Przejrzysta historia wglądu i operacji w prototypie"
          onClick={() => go("dostepy")}
        />
      </div>
    </div>
  );
}

export function DocumentDetail({ id }: { id: string }) {
  const doc = DOCUMENTS.find((item) => item.id === id);
  const back = useNexus((s) => s.back);
  const go = useNexus((s) => s.go);
  const lost = useNexus((s) => s.lost);
  const shares = useNexus((s) => s.shares);
  const shareDoc = useNexus((s) => s.shareDoc);
  const revokeShare = useNexus((s) => s.revokeShare);
  const pruneShares = useNexus((s) => s.pruneShares);
  const reportLost = useNexus((s) => s.reportLost);
  const showToast = useNexus((s) => s.showToast);
  const [codeOn, setCodeOn] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const rawUntil = doc ? shares[doc.id] : undefined;

  // Automatically refresh expiry countdown while the document screen is open
  useEffect(() => {
    if (!rawUntil) return;
    const tick = () => {
      const current = Date.now();
      setNowMs(current);
      if (rawUntil <= current) {
        pruneShares();
      }
    };
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, [rawUntil, pruneShares]);

  if (!doc) return <Missing title="Nie ma takiego dokumentu" onBack={back} />;
  const isLost = lost.includes(doc.id);
  const activeShare = selectActiveShare(shares, doc.id, nowMs);
  const status = toneFor(doc.id, doc.expires, isLost);
  const relatedLinks = selectRelatedLinksForDoc(doc.id);

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

      {doc.scopeWarning ? (
        <section className="nx-note">
          <p className="nx-kicker">Ważny zakres dokumentu</p>
          <p>{doc.scopeWarning}</p>
        </section>
      ) : null}

      {activeShare.active ? (
        <div className="nx-note">
          <p className="nx-kicker">Czasowy podgląd lokalny (nie udostępnienie zewnętrzne)</p>
          <p>
            Podgląd aktywny jeszcze przez <strong>{activeShare.minutesRemaining} min</strong>. Po czasie wyłączy się automatycznie. Nie generuje prawdziwego kodu QR.
          </p>
          <button
            type="button"
            className="nx-textbtn"
            onClick={() => {
              revokeShare(doc.id);
              showToast("Wyłączono lokalny podgląd dokumentu");
            }}
          >
            Wyłącz podgląd teraz
          </button>
        </div>
      ) : null}

      <div className="nx-actions">
        <button
          type="button"
          className="nx-btn nx-btn-primary"
          disabled={isLost}
          onClick={() => setCodeOn((value) => !value)}
        >
          <Glyph name="code" /> {codeOn ? "Ukryj kod wzoru" : "Pokaż kod wzoru"}
        </button>
        <button type="button" className="nx-btn" disabled={isLost} onClick={() => setShareOpen(true)}>
          <Glyph name="share" /> Podgląd na 15 minut
        </button>
        <button type="button" className="nx-btn" disabled={isLost} onClick={() => setLostOpen(true)}>
          <Glyph name="alert" /> Zgłoś utratę
        </button>
      </div>

      {codeOn ? (
        <div className="nx-codeplate">
          <Glyph name="code" />
          <strong>NX-15-WZÓR</strong>
          <p className="nx-fine">
            Znak zastępczy prototypu. Nie jest prawdziwym kodem QR ani poświadczeniem urzędowym.
          </p>
        </div>
      ) : null}

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
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Włączyć lokalny podgląd na 15 minut?"
        body="To wyłącznie czasowy podgląd na tym urządzeniu — nie wysyłamy danych i nie tworzymy kodu QR. Zdarzenie zapisze się w historii wglądu oraz na osi czasu."
        confirm="Włącz na 15 minut"
        onConfirm={() => {
          shareDoc(doc.id, 15);
          setNowMs(Date.now());
          showToast("Podgląd lokalny włączony na 15 minut");
        }}
      />
      <ConfirmDialog
        open={lostOpen}
        onOpenChange={setLostOpen}
        title="Zgłosić utratę tego wzoru?"
        body="W prawdziwej usłudze zgłoszenie unieważnia dokument. Tutaj zmienimy tylko status w prototypie, wyłączymy podgląd i zapiszemy zdarzenie w bezpieczeństwie oraz na osi czasu."
        confirm="Zgłoś utratę"
        danger
        onConfirm={() => {
          reportLost(doc.id);
          setCodeOn(false);
          showToast("Zgłoszono utratę w prototypie — zobacz Ochronę tożsamości");
        }}
      />
    </div>
  );
}
