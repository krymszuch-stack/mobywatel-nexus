# mObywatel NEXUS

Niezależny prototyp konkursowy usługi publicznej. Nie jest aplikacją administracji. Dane Zofii Heleny Baran są fikcyjne.

Działa w przeglądarce, bez kluczy i bez konta. Szkice zostają w `localStorage`.

## Uruchomienie lokalne

```bash
npm ci --workspaces=false
npm run dev
```

Aplikacja nasłuchuje na porcie 3000. Produkcyjny pakiet: `npm run build`.

## Co jest w środku

Ekran pierwszego uruchomienia, trzy układy startu, trzy motywy, portfel dokumentów, pisma z odpowiedzią, sprawy, ścieżki, możliwe wsparcie, oś czasu, bezpieczeństwo, historia wglądu, osoba zaufana, wygląd i pasek „W czym mogę pomóc?”.

Cztery demonstracje urzędowe są dostępne w katalogu **Usługi**. Zobacz [moduły i scenariusze](CIVIC_SERVICES.md).

Kontrakt wizualny dla kolejnych zmian: [UI_CONTRACT.md](UI_CONTRACT.md).
