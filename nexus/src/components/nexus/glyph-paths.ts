export const GLYPH_NAMES = [
  "start",
  "documents",
  "letter",
  "case",
  "orbit",
  "search",
  "more",
  "identity",
  "wheel",
  "vehicle",
  "points",
  "passport",
  "family",
  "health",
  "education",
  "housing",
  "work",
  "support",
  "calendar",
  "timeline",
  "shield",
  "alert",
  "key",
  "eye",
  "profile",
  "trusted",
  "signpost",
  "sliders",
  "sun",
  "moon",
  "contrast",
  "check",
  "close",
  "back",
  "forward",
  "expand",
  "filter",
  "code",
  "share",
  "bell",
  "pin",
  "draft",
  "location",
  "institution",
  "child",
  "emergency",
  "download",
  "lock",
  "info",
  "menu",
  "plus",
  "clock",
  "school",
  "court",
] as const;

export type GlyphName = (typeof GLYPH_NAMES)[number];

/**
 * mObywatel NEXUS Civic Glyphs — bespoke 24×24 duotone Polish civic icon family.
 * Designed for instant physical-object recognition, especially for senior citizens:
 * confident rounded strokes (1.9px / 2.2px selected) + soft semantic interior tint (.nx-g-fill).
 */
export const GLYPH_PATHS: Record<GlyphName, string> = {
  court: `<path class="nx-g-fill" d="M3 9 12 4l9 5v2H3zM4 18h16v2H4z"/><path d="M3 9 12 4l9 5v2H3zM4 18h16v2H4zM6 11v7m4-7v7m4-7v7m4-7v7"/>`,

  // Sturdy house with roof, chimney and front door
  start: `<path class="nx-g-fill" d="M5.5 11.2 12 5.4l6.5 5.8V20h-13z"/><path d="M3.2 11.6 12 4l8.8 7.6"/><path d="M5.6 9.8V19.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9V9.8"/><path d="M10 20.5v-5.2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5.2"/><path d="M16.5 4.8v2.6"/>`,

  // Wallet with card peeking out and side clasp — unmistakable "Portfel dokumentów"
  documents: `<rect class="nx-g-fill" x="3.2" y="7.4" width="17.6" height="12.6" rx="2.4"/><path d="M6.4 7.4V5.6a1.6 1.6 0 0 1 1.6-1.6h8.2a1.6 1.6 0 0 1 1.6 1.6v1.8"/><rect x="3.2" y="7.4" width="17.6" height="12.6" rx="2.4"/><path d="M15.2 11.8h5.6v3.8h-5.6a1.9 1.9 0 0 1 0-3.8z"/><circle cx="16.4" cy="13.7" r="0.85" fill="currentColor" stroke="none"/>`,

  // Sealed postal envelope with bold flap
  letter: `<rect class="nx-g-fill" x="2.8" y="5.4" width="18.4" height="13.2" rx="2"/><rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2"/><path d="m3.4 6.4 8.6 6.7 8.6-6.7"/><path d="m3.6 17.6 5.2-4.8M20.4 17.6l-5.2-4.8"/>`,

  // Official paper folder with tab and document lines
  case: `<path class="nx-g-fill" d="M3 7.2a1.8 1.8 0 0 1 1.8-1.8h4.4l2 2.2h8a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.8z"/><path d="M3 7.2a1.8 1.8 0 0 1 1.8-1.8h4.4l2 2.2h8a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.8z"/><path d="M7.5 12.6h9M7.5 15.8h5.8"/>`,

  // Friendly speech bubble with bold "?" — instant association for "Pomoc / W czym mogę pomóc?"
  orbit: `<path class="nx-g-fill" d="M12 3.4c5 0 9 3.4 9 7.7 0 4.2-4 7.6-9 7.6-1.3 0-2.6-.25-3.7-.7L4 19.8l1.2-3.7A7.2 7.2 0 0 1 3 11.1c0-4.3 4-7.7 9-7.7z"/><path d="M12 3.4c5 0 9 3.4 9 7.7 0 4.2-4 7.6-9 7.6-1.3 0-2.6-.25-3.7-.7L4 19.8l1.2-3.7A7.2 7.2 0 0 1 3 11.1c0-4.3 4-7.7 9-7.7z"/><path d="M9.7 9.3a2.35 2.35 0 1 1 3.7 1.9c-.85.55-1.4 1.05-1.4 2"/><circle cx="12" cy="15.7" r="1.05" fill="currentColor" stroke="none"/>`,

  // Classic magnifying glass for catalog search input
  search: `<circle class="nx-g-fill" cx="10.6" cy="10.6" r="6.4"/><circle cx="10.6" cy="10.6" r="6.4"/><path d="m15.4 15.4 5 5"/>`,

  // 2×2 bold rounded service tiles grid — unmistakable "Wszystkie usługi"
  more: `<rect class="nx-g-fill" x="3.6" y="3.6" width="6.8" height="6.8" rx="1.7"/><rect class="nx-g-fill" x="13.6" y="13.6" width="6.8" height="6.8" rx="1.7"/><rect x="3.6" y="3.6" width="6.8" height="6.8" rx="1.7"/><rect x="13.6" y="3.6" width="6.8" height="6.8" rx="1.7"/><rect x="3.6" y="13.6" width="6.8" height="6.8" rx="1.7"/><rect x="13.6" y="13.6" width="6.8" height="6.8" rx="1.7"/>`,

  // Polish mDowód ID card with framed portrait and clear data lines
  identity: `<rect class="nx-g-fill" x="2.6" y="4.8" width="18.8" height="14.4" rx="2.2"/><rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.2"/><circle cx="8.1" cy="10.4" r="2.05"/><path d="M5.1 16.2c.45-1.9 1.55-2.8 3-2.8s2.55.9 3 2.8"/><path d="M13.6 9.4h4.8M13.6 12.4h4.8M13.6 15.4h3.2"/>`,

  // Car steering wheel — unmistakable "mPrawo jazdy" (distinct from Moje pojazdy)
  wheel: `<circle class="nx-g-fill" cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="2.3"/><path d="M4 10.6h5.7M14.3 10.6H20M12 14.3v6.2"/>`,

  // Friendly front-view passenger car with windshield, headlights & wheels
  vehicle: `<path class="nx-g-fill" d="M5.2 11.4 7 6.5a1.8 1.8 0 0 1 1.7-1.2h6.6a1.8 1.8 0 0 1 1.7 1.2l1.8 4.9H5.2z"/><path class="nx-g-fill" d="M3.6 11.4h16.8a1.4 1.4 0 0 1 1.4 1.4v4.4a1.2 1.2 0 0 1-1.2 1.2H3.4a1.2 1.2 0 0 1-1.2-1.2v-4.4a1.4 1.4 0 0 1 1.4-1.4z"/><path d="M5.2 11.4 7 6.5a1.8 1.8 0 0 1 1.7-1.2h6.6a1.8 1.8 0 0 1 1.7 1.2l1.8 4.9"/><rect x="2.8" y="11.4" width="18.4" height="6.8" rx="1.6"/><path d="M5.6 18.2v2.2M18.4 18.2v2.2"/><circle cx="6.8" cy="14.8" r="1.15" fill="currentColor" stroke="none"/><circle cx="17.2" cy="14.8" r="1.15" fill="currentColor" stroke="none"/><path d="M10.2 15.2h3.6"/>`,

  // Speedometer dial with needle — instant association for "Punkty karne"
  points: `<path class="nx-g-fill" d="M3.4 16.8a8.6 8.6 0 1 1 17.2 0z"/><path d="M3.4 16.8a8.6 8.6 0 1 1 17.2 0"/><path d="M3 16.8h18"/><path d="M12 8.4v2M6.8 11.2l1.4 1.4M17.2 11.2l-1.4 1.4"/><path d="m12 16.4 4.2-4.4"/><circle cx="12" cy="16.6" r="1.5" fill="currentColor" stroke="none"/>`,

  // Passport booklet with globe and biometric mark
  passport: `<rect class="nx-g-fill" x="5" y="3.2" width="14" height="17.6" rx="1.8"/><rect x="5" y="3.2" width="14" height="17.6" rx="1.8"/><circle cx="12" cy="10.4" r="3.4"/><path d="M8.6 10.4h6.8M12 7v6.8M8.8 17h6.4"/>`,

  // Family: two figures side-by-side
  family: `<circle class="nx-g-fill" cx="8.8" cy="7.8" r="2.4"/><path class="nx-g-fill" d="M3.8 19.6c.5-3.2 2.2-4.9 5-4.9s4.5 1.7 5 4.9z"/><circle cx="8.8" cy="7.8" r="2.4"/><circle cx="15.8" cy="9" r="1.95"/><path d="M3.8 19.6c.5-3.2 2.2-4.9 5-4.9 1.6 0 2.9.6 3.7 1.7"/><path d="M13 16.2c.7-1.1 1.9-1.8 3.3-1.8 2.1 0 3.6 1.4 4 4.1"/>`,

  // Bold medical cross — instant recognition for "Zdrowie (mojeIKP)"
  health: `<path class="nx-g-fill" d="M9.2 4.2a1.2 1.2 0 0 1 1.2-1.2h3.2a1.2 1.2 0 0 1 1.2 1.2v5h5a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-1.2 1.2h-5v5a1.2 1.2 0 0 1-1.2 1.2h-3.2a1.2 1.2 0 0 1-1.2-1.2v-5h-5A1.2 1.2 0 0 1 3 13.6v-3.2a1.2 1.2 0 0 1 1.2-1.2h5z"/><path d="M9.2 4.2a1.2 1.2 0 0 1 1.2-1.2h3.2a1.2 1.2 0 0 1 1.2 1.2v5h5a1.2 1.2 0 0 1 1.2 1.2v3.2a1.2 1.2 0 0 1-1.2 1.2h-5v5a1.2 1.2 0 0 1-1.2 1.2h-3.2a1.2 1.2 0 0 1-1.2-1.2v-5h-5A1.2 1.2 0 0 1 3 13.6v-3.2a1.2 1.2 0 0 1 1.2-1.2h5z"/>`,

  // Graduation mortarboard cap with tassel
  education: `<path class="nx-g-fill" d="M2.6 8.8 12 4.6l9.4 4.2-9.4 4.2z"/><path d="M2.6 8.8 12 4.6l9.4 4.2-9.4 4.2z"/><path d="M6.4 10.6v5.2c1.6 1.4 3.5 2.1 5.6 2.1s4-.7 5.6-2.1v-5.2"/><path d="M20.2 9.4v5.6"/>`,

  // House with window — housing / address
  housing: `<path class="nx-g-fill" d="M5.6 11 12 5.4 18.4 11V20H5.6z"/><path d="M3.4 11.4 12 4l8.6 7.4"/><path d="M5.6 9.8V20h12.8V9.8"/><rect x="9.6" y="13.4" width="4.8" height="4.2" rx="0.6"/>`,

  // Briefcase — work / employment
  work: `<rect class="nx-g-fill" x="3.2" y="8" width="17.6" height="12" rx="2"/><rect x="3.2" y="8" width="17.6" height="12" rx="2"/><path d="M8.8 8V6a1.4 1.4 0 0 1 1.4-1.4h3.6A1.4 1.4 0 0 1 15.2 6v2"/><path d="M3.2 13h17.6"/><path d="M10.5 13v2h3v-2"/>`,

  // Warm heart with plus — unmistakable "Wsparcie / Emerytura i świadczenia"
  support: `<path class="nx-g-fill" d="M12 20.6c-4.7-3-8.2-6.1-8.2-10a4.6 4.6 0 0 1 8.2-2.9 4.6 4.6 0 0 1 8.2 2.9c0 3.9-3.5 7-8.2 10z"/><path d="M12 20.6c-4.7-3-8.2-6.1-8.2-10a4.6 4.6 0 0 1 8.2-2.9 4.6 4.6 0 0 1 8.2 2.9c0 3.9-3.5 7-8.2 10z"/><path d="M12 9.6v5M9.5 12.1h5"/>`,

  // Calendar with top bar and rings
  calendar: `<path class="nx-g-fill" d="M4.2 5.4h15.6v4.4H4.2z"/><rect x="4.2" y="5.4" width="15.6" height="15" rx="2"/><path d="M4.2 9.8h15.6"/><path d="M8.4 3.2v4M15.6 3.2v4"/><path d="M8.2 13.8h2.2M13.6 13.8h2.2M8.2 17h2.2"/>`,

  // Calendar + clock badge — instant association for "Moja oś czasu" (terminy i historia)
  timeline: `<path class="nx-g-fill" d="M3.6 5.2h13.6v4H3.6z"/><circle class="nx-g-fill" cx="16.4" cy="16.4" r="4.8"/><path d="M10.8 19H5.4a1.8 1.8 0 0 1-1.8-1.8V7a1.8 1.8 0 0 1 1.8-1.8h10a1.8 1.8 0 0 1 1.8 1.8v2.6"/><path d="M3.6 9.2h13.6M7.4 3.2v3.6M13.4 3.2v3.6"/><circle cx="16.4" cy="16.4" r="4.8"/><path d="M16.4 13.9v2.5l1.7 1.1"/>`,

  // Civic shield with checkmark — unmistakable "Ochrona tożsamości"
  shield: `<path class="nx-g-fill" d="M12 3 20 6.2v5.8c0 4.6-3.2 7.5-8 9-4.8-1.5-8-4.4-8-9V6.2z"/><path d="M12 3 20 6.2v5.8c0 4.6-3.2 7.5-8 9-4.8-1.5-8-4.4-8-9V6.2z"/><path d="m8.8 12.1 2.2 2.3 4.5-4.6"/>`,

  // Warning triangle with exclamation mark
  alert: `<path class="nx-g-fill" d="M12 3.8 21 19.6H3z"/><path d="M10.8 4.6 3.2 18a1.4 1.4 0 0 0 1.2 2.1h15.2a1.4 1.4 0 0 0 1.2-2.1L13.2 4.6a1.4 1.4 0 0 0-2.4 0z"/><path d="M12 9.6v4.8"/><circle cx="12" cy="17.1" r="1.05" fill="currentColor" stroke="none"/>`,

  // Physical key
  key: `<circle class="nx-g-fill" cx="7.8" cy="12" r="3.6"/><circle cx="7.8" cy="12" r="3.6"/><path d="M11.4 12h9.2M17.2 12v3M20.2 12v2.2"/>`,

  // Wide clear eye with iris & solid pupil — "Dostęp do moich danych"
  eye: `<path class="nx-g-fill" d="M2.2 12S6.2 6.2 12 6.2 21.8 12 21.8 12 17.8 17.8 12 17.8 2.2 12 2.2 12z"/><path d="M2.2 12S6.2 6.2 12 6.2 21.8 12 21.8 12 17.8 17.8 12 17.8 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/>`,

  // Single warm portrait bust — unmistakable "Mój profil"
  profile: `<circle class="nx-g-fill" cx="12" cy="8.2" r="3.6"/><path class="nx-g-fill" d="M5 19.8c.7-3.6 3.1-5.4 7-5.4s6.3 1.8 7 5.4z"/><circle cx="12" cy="8.2" r="3.6"/><path d="M5 19.8c.7-3.6 3.1-5.4 7-5.4s6.3 1.8 7 5.4"/>`,

  // Person + warm heart badge — unmistakable "Osoba zaufana" (bliska osoba, nie kłódka!)
  trusted: `<circle class="nx-g-fill" cx="8.6" cy="8" r="2.8"/><path class="nx-g-fill" d="M17.5 19.4c-2.2-1.4-3.8-2.9-3.8-4.7a2.15 2.15 0 0 1 3.8-1.35 2.15 2.15 0 0 1 3.8 1.35c0 1.8-1.6 3.3-3.8 4.7z"/><circle cx="8.6" cy="8" r="2.8"/><path d="M3.4 19.6c.5-3.3 2.3-5.1 5.2-5.1 1.4 0 2.6.45 3.4 1.3"/><path d="M17.5 19.4c-2.2-1.4-3.8-2.9-3.8-4.7a2.15 2.15 0 0 1 3.8-1.35 2.15 2.15 0 0 1 3.8 1.35c0 1.8-1.6 3.3-3.8 4.7z"/>`,

  // Two-way directional signpost — instant association for "Ważne zmiany w życiu"
  signpost: `<path class="nx-g-fill" d="M5.2 5.4h12.2l2.6 2.4-2.6 2.4H5.2z"/><path class="nx-g-fill" d="M18.8 12.2H6.6L4 14.6 6.6 17h12.2z"/><path d="M12 3v2.4M12 10.2v2M12 17v4.2"/><path d="M5.2 5.4h12.2l2.6 2.4-2.6 2.4H5.2z"/><path d="M18.8 12.2H6.6L4 14.6 6.6 17h12.2z"/>`,

  // Iconic "Aa" typography glyph — seniors immediately read "Wygląd i wielkość liter"
  sliders: `<rect class="nx-g-fill" x="2.8" y="4.2" width="18.4" height="15.6" rx="2.6"/><path d="M4.2 17.4 8.2 6.6l4 10.8M5.5 14.2h5.4"/><path d="M19.4 17.4v-4.8a2.3 2.3 0 0 0-4.3-1.1"/><circle cx="17.1" cy="15.2" r="2.2"/>`,

  sun: `<circle class="nx-g-fill" cx="12" cy="12" r="3.8"/><circle cx="12" cy="12" r="3.8"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9 5.4 18.6"/>`,
  moon: `<path class="nx-g-fill" d="M15 3.6A7.8 7.8 0 1 0 20.4 14.2 6.1 6.1 0 0 1 15 3.6z"/><path d="M15 3.6A7.8 7.8 0 1 0 20.4 14.2 6.1 6.1 0 0 1 15 3.6z"/>`,
  contrast: `<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" stroke="none"/>`,
  check: `<path d="M4.5 12.4 9.5 17.4 19.6 7"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  back: `<path d="M15 5 8 12l7 7"/>`,
  forward: `<path d="M9 5l7 7-7 7"/>`,
  expand: `<path d="M5.8 9.2 12 15.2l6.2-6"/>`,
  filter: `<path class="nx-g-fill" d="M3.6 4.8h16.8l-6.2 7.2v7l-4.4-2.2V12z"/><path d="M3.6 4.8h16.8l-6.2 7.2v7l-4.4-2.2V12z"/>`,
  code: `<rect class="nx-g-fill" x="4" y="4" width="6" height="6" rx="1"/><rect class="nx-g-fill" x="14" y="4" width="6" height="6" rx="1"/><rect class="nx-g-fill" x="4" y="14" width="6" height="6" rx="1"/><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 14H20v2.5h-2.5zM14 17.5h2.5V20H14zM17.8 18.8H20"/>`,
  share: `<circle class="nx-g-fill" cx="6" cy="12" r="2.3"/><circle class="nx-g-fill" cx="17.6" cy="6.4" r="2.3"/><circle class="nx-g-fill" cx="17.6" cy="17.6" r="2.3"/><circle cx="6" cy="12" r="2.3"/><circle cx="17.6" cy="6.4" r="2.3"/><circle cx="17.6" cy="17.6" r="2.3"/><path d="m8.1 11 7.4-3.6M8.1 13l7.4 3.6"/>`,
  bell: `<path class="nx-g-fill" d="M5.6 16.6h12.8l-1.5-2.2V10a4.9 4.9 0 0 0-9.8 0v4.4z"/><path d="M5.6 16.6h12.8l-1.5-2.2V10a4.9 4.9 0 0 0-9.8 0v4.4z"/><path d="M9.8 16.6a2.2 2.2 0 0 0 4.4 0"/><path d="M12 3.2v1.8"/>`,
  pin: `<path class="nx-g-fill" d="m12 3.4 4.3 6.2-4.3 3.2-4.3-3.2z"/><path d="M12 21v-8.2"/><path d="m12 3.4 4.3 6.2-4.3 3.2-4.3-3.2z"/>`,
  draft: `<path class="nx-g-fill" d="M4.4 19.6 6.2 14.4 16.4 4.2l3.4 3.4-10.2 10.2z"/><path d="M4.4 19.6 6.2 14.4 16.4 4.2l3.4 3.4-10.2 10.2z"/><path d="m14.1 6.5 3.4 3.4"/>`,
  location: `<path class="nx-g-fill" d="M12 21s-6.6-6.2-6.6-11.2a6.6 6.6 0 0 1 13.2 0C18.6 14.8 12 21 12 21z"/><path d="M12 21s-6.6-6.2-6.6-11.2a6.6 6.6 0 0 1 13.2 0C18.6 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.1"/>`,
  institution: `<path class="nx-g-fill" d="M3.2 9.6h17.6L12 3.8z"/><path d="M3.2 19.8h17.6"/><path d="M5.8 19.8V9.6M9.9 19.8V9.6M14.1 19.8V9.6M18.2 19.8V9.6"/><path d="M3.2 9.6h17.6L12 3.8z"/>`,
  child: `<circle class="nx-g-fill" cx="12" cy="7.6" r="2.8"/><circle cx="12" cy="7.6" r="2.8"/><path d="M6.6 19.8c.5-3.4 2.3-5.2 5.4-5.2s4.9 1.8 5.4 5.2"/>`,
  emergency: `<path class="nx-g-fill" d="M7.8 14.8h8.4l-1.5-6.2H9.3z"/><path d="M7.8 14.8h8.4l-1.5-6.2H9.3z"/><rect x="4.8" y="14.8" width="14.4" height="3.8" rx="1"/><path d="M12 3.2v2.4M4.4 8l1.8 1.2M19.6 8l-1.8 1.2"/>`,
  download: `<path d="M12 4v10.4"/><path d="m7.2 10.4 4.8 4.8 4.8-4.8"/><path d="M4.6 19.4h14.8"/>`,

  // Heavy sturdy padlock with keyhole — unmistakable "Zastrzeż PESEL"
  lock: `<rect class="nx-g-fill" x="5.6" y="10.4" width="12.8" height="9.8" rx="2.2"/><rect x="5.6" y="10.4" width="12.8" height="9.8" rx="2.2"/><path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6"/><circle cx="12" cy="14.4" r="1.25" fill="currentColor" stroke="none"/><path d="M12 15.2v2"/>`,

  info: `<circle class="nx-g-fill" cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.2"/><circle cx="12" cy="8.1" r="1.05" fill="currentColor" stroke="none"/>`,
  menu: `<path d="M4 7h16M4 12h16M4 17h11"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  clock: `<circle class="nx-g-fill" cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.4 2.2"/>`,
  school: `<path class="nx-g-fill" d="M5.8 10.4 12 5.4l6.2 5V20H5.8z"/><path d="M3.4 10.8 12 4.6l8.6 6.2"/><path d="M5.8 10.2V20h12.4v-9.8"/><path d="M10 20v-4.2h4V20"/><path d="M12 4.6V2.4M12 2.8h3.4"/>`,
};
