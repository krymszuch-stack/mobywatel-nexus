# mObywatel NEXUS — design

Niezależny prototyp konkursowy. Nie jest aplikacją administracji publicznej.

Współczesna polska aplikacja obywatelska na pierwszym planie. Inteligentna orkiestracja spraw OneFlow pod spodem. Polskie dziedzictwo graficzne wyłącznie kontekstowo w tle.

## Hierarchia marki

- **Marka główna:** `mObywatel` (IBM Plex Sans 700, granat obywatelski `#14243B`)
- **Koncepcja drugorzędna:** dyskretny dopisek `NEXUS`
- **Silnik orkiestracji:** `OneFlow`
- **Asystent obywatelski:** `W czym mogę pomóc?` (zintegrowane narzędzie publiczne, bez symboliki astronomicznej)

## Polska tożsamość wizualna

Biel i polska czerwień (`#DC143C`) jako oszczędny akcent tożsamościowy (3 px linia nagłówka i karty `mDowód`, aktywna krawędź nawigacji, znak biało-czerwony `Mark`), głęboki granat obywatelski (`#14243B`), czytelny niebieski funkcjonalny (`#1558C0`), neutralna powierzchnia porcelanowa (`#F3F5F8`) oraz współczesna europejska typografia publiczna.

Nie wolno: bibliotek ikon (Lucide, Heroicons, Material), gradientów „AI”, szkła, emoji jako ikon, dominującej symboliki orbitalnej/astronomicznej, szampańskiego złota, godła, orła, pieczęci państwowych, prawdziwych zabezpieczeń banknotów.

## Motywy

Tokeny: [DESIGN_TOKENS.json](DESIGN_TOKENS.json) i `src/styles.css`.

- **Porcelana** (`porcelain`) — neutralne tło `#F3F5F8`, powierzchnia `#FFFFFF`, granat `#14243B`, akcja `#1558C0` (hover `#104599`), polska czerwień `#DC143C`.
- **Północ** (`midnight`) — głęboki granat `#0B1220`, powierzchnia `#131D30`, tekst `#F4F7FB`, akcja `#6EA8FE`, czerwień `#F06478`. Bez szampańskiego złota.
- **Kontrast** (`contrast`) — czerń `#000000`, biel `#FFFFFF`, fokus `#FFBF00`, promienie `0px`, obrys `2px`, brak znaków wodnych.

Przełącznik motywu ustawia `data-theme` na `html`.

## Typografia

- **IBM Plex Sans** (łaciński i łaciński rozszerzony): nagłówki (`h1–h3`, waga 700, `text-wrap: balance`), marka główna `mObywatel`, interfejs i treść.
- **IBM Plex Serif**: stosowany oszczędnie (m.in. cytaty z pism urzędowych).
- Skala tekstu 100–200% przez `--nx-scale` na `html`. Liczby tabelaryczne (`tabular-nums`).

## Dziedzictwo kontekstowe

Znaki wodne (`.nx-mark`, krycie ~3.5%, znikają w `contrast`) pojawiają się wyłącznie tam, gdzie są tematycznie uzasadnione:
- edukacja (`start-krakow`): motyw geometryczny Kopernika (`orbits`),
- zdrowie (`mojeIKP`): motyw laboratoryjny Skłodowskiej-Curie (`lab`),
- sprawy i ścieżki lokalne: motyw architektoniczny (`civic`),
- treść pism urzędowych: ślad rękopisu (`manuscript`).

Ekrany Start, Dokumenty, Moja oś czasu, Ochrona tożsamości, Dostęp do moich danych i Możliwe wsparcie pozostają czyste i nowoczesne.

## Układ i język

Mobile najpierw. Od `64rem` pojawia się boczna nawigacja, dolny pasek znika. Treść ma miarę do `48rem`. Kontrolowane zaokrąglenia kart (`12–16px`), ścięty róg wyłącznie na karcie dokumentu.

Interfejs wyłącznie w naturalnej polszczyźnie: **Start**, **Dokumenty**, **Pomoc** / **W czym mogę pomóc?**, **Usługi**, **Profil**, **Moje pisma** (`e-Doręczenia`), **Moje sprawy**, **Ważne zmiany w życiu**, **Możliwe wsparcie**, **Moja oś czasu**, **Dostęp do moich danych**, **Ochrona tożsamości**, **Osoba zaufana**.
