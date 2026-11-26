import { GLYPH_PATHS, type GlyphName } from "./glyph-paths";

export type { GlyphName };

type Props = {
  name: GlyphName;
  selected?: boolean;
  className?: string;
};

export function Glyph({ name, selected = false, className }: Props) {
  return (
    <svg
      className={className ? `nx-glyph ${className}` : "nx-glyph"}
      data-selected={selected ? "true" : undefined}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={selected ? 2.2 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: GLYPH_PATHS[name] }}
    />
  );
}
