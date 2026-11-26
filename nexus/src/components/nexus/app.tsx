import { useEffect, useLayoutEffect, useRef } from "react";
import { civicDay } from "@/lib/nexus/format";
import { useNexus, useNexusHydrated } from "@/lib/nexus/store";
import { DocumentDetail, DocumentList } from "./documents";
import { AgencyScreen, CivicCaseDetail, CivicDocumentDetail, CivicNotifications } from "./civic/shared";
import { civicId } from "./civic/navigation";
import { DemoDock } from "./demo-dock";
import { DriverHub, HealthHub, Profile, ServiceCatalog } from "./hubs";
import type { DemoStoryId } from "@/lib/nexus/types";
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
import { MoreSheet, Orbit, SideNav, TabBar, Toast, TopBar } from "./shell";

const scrolls = new Map<string, number>();

function useGlobalKeys() {
  const setOrbit = useNexus((s) => s.setOrbit);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOrbit(true);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setOrbit(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOrbit]);
}

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
  if (view === "urzad") return <AgencyScreen id={id ?? ""} />;
  if (view === "powiadomienia") return <CivicNotifications initial={id} />;
  if (view === "sprawa" && id && civicId(id)) return <CivicCaseDetail id={id} />;
  if (view === "pismo" && id && civicId(id)) return <CivicDocumentDetail id={id} />;
  if (view === "uslugi") return <ServiceCatalog />;
  if (view === "zdrowie") return <HealthHub section={id} />;
  if (view === "kierowca") return <DriverHub section={id} />;
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
        <strong>mObywatel</strong>
        <small>NEXUS</small>
      </p>
      <p className="nx-fine">Niezależny prototyp konkursowy</p>
    </div>
  );
}

function Live() {
  const onboarded = useNexus((s) => s.onboarded);
  const finishOnboarding = useNexus((s) => s.finishOnboarding);
  const startDemoStory = useNexus((s) => s.startDemoStory);
  const demoStoryId = useNexus((s) => s.demoStoryId);
  const view = useNexus((s) => s.view);
  const id = useNexus((s) => s.selectedId);
  const key = ["sprawy", "pisma", "powiadomienia"].includes(view) ? view : `${view}:${id ?? ""}`;
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const demoBooted = useRef(false);
  useGlobalKeys();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get("demo");
    if (
      !demoBooted.current &&
      (demoParam === "student" || demoParam === "senior" || demoParam === "letter" || demoParam === "wallet")
    ) {
      demoBooted.current = true;
      startDemoStory(demoParam as DemoStoryId);
      return;
    }
    if (!onboarded && params.get("autostart") === "1") {
      finishOnboarding("daily", "porcelain");
    }
  }, [onboarded, finishOnboarding, startDemoStory]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({
      top: view === "sprawa" && id?.startsWith("plan-") ? 0 : scrolls.get(key) ?? 0,
      behavior: "instant",
    });
    return () => {
      scrolls.set(key, el.scrollTop);
    };
  }, [key, view, id]);

  useLayoutEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [demoStoryId]);

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
          {onboarded && demoStoryId ? <DemoDock /> : null}
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
