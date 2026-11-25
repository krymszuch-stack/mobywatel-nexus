import { GLYPH_PATHS, SELECTED_MARK, type GlyphName } from "./glyph-paths";

export type { GlyphName };

type Props = {
  name: GlyphName;
  selected?: boolean;
  className?: string;
};

export function Glyph({ name, selected = false, className }: Props) {
  const html = `${GLYPH_PATHS[name]}${selected ? SELECTED_MARK : ""}`;
  return (
    <svg
      className={className ? `nx-glyph ${className}` : "nx-glyph"}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={selected ? 1.75 : 1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
