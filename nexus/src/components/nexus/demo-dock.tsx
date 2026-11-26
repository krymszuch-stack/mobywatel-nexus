import { DEMO_STORIES, demoStoryById, getActivePersona, type DemoStep } from "@/lib/nexus/demo-stories";
import { useNexus } from "@/lib/nexus/store";
import { Glyph } from "./glyph";
import { Status } from "./ui";

export function DemoDock() {
  const state = useNexus();
  const story = demoStoryById(state.demoStoryId);
  if (!story) return null;

  const persona = getActivePersona(state.activePersona);
  const completedCount = story.steps.filter((step) => step.isDone(state)).length;
  const totalSteps = story.steps.length;
  const allDone = completedCount === totalSteps;

  const runStepAction = (step: DemoStep) => {
    const act = step.action;
    if (act.type === "orbit") {
      state.setOrbit(true, act.query);
      return;
    }
    if (act.type === "view") {
      state.go(act.view, act.selectedId);
      return;
    }
    if (act.type === "saved_plan") {
      const match = Object.values(state.savedPlans).find((p) =>
        p.intents.includes(act.intentMatch as never),
      );
      if (match) {
        state.go("sprawa", match.id);
      } else {
        state.setOrbit(true, story.prompt);
      }
    }
  };

  if (state.demoMinimized) {
    return (
      <aside className="nx-demo-dock nx-demo-dock-min" aria-label="Tryb prezentacji (zwinięty)">
        <div className="nx-demo-head">
          <span className="nx-kicker">
            Prezentacja 90 s · {story.shortLabel} ({completedCount}/{totalSteps})
          </span>
          <div className="nx-actions">
            <button
              type="button"
              className="nx-btn"
              onClick={() => state.setDemoMinimized(false)}
            >
              Rozwiń przewodnik
            </button>
            <button
              type="button"
              className="nx-btn"
              onClick={() => {
                state.exitDemoMode();
                state.showToast("Zakończono tryb prezentacji — przywrócono profil domyślny");
              }}
            >
              Zakończ
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="nx-demo-dock" aria-label="Tryb prezentacji OneFlow (90 sekund)">
      <div className="nx-demo-head">
        <div>
          <p className="nx-kicker">
            Tryb prezentacji (90 s) · {persona.given} {persona.family} — {persona.roleLabel}
          </p>
          <strong>
            {story.title} · ok. {story.seconds} s
          </strong>
        </div>
        <div className="nx-actions">
          <Status tone={allDone ? "ok" : "info"}>
            {completedCount}/{totalSteps} kroków
          </Status>
          <button
            type="button"
            className="nx-btn"
            onClick={() => state.setDemoMinimized(true)}
          >
            Zwiń
          </button>
          <button
            type="button"
            className="nx-btn"
            onClick={() => {
              state.resetDemoStory();
              state.showToast("Zresetowano stan bieżącej historii");
            }}
          >
            Zresetuj historię
          </button>
          <button
            type="button"
            className="nx-btn"
            onClick={() => {
              state.exitDemoMode();
              state.showToast("Zakończono tryb prezentacji — przywrócono profil domyślny");
            }}
          >
            Zakończ
          </button>
        </div>
      </div>

      <div className="nx-demo-tabs" role="tablist" aria-label="Wybierz historię demonstracyjną">
        {DEMO_STORIES.map((item) => {
          const active = item.id === story.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className="nx-chip"
              onClick={() => {
                state.startDemoStory(item.id);
                state.showToast(`Uruchomiono historię: ${item.title}`);
              }}
            >
              {item.shortLabel} ({item.seconds} s)
            </button>
          );
        })}
      </div>

      <p className="nx-fine">{story.summary} Postęp oznacza się wyłącznie po realnych zmianach stanu aplikacji.</p>

      <ol className="nx-demo-steps">
        {story.steps.map((step, index) => {
          const done = step.isDone(state);
          return (
            <li key={step.id} data-done={done ? "true" : "false"}>
              <div className="nx-demo-step-copy">
                <span className="nx-demo-step-mark" aria-hidden="true">
                  {done ? <Glyph name="check" /> : index + 1}
                </span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.hint}</small>
                </div>
              </div>
              <button
                type="button"
                className={done ? "nx-btn" : "nx-btn nx-btn-primary"}
                onClick={() => runStepAction(step)}
              >
                {step.actionLabel}
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function DemoLauncher() {
  const startDemoStory = useNexus((s) => s.startDemoStory);
  const demoStoryId = useNexus((s) => s.demoStoryId);
  const showToast = useNexus((s) => s.showToast);

  if (demoStoryId) return null;

  return (
    <section className="nx-sheet nx-section" aria-label="Opcjonalny tryb prezentacji 90 sekund">
      <div className="nx-sectionhead">
        <p className="nx-kicker">Opcjonalny przewodnik · 90 sekund</p>
        <Status tone="info">4 historie</Status>
      </div>
      <h2>Poznaj 4 historie obywatelskie (OneFlow)</h2>
      <p className="nx-fine">
        Fikcyjne persony (Student, Seniorka, Obywatel z pismem, Utrata portfela) i realne przejścia stanu bez udawanego postępu. Możesz wyłączyć lub zresetować w każdej chwili.
      </p>
      <div className="nx-chips">
        {DEMO_STORIES.map((story) => (
          <button
            key={story.id}
            type="button"
            className="nx-chip"
            onClick={() => {
              startDemoStory(story.id);
              showToast(`Tryb prezentacji: ${story.title}`);
            }}
          >
            {story.shortLabel}: {story.title}
          </button>
        ))}
      </div>
    </section>
  );
}
