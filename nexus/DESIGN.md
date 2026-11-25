# mObywatel NEXUS — design

Niezależny prototyp konkursowy. Nie jest aplikacją administracji publicznej.

Nowoczesność na pierwszym planie. Historia w tle. Inteligencja pod spodem.

## Charakter

Szwajcarski rytm, krój IBM Plex, prawie płaskie powierzchnie, linia zamiast cienia. Czerwień jest sygnałem, nie tłem. Guilloche i ryciny mają krycie około 5% i znikają w motywie Kontrast.

Nie wolno: bibliotek ikon (Lucide, Heroicons, Material), gradientów „AI”, szkła, emoji jako ikon, dużych zaokrągleń, orła, pieczęci państwowej, prawdziwych zabezpieczeń banknotów.

## Motywy

Tokeny: [DESIGN_TOKENS.json](DESIGN_TOKENS.json) i `src/styles.css`.

- Porcelana — ciepłe tło `#f3efe6`, granat `#172033`, akcja `#1c4b82`.
- Północ — tło `#0c1422`, kość `#f3ede2`, akcja `#8ec8f5`, ryt złoty `#c6b48a`.
- Kontrast — czerń, biel, fokus `#ffbf00`, bez znaków wodnych, obrys 2 px.

Przełącznik motywu ustawia `data-theme` na `html`.

## Typografia

- Tekst: IBM Plex Sans, łaciński i łaciński rozszerzony.
- Tytuły i nazwa NEXUS: IBM Plex Serif.
- Skala tekstu 100–200% przez `--nx-scale` na `html`.
- Liczby tabelaryczne.

## Układ

Mobile najpierw. Od 64 rem pojawia się boczna nawigacja, dolny pasek znika. Treść ma miarę do 48 rem. Promień 2 px. Karta dokumentu ma ścięty róg, reszta jest prostokątna.

## Dni

11 listopada i 15 sierpnia: linia pod nagłówkiem. 3 maja: mocniejszy rękopis, nadal poniżej 12% krycia. Poza tymi dniami nic się nie zmienia. Podgląd jest w Wyglądzie.

## Język

Interfejs po polsku, bez nazw modułów po angielsku. „Start”, „Moje pisma”, „Możliwe wsparcie”, „Załatw sprawę”, „W czym mogę pomóc?”.
