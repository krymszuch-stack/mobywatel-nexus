# UI_CONTRACT

Wiążący kontrakt dla zmian w mObywatel NEXUS. Aplikacja ma być natychmiast rozpoznawalna jako współczesna polska aplikacja obywatelska mObywatel nowej generacji.

## Hierarchia i kierunek

1. **Marka główna:** `mObywatel` (IBM Plex Sans 700, `#14243B`) + dyskretny dopisek `NEXUS`.
2. **Inteligencja pod spodem:** `OneFlow` — wspólny stan obywatela i koordynacja spraw.
3. **Asystent obywatelski:** `W czym mogę pomóc?` — zintegrowana funkcja użyteczności publicznej, nie odrębny „produkt AI” ani motyw astronomiczny.
4. **Dziedzictwo kontekstowe:** polskie motywy graficzne (~3.5% krycia) wyłącznie w tematycznie uzasadnionych widokach (edukacja, zdrowie, sprawy lokalne, pisma urzędowe).

## Zakazane

- Biblioteki ikon (Lucide, Heroicons, Material Icons) oraz emoji jako ikony.
- Symbolika orbitalna/astronomiczna w głównym nagłówku, nawigacji lub usługach niezwiązanych z edukacją.
- Szampańskie złoto, luksusowa estetyka bankowa, fioletowe gradienty „AI”, szkło i przypadkowe cienie.
- Godło, orzeł, pieczęcie państwowe, flaga jako tło ekranu, skany banknotów, prawdziwe kody QR lub niezweryfikowane obrazy z plansz referencyjnych.
- Obowiązkowe klucze API, konta, zewnętrzne bazy danych i zależności uruchomieniowe Grok.
- Angielskie nazwy modułów i wielokrotne powtarzanie prefiksu „NEXUS” przed każdą funkcją.

## Obowiązkowe

- Trzy motywy: `porcelain` (`#F3F5F8` / `#FFFFFF` / `#14243B` / `#1558C0` / `#DC143C`), `midnight` (`#0B1220`), `contrast` (`#FFFFFF` / `#000000`, `0px` radius, `2px` obrys, brak znaków wodnych).
- Kontrolowane zaokrąglenia: karty główne `12–16px`, kontrolki `10px` lub kapsułowe, karta dokumentu ze ściętym rogiem i dyskretną polską linią `#DC143C`.
- Trzy tryby startu: `simple` (Prosto i wygodnie), `daily` (Na co dzień), `dense` (Wszystko pod ręką).
- Typografia: IBM Plex Sans dla nagłówków (`700`, `text-wrap: balance`), nawigacji i tekstu; IBM Plex Serif oszczędnie (np. cytaty pism).
- Ikony wyłącznie z `src/components/nexus/glyph-paths.ts` (kopie w `public/glyphs/`).
- Znak biało-czerwony `Mark` oraz kontekstowe znaki wodne wyłącznie z `src/components/nexus/heritage.tsx`.
- Jeden kanoniczny stan w `useNexus` (`src/lib/nexus/store.ts`, `localStorage`, klucz `nexus-pref`) z wersjonowaną migracją i czystą warstwą logiki (`oneflow.ts`, `orbit-match.ts`).
- Każda operacja o skutkach urzędowych jest jawnie oznaczona jako symulacja prototypu (`UPO-WZÓR`), wymaga potwierdzenia i pozostaje lokalnie na urządzeniu.
- Oficjalne zewnętrzne linki urzędowe (`pacjent.gov.pl`, `gov.pl`, `zus.pl`, `podatki.gov.pl`, `info.mobywatel.gov.pl`) oraz `tel:` są jawnie oznaczone jako przejście poza prototyp.
- Napis `WZÓR` i informacja o niezależnym prototypie konkursowym pozostają widoczne.
- Fokus `:focus-visible` 3 px. Ruch szanuje `prefers-reduced-motion` i ustawienie „Ogranicz ruch”.
- Cel dotykowy co najmniej 44 px (56 px dla głównych akcji w trybie prostym).

## Mapa polskich nazw

| Unikaj | Używaj |
| --- | --- |
| Orbit / AI Assistant | W czym mogę pomóc? (zakładka: Pomoc) |
| Citizen Dashboard / Pulpit | Start |
| Smart Inbox | Moje pisma (`e-Doręczenia`) |
| Cases | Moje sprawy |
| Life Events / Załatw sprawę | Ważne zmiany w życiu |
| Benefits Radar | Możliwe wsparcie |
| Civic Timeline | Moja oś czasu |
| Privacy Lens / Kto widział dane | Dostęp do moich danych |
| Identity Shield / Bezpieczeństwo | Ochrona tożsamości |
| Trusted Person | Osoba zaufana |

## Chronione fundamenty

`src/styles.css`, `src/lib/nexus/store.ts`, `src/lib/nexus/oneflow.ts`, `src/lib/nexus/registry.ts`, `src/components/nexus/glyph.tsx`, `src/components/nexus/heritage.tsx`, `src/routes/__root.tsx`.
