import * as Dialog from "@radix-ui/react-dialog";
import { useRef, type ReactNode } from "react";
import { Glyph, type GlyphName } from "./glyph";

export function PageHead({
  kicker,
  title,
  lede,
}: {
  kicker?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="nx-pagehead">
      {kicker ? <p className="nx-kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {lede ? <p className="nx-lede">{lede}</p> : null}
    </header>
  );
}

const GLYPH_TONE: Partial<Record<GlyphName, string>> = {
  letter: "coral",
  case: "amber",
  documents: "sky",
  identity: "sky",
  vehicle: "peach",
  passport: "lilac",
  health: "mint",
  support: "mint",
  institution: "sky",
  timeline: "lilac",
  shield: "coral",
  eye: "peach",
  trusted: "amber",
  family: "peach",
  child: "peach",
  education: "lilac",
  housing: "sky",
  work: "amber",
  calendar: "mint",
  school: "lilac",
  emergency: "coral",
};

export function Row({
  glyph,
  title,
  meta,
  aside,
  onClick,
  href,
}: {
  glyph: GlyphName;
  title: string;
  meta?: string;
  aside?: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span className={`nx-well nx-tone-${GLYPH_TONE[glyph] ?? "sky"}`}>
        <Glyph name={glyph} />
      </span>
      <span className="nx-row-copy">
        <strong>{title}</strong>
        {meta ? <small>{meta}</small> : null}
      </span>
      {aside ? <span className="nx-row-aside">{aside}</span> : <Glyph name="forward" className="nx-row-go" />}
    </>
  );
  if (href) {
    return (
      <a className="nx-row" href={href}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className="nx-row" onClick={onClick}>
      {inner}
    </button>
  );
}

export function Status({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "info";
  children: ReactNode;
}) {
  return (
    <span className="nx-status" data-tone={tone}>
      <i />
      {children}
    </span>
  );
}

export function Missing({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div>
      <PageHead title={title} />
      <button type="button" className="nx-btn" onClick={onBack}>
        Wróć
      </button>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirm,
  onConfirm,
  danger,
  restoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirm: string;
  onConfirm: () => void;
  danger?: boolean;
  restoreFocus?: () => void;
}) {
  const previousFocus = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="nx-overlay" />
        <Dialog.Content
          className="nx-dialog"
          onOpenAutoFocus={() => {
            previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            if (restoreFocus) {
              event.preventDefault();
              restoreFocus();
            } else if (previousFocus.current?.isConnected) {
              event.preventDefault();
              previousFocus.current.focus({ preventScroll: true });
            }
          }}
        >
          <span className="nx-grab" aria-hidden="true" />
          <Dialog.Title className="nx-dialog-title">{title}</Dialog.Title>
          <Dialog.Description className="nx-lede">
            {body}
          </Dialog.Description>
          <div className="nx-dialog-actions">
            <Dialog.Close className="nx-btn">Anuluj</Dialog.Close>
            <button
              type="button"
              className={danger ? "nx-btn nx-btn-danger" : "nx-btn nx-btn-primary"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirm}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Fold({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className="nx-fold" data-open={open ? "true" : "false"}>
      <div className="nx-fold-in">{children}</div>
    </div>
  );
}
