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
| Emerytura i świadczenia | simulated | Podgląd już przyznanego 800 zł, nie nowa decyzja |

Źródła nazw: [mObywatel](https://info.mobywatel.gov.pl/), [gov.pl](https://www.gov.pl/web/mobywatel), [pacjent.gov.pl](https://pacjent.gov.pl/).

Wspólny rejestr: `src/lib/nexus/registry.ts`. Pulpit, katalog, skróty i wyszukiwarka biorą usługi stamtąd.
