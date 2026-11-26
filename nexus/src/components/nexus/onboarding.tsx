import { useState } from "react";
import type { HomeMode, ThemeName } from "@/lib/nexus/types";
import { useNexus } from "@/lib/nexus/store";

const MODES: { id: HomeMode; title: string; text: string }[] = [
  {
    id: "simple",
    title: "Prosto i wygodnie",
    text: "Najpierw to, co pilne. Reszta zostaje schowana, dopóki jej nie rozwiniesz.",
  },
  {
    id: "daily",
    title: "Na co dzień",
    text: "Dokumenty, terminy i najpilniejsze zadanie.",
  },
  {
    id: "dense",
    title: "Wszystko pod ręką",
    text: "Więcej spraw na jednym ekranie. Krótsze wiersze, mniej przewijania.",
  },
];

const THEMES: { id: ThemeName; name: string; hint: string }[] = [
  { id: "porcelain", name: "Porcelana", hint: "Jasny, spokojny" },
  { id: "midnight", name: "Północ", hint: "Granat i kość słoniowa" },
  { id: "contrast", name: "Kontrast", hint: "Najczytelniej" },
];

const SCALES = [1, 1.25, 1.5, 1.75, 2];

export function Onboarding() {
  const theme = useNexus((s) => s.theme);
  const setTheme = useNexus((s) => s.setTheme);
  const textScale = useNexus((s) => s.textScale);
  const setTextScale = useNexus((s) => s.setTextScale);
  const finish = useNexus((s) => s.finishOnboarding);
  const [mode, setMode] = useState<HomeMode>("daily");
  const [typeOpen, setTypeOpen] = useState(false);

  return (
    <div className="nx-stage nx-onboard">
      <p className="nx-kicker">Pierwsze uruchomienie</p>
      <h1>Jak ma wyglądać twój start?</h1>
      <p className="nx-lede">
Wybierz układ. Motyw i wielkość tekstu możesz zmienić później.
      </p>
      <div className="nx-choices" role="group" aria-label="Układ ekranu startowego">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-choice"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            <span className={`nx-mini nx-mini-${item.id}`} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="nx-pick">{mode === item.id ? "Wybrane" : "Wybierz"}</span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </button>
        ))}
      </div>
      <p className="nx-kicker nx-section">Motyw</p>
      <div className="nx-swatches" role="group" aria-label="Motyw kolorystyczny">
        {THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nx-swatch"
            data-swatch={item.id}
            aria-pressed={theme === item.id}
            onClick={() => setTheme(item.id)}
          >
            <strong>{item.name}</strong>
            <small>{item.hint}</small>
          </button>
        ))}
      </div>
      <button type="button" className="nx-textbtn" aria-expanded={typeOpen} onClick={() => setTypeOpen((v) => !v)}>
        {typeOpen ? "Zwiń wielkość tekstu" : "Wielkość tekstu"}
      </button>
      {typeOpen ? (
        <fieldset className="nx-scale">
          <legend className="nx-kicker">Skala</legend>
          {SCALES.map((scale) => (
            <label key={scale}>
              <input
                type="radio"
                name="scale"
                checked={textScale === scale}
                onChange={() => setTextScale(scale)}
              />
              <span>{Math.round(scale * 100)}%</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <div className="nx-dock">
        <button type="button" className="nx-btn nx-btn-primary nx-btn-block" onClick={() => finish(mode, theme)}>
          Tak chcę zacząć
        </button>
        <p className="nx-fine">
          Niezależny prototyp z fikcyjnymi danymi.
        </p>
      </div>
    </div>
  );
}
