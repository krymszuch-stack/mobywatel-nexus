# Civic Glyphs — system ikon mObywatel NEXUS

Autorska rodzina ikon obywatelskich (bez Lucide, Heroicons, Material Icons i emoji). 54 znaki, siatka `24×24`, wyraziste, zaokrąglone linie (`1.9`, `2.2` w stanie wybranym) połączone z delikatnym dwutonowym podbiciem wnętrza (`.nx-g-fill` z kryciem `0.15` w Porcelanie, `0.22` w Północy, `0.24` w stanie aktywnym oraz `0` w motywie czarno-białym Kontrast).

- Źródło: `src/components/nexus/glyph-paths.ts`
- Komponent: `Glyph` w `src/components/nexus/glyph.tsx`
- Pliki wektorowe: `public/glyphs/*.svg`

## Zasada natychmiastowych skojarzeń (szczególnie dla seniorów)

Każdy dział aplikacji ma własny, fizyczny, jednoznaczny symbol — bez powtórzeń i abstrakcyjnych metafor:

- `start` (Start): solidny dom z dachem, kominem i drzwiami.
- `documents` (Dokumenty): portfel z wysuwającą się kartą i zapięciem.
- `orbit` (Pomoc / W czym mogę pomóc?): dymek rozmowy z wyraźnym znakiem `?`.
- `search` (Wyszukiwarka katalogu): klasyczna lupa.
- `more` (Usługi / Wszystkie usługi): siatka czterech zaokrąglonych kafelków 2×2.
- `identity` (mDowód): karta dowodu z ramką portretu i liniami danych.
- `wheel` (mPrawo jazdy): kierownica samochodu (rozdzielona od `Moje pojazdy`).
- `vehicle` (Moje pojazdy / Kierowca i pojazdy): samochód widziany od przodu z szybą i reflektorami.
- `points` (Punkty karne): tarcza prędkościomierza ze wskazówką (zamiast ogólnego trójkąta ostrzegawczego).
- `lock` (Zastrzeż PESEL): solidna kłódka z otworem na klucz.
- `health` (Zdrowie — mojeIKP): czytelny krzyż medyczny.
- `letter` (Moje pisma / e-Doręczenia): koperta pocztowa z wyraźnym skrzydełkiem.
- `case` (Moje sprawy): teczka dokumentów z liniami tekstu.
- `court` (Sprawy sądowe): front sądu z trójkątnym tympanonem i czterema kolumnami.
- `signpost` (Ważne zmiany w życiu): dwukierunkowy drogowskaz (rozdzielony od katalogu usług).
- `support` (Możliwe wsparcie / Emerytura i wsparcie): serce z plusem.
- `timeline` (Moja oś czasu): kalendarz połączony z tarczą zegara.
- `profile` (Profil / Mój profil): popiersie osoby (rozdzielone od `Osoba zaufana`).
- `trusted` (Osoba zaufana): osoba z sercem (bliska zaufana osoba, nie kłódka).
- `shield` (Ochrona tożsamości): tarcza z wyraźnym znakiem potwierdzenia.
- `eye` (Dostęp do moich danych): oko ze źrenicą.
- `sliders` (Wygląd i wielkość liter): znak typograficzny `Aa` (natychmiast zrozumiały jako rozmiar tekstu i wygląd).

Pełna lista nazw (54): start, documents, letter, case, orbit, search, more, identity, wheel, vehicle, points, passport, family, health, education, housing, work, support, calendar, timeline, shield, alert, key, eye, profile, trusted, signpost, sliders, sun, moon, contrast, check, close, back, forward, expand, filter, code, share, bell, pin, draft, location, institution, child, emergency, download, lock, info, menu, plus, clock, school, court.

Znak marki (nie ikona nawigacji): `Mark` w `src/components/nexus/heritage.tsx` — powściągliwy, biało-czerwony modernistyczny znak kwadratowy (`#FFFFFF` / `#DC143C` w ramce `#14243B`, monochromatyczny w motywie `contrast`).
