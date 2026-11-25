import type { ErrorComponentProps } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "Coś poszło nie tak. Odśwież prototyp.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="nx-boot">
      <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3.6 21.2 19.6H2.8z" />
        <path d="M12 9.4v5" />
      </svg>
      <h1>Nie udało się otworzyć widoku</h1>
      <p className="nx-fine">{errorMessage(error)}</p>
    </main>
  );
}
