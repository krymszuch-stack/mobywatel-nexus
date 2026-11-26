# Rejestr usług

NEXUS jest niezależnym prototypem konkursowym. Nie łączy się z systemami administracji.

| Usługa | Stan | Co robi prototyp |
|---|---|---|
| mDowód | native | Pokazuje wzór dowodu na tym urządzeniu |
| mPrawo jazdy | native | Pokazuje wzór uprawnień |
| mojeIKP | simulated | Hub recept, skierowań i przypomnienia. Wizyty umawia pacjent.gov.pl |
| e-Doręczenia | simulated | Skrzynka z wzorów. Odpowiedź nie wychodzi z przeglądarki |
| Zastrzeż PESEL | simulated | Zmienia tylko lokalny status po potwierdzeniu |
| Moje pojazdy, punkty karne | simulated | Dane wzoru KR NX851 i 0 punktów |
| mStłuczka | concept | Wejście bez zgłoszenia kolizji |
| Emerytura i świadczenia | simulated | Podgląd świadczeń na danych wzoru |
| Wsparcie PFRON | simulated | Wnioski, poprawki, wiadomości, turnusy, technologie, ankiety i rozliczenia |
| ZUS — ubezpieczenia i świadczenia | simulated | Zgłoszenia, składki, świadczenia, pisma, zaświadczenia PDF i wizyty |
| Praca i urząd pracy | simulated | Katalog, pięć kreatorów, pisma, potwierdzenia, wizyty i ePraca |
| Sprawy sądowe | simulated | Udostępnione sprawy, dokumenty, doręczenia źródłowe, posiedzenia i dostęp |

Scenariusze i wyniki sprawdzenia opisuje [Weryfikacja modułów](CIVIC_SERVICES.md).

Źródła nazw: [mObywatel](https://info.mobywatel.gov.pl/), [gov.pl](https://www.gov.pl/web/mobywatel), [pacjent.gov.pl](https://pacjent.gov.pl/).

Wspólny rejestr: `src/lib/nexus/registry.ts`. Pulpit, katalog, skróty i wyszukiwarka biorą usługi stamtąd.
