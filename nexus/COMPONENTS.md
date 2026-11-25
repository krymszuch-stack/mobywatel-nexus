# Komponenty

Wszystko w `src/components/nexus/`.

| Plik | Rola |
| --- | --- |
| `glyph.tsx` | Ikona `Glyph` |
| `heritage.tsx` | `Mark`, `Watermark` |
| `ui.tsx` | `PageHead`, `Row`, `Status`, `ConfirmDialog`, `Fold`, `Missing` |
| `shell.tsx` | Pasek górny, boki, dół, Więcej, Orbita, toast, skróty |
| `onboarding.tsx` | Pierwsze uruchomienie |
| `home.tsx` | Trzy układy startu |
| `documents.tsx` | Portfel i karta wzoru |
| `letters.tsx` | Pisma i odpowiedź |
| `services.tsx` | Sprawy, ścieżki, wsparcie, oś, bezpieczeństwo, wglądy, osoba zaufana, wygląd |
| `app.tsx` | Składanie, motyw, przewijanie |

Stan: `src/lib/nexus/store.ts`.
Dane wzoru: `src/lib/nexus/data.ts`.
Dopasowanie poleceń: `src/lib/nexus/orbit-match.ts`.

Nie dokładaj drugiej biblioteki przycisków. Nowy widok dodaj do `Screen` w `app.tsx` i do nawigacji w `shell.tsx`.
