import { useId, useRef, useState, type ReactNode, type Ref } from "react";
import { agencyNames, warsaw, type CivicData, type CivicTask } from "@/lib/nexus/civic/model";
import { ConfirmDialog, Row, Status } from "../ui";
import { civicGlyph, openTarget, usePresenterTools } from "./navigation";

export function Button({
  children,
  onClick,
  primary = false,
  disabled = false,
  buttonRef,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`nx-btn${primary ? " nx-btn-primary" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Action({
  children,
  title,
  body,
  onConfirm,
}: {
  children: string;
  title: string;
  body: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button primary buttonRef={opener} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        body={body}
        confirm={children}
        onConfirm={onConfirm}
        restoreFocus={() => opener.current?.focus()}
      />
    </>
  );
}

export function External({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="nx-btn" href={href} target="_blank" rel="noreferrer">
      {children} <span className="nx-sr">(otwiera zewnętrzny serwis)</span>
    </a>
  );
}

export function Filters({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (string | [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="nx-filters civic-filters" role="group" aria-label={label}>
      {options.map((option) => {
        const [key, text] = typeof option === "string" ? [option, option] : option;
        return (
          <button
            type="button"
            key={key}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: (field: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="nx-field civic-field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
      })}
      {error && (
        <span className="civic-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function Errors({ errors }: { errors: Record<string, string> }) {
  const messages = Object.values(errors);
  return messages.length ? (
    <div className="nx-note civic-error" role="alert">
      <strong>Sprawdź formularz</strong>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  ) : null;
}

export function TaskRows({ tasks }: { tasks: CivicTask[] }) {
  return (
    <div className="nx-list">
      {tasks.length ? (
        tasks.map((task) => (
          <Row
            key={task.id}
            glyph={civicGlyph[task.source]}
            title={task.title}
            meta={[
              `${agencyNames[task.source]} · ${task.detail}`,
              task.dueAt ? `Termin demo ${warsaw(task.dueAt)}` : null,
              task.action,
            ]
              .filter(Boolean)
              .join(" · ")}
            onClick={() => openTarget(task.target)}
          />
        ))
      ) : (
        <p className="nx-fine">Brak otwartych zadań.</p>
      )}
    </div>
  );
}

export function Freshness({
  data,
  retry,
  reconnectLabel = "Spróbuj ponownie",
}: {
  data: CivicData;
  retry: () => void;
  reconnectLabel?: string;
}) {
  const health = data.health;
  if (health === "ready")
    return <p className="nx-fine">Ostatnia udana aktualizacja · {warsaw(data.fetchedAt, true)}</p>;
  const labels: Record<Exclude<CivicData["health"], "ready">, string> = {
    loading: "Pobieramy dane…",
    empty: "Brak danych w tym scenariuszu.",
    error: "Nie udało się pobrać aktualnych danych.",
    stale: "Dane mogą być nieaktualne.",
    expired: "Sesja połączenia wygasła.",
    forbidden: "Brak uprawnień do danych.",
  };
  return (
    <div className="nx-note" role="status">
      <Status tone={health === "error" || health === "expired" ? "warn" : "info"}>
        {labels[health]}
      </Status>
      {["error", "stale", "expired"].includes(health) && (
        <p>Ostatnia udana aktualizacja · {warsaw(data.fetchedAt, true)}</p>
      )}
      {!["loading", "empty", "forbidden"].includes(health) && (
        <Button onClick={retry}>{reconnectLabel}</Button>
      )}
    </div>
  );
}

export function DemoPanel({ children, reset }: { children: ReactNode; reset: () => void }) {
  const enabled = usePresenterTools();
  if (!enabled) return null;
  return (
    <details className="nx-sheet civic-demo">
      <summary>Scenariusze demo</summary>
      <div className="civic-stack">
        {children}
        <Action
          title="Przywrócić dane demonstracyjne tej usługi?"
          body="Szkice, lokalne ustawienia i zmiany tej usługi wrócą do stanu początkowego."
          onConfirm={reset}
        >
          Reset danych demonstracyjnych
        </Action>
      </div>
    </details>
  );
}
