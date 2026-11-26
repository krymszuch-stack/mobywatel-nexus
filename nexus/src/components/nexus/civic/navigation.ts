import type { Agency, Target } from "@/lib/nexus/civic/model";
import { useNexus } from "@/lib/nexus/store";
import type { GlyphName } from "../glyph";

export const civicGlyph: Record<Agency, GlyphName> = {
  pfron: "support",
  zus: "institution",
  praca: "work",
  sady: "court",
};

export const civicId = (id: string) => /^DEMO-(pfron|zus|praca|sady)-/.test(id);

export function openTarget(target: Target) {
  const view = target.kind === "case" ? "sprawa" : target.kind === "document" ? "pismo" : "urzad";
  useNexus.getState().go(view, target.id);
}
