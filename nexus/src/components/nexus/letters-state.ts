import { LETTERS, type LetterItem } from "@/lib/nexus/data";

export type LetterPhase = "nowe" | "wymaga odpowiedzi" | "odpowiedziane" | "przeczytane";

export function letterPhase(
  letter: LetterItem,
  readIds: string[],
  replies: Record<string, string>,
): LetterPhase {
  if (replies[letter.id]) return "odpowiedziane";
  if (letter.needsReply && readIds.includes(letter.id)) return "wymaga odpowiedzi";
  if (letter.needsReply) return "wymaga odpowiedzi";
  if (!readIds.includes(letter.id)) return "nowe";
  return "przeczytane";
}

export function openLetterCount(readIds: string[], replies: Record<string, string>): number {
  return LETTERS.filter((letter) => {
    const phase = letterPhase(letter, readIds, replies);
    return phase === "nowe" || phase === "wymaga odpowiedzi";
  }).length;
}
