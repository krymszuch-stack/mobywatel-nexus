import { useEffect, useLayoutEffect, useRef } from "react";
import { civicDay } from "@/lib/nexus/format";
import { useNexus, useNexusHydrated } from "@/lib/nexus/store";
import { DocumentDetail, DocumentList } from "./documents";
import { DriverHub, HealthHub, Profile, ServiceCatalog } from "./hubs";
import { Home } from "./home";
import { LetterDetail, LetterList } from "./letters";
import { Mark } from "./heritage";
import { Onboarding } from "./onboarding";
import {
  AccessLog,
  Benefits,
  CaseDetail,
  CaseList,
  JourneyDetail,
  JourneyList,
  Security,
  Settings,
  Timeline,
  TrustedPerson,
} from "./services";
import { MoreSheet, Orbit, SideNav, TabBar, Toast, TopBar, useGlobalKeys } from "./shell";

const scrolls = new Map<string, number>();

function ThemeSync() {
  const theme = useNexus((s) => s.theme);
  const textScale = useNexus((s) => s.textScale);
  const motion = useNexus((s) => s.motion);
  const dayMode = useNexus((s) => s.dayMode);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.setProperty("--nx-scale", String(textScale));
    if (motion === "reduce") root.dataset.motion = "reduce";
    else delete root.dataset.motion;
    const day = civicDay(new Date(), dayMode);
    if (day) root.dataset.day = day;
    else delete root.dataset.day;
  }, [theme, textScale, motion, dayMode]);
  return null;
}

function Screen() {
  const view = useNexus((s) => s.view);
  const id = useNexus((s) => s.selectedId);
  if (view === "uslugi") return <ServiceCatalog />;
  if (view === "zdrowie") return <HealthHub />;
  if (view === "kierowca") return <DriverHub />;
  if (view === "profil") return <Profile />;
  if (view === "start") return <Home />;
  if (view === "dokumenty") return <DocumentList />;
  if (view === "dokument") return <DocumentDetail id={id ?? ""} />;
  if (view === "pisma") return <LetterList />;
  if (view === "pismo") return <LetterDetail id={id ?? ""} />;
  if (view === "sprawy") return <CaseList />;
  if (view === "sprawa") return <CaseDetail id={id ?? ""} />;
  if (view === "zalatw") return <JourneyList />;
  if (view === "zdarzenie") return <JourneyDetail id={id ?? ""} />;
  if (view === "wsparcie") return <Benefits />;
  if (view === "os") return <Timeline />;
  if (view === "bezpieczenstwo") return <Security />;
  if (view === "dostepy") return <AccessLog />;
  if (view === "zaufana") return <TrustedPerson />;
  return <Settings />;
}

export function NexusApp() {
  const ready = useNexusHydrated();
  if (!ready) return <Boot />;
  return (
    <>
      <ThemeSync />
      <Live />
    </>
  );
}

function Boot() {
  return (
    <div className="nx-boot">
      <Mark />
      <p className="nx-brand">
        <small>mObywatel</small>
        <strong>NEXUS</strong>
      </p>
      <p className="nx-fine">Prototyp konkursowy</p>
    </div>
  );
}

function Live() {
  const onboarded = useNexus((s) => s.onboarded);
  const view = useNexus((s) => s.view);
  const id = useNexus((s) => s.selectedId);
  const key = `${view}:${id ?? ""}`;
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useGlobalKeys();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = scrolls.get(key) ?? 0;
    return () => {
      scrolls.set(key, el.scrollTop);
    };
  }, [key]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const heading = ref.current?.querySelector("h1");
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1;
      heading.dataset.nxmove = "1";
      heading.focus({ preventScroll: true });
    }
  }, [key]);

  return (
    <div className="nx-shell">
      <a className="nx-skip" href="#tresc">
        Przejdź do treści
      </a>
      {onboarded ? <SideNav /> : null}
      <div className="nx-column">
        <div className="nx-headstack">
          <TopBar />
          <Toast />
        </div>
        <main className="nx-main" id="tresc" ref={ref} tabIndex={-1}>
          <div key={key} className="nx-view">
            {onboarded ? <Screen /> : <Onboarding />}
          </div>
        </main>
        {onboarded ? <TabBar /> : null}
      </div>
      <Orbit />
      <MoreSheet />
    </div>
  );
}
