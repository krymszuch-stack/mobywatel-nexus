export type ThemeName = "porcelain" | "midnight" | "contrast";
export type HomeMode = "simple" | "daily" | "dense";
export type MotionPref = "system" | "reduce";

export type ViewId =
  | "start"
  | "dokumenty"
  | "dokument"
  | "pisma"
  | "pismo"
  | "sprawy"
  | "sprawa"
  | "zalatw"
  | "zdarzenie"
  | "wsparcie"
  | "os"
  | "bezpieczenstwo"
  | "dostepy"
  | "zaufana"
  | "wyglad"
  | "uslugi"
  | "zdrowie"
  | "kierowca"
  | "profil";

export type Motif =
  | "rosette"
  | "fan"
  | "orbits"
  | "lattice"
  | "civic"
  | "manuscript"
  | "staff"
  | "lab";

export type Crumb = { view: ViewId; id?: string };
