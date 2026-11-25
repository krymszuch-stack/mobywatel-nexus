# UI_CONTRACT

Wiążący kontrakt dla kolejnych agentów. Nie zastępuj identyfikacji wizualnej.

## Zakazane

- Lucide, Heroicons, Material Icons, emoji jako ikony.
- Fioletowe gradienty, szkło, miękkie cienie, promień powyżej 2 px (wyjątek: ścięty róg karty dokumentu).
- Orzeł, godło, pieczęcie, skany banknotów i prawdziwe kody dokumentów.
- Klucze API, konta, sieć poza `tel:`.
- Angielskie nazwy miejsc widoczne dla obywatela.
- Dane inne niż fikcyjna Zofia Helena Baran, o ile użytkownik nie poprosi o zmianę wzoru.

## Obowiązkowe

- Trzy motywy: `porcelain`, `midnight`, `contrast`. Kolory wyłącznie z [DESIGN_TOKENS.json](DESIGN_TOKENS.json).
- Trzy układy startu: `simple`, `daily`, `dense`.
- Ikony wyłącznie z `src/components/nexus/glyph-paths.ts` (kopie w `public/glyphs/`).
- Znaki wodne wyłącznie z `src/components/nexus/heritage.tsx`, klasa `.nx-mark`.
- Stan w `useNexus` (`localStorage`, klucz `nexus-pref`). Logika osobno od widoków.
- Każde „wysłanie” zostaje na urządzeniu i jest tak opisane.
- Napis WZÓR zostaje w nagłówku.
- Fokus `:focus-visible` 3 px. Ruch szanuje `prefers-reduced-motion` i ustawienie „Ogranicz ruch”.
- Cel dotykowy co najmniej 44 px.

## Mapa nazw

| Nie pisz | Pisz |
| --- | --- |
| Dashboard | Start |
| Smart Inbox | Moje pisma |
| Benefit Radar | Możliwe wsparcie |
| Civic Flow | Załatw sprawę |
| AI Assistant | W czym mogę pomóc? |

## Pliki, których nie rozbieraj

`src/styles.css`, `src/lib/nexus/store.ts`, `src/components/nexus/glyph.tsx`, `src/components/nexus/heritage.tsx`, `src/routes/__root.tsx` (zostaw mostek podglądu i dostawcę sesji szablonu).
