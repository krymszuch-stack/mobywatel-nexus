# Demonstracje usług urzędowych NEXUS

Wejście do każdego modułu znajduje się w katalogu **Usługi** i w wyszukiwarce. Wspólne widoki **Moje sprawy**, **Pisma z urzędów**, **Moja oś czasu** i dzwonek korzystają z rekordów tych samych adapterów. OneFlow pokazuje otwarte zadania, a oś czasu zawiera terminy wizyt i aktywne przypomnienia sądowe.

Każdy adapter przechowuje własne dane w przeglądarce. Zegar scenariuszy ma punkt odniesienia 26 listopada 2026 r. o 10:00 w strefie Europe/Warsaw. Dodaj `?narzedzia=1` do adresu aplikacji (lub `&narzedzia=1`, jeśli adres ma już parametr), aby wyświetlić panel **Scenariusze demo** i podgląd powiadomień push. Reset z panelu przywraca dane wybranej usługi. Wszystkie dane lokalne można przywrócić w ustawieniach wyglądu. Konta, dokumenty, identyfikatory i kwoty w tych modułach są fikcyjne.

## Wsparcie PFRON

**Przegląd**, **Sprawy** i **Wiadomości** obejmują m.in. poprawkę wniosku edukacyjnego, wypłatę wskazaną w źródle, umowę z kaucją, turnus, ankietę i osobny kontekst podopiecznego. Etykiety statusów wniosku, sprawy JST i rozliczenia pozostają w osobnych polach. Stan „Rozliczenie zaakceptowane” odzwierciedla tytuł wiadomości w scenariuszu.

| Scenariusz | Wynik |
|---|---|
| Wejście z katalogu, otwarcie powiadomienia i przejście do sprawy | Sprawdzono w Chromium |
| Wyszukiwanie i filtr roboczych oraz karta szkicu bez numeru sprawy | Sprawdzono w Chromium |
| Zapis szkicu, konflikt wersji z zachowaną treścią i ponowienie po wczytaniu sprawy | Sprawdzono w Chromium |
| Symulacja wysyłki poprawki, aktualizacja sprawy i zamknięcie zadania | Sprawdzono w Chromium i w teście adaptera |
| Deduplikacja zdarzeń i zastąpienie przypomnienia po zmianie terminu | Sprawdzono w teście adaptera |
| Odpowiedź na wiadomość ogólną, limity i wpis w „Wysłanych” | Sprawdzono w Chromium i w teście walidacji |
| Dokument do podpisania i symulacja wpłaty kaucji | Sprawdzono w Chromium |
| Przejście na kontekst podopiecznego i odtworzenie danych po resecie | Sprawdzono w Chromium |
| Turnus i oświadczenie organizatora, ankieta, rozliczenie, szkic i złożenie nowego wniosku | Sprawdzono w Chromium |

**Prezentacja w sześciu krokach**

1. Otwórz **Usługi → Wsparcie PFRON**.
2. Zobacz zadanie uzupełnienia wniosku edukacyjnego.
3. W **Wiadomościach** otwórz informację o poprawce.
4. Otwórz sprawę i zapisz treść poprawki jako szkic.
5. Zasymuluj wysłanie i sprawdź etap JST oraz listę zadań.
6. Zmień kontekst na **Podopieczny** i zobacz odrębny zestaw spraw.

[Przegląd PFRON](docs/demo/pfron-przeglad.png) · [Szczegół sprawy PFRON](docs/demo/pfron-sprawa.png)

Wzory dokumentów są dostępne lokalnie. W szkicach formularzy zapisują się metadane załączników. Po odświeżeniu pliki wymagają ponownego wyboru.

## ZUS — ubezpieczenia i świadczenia

| Obszar ZUS | Ekran NEXUS | Stan implementacji |
|---|---|---|
| Zgłoszenia, płatnik, składki, NFZ | Ubezpieczenia, Zdrowie (mojeIKP) | Symulacja zgłoszenia i składek z osobną informacją o prawie do świadczeń |
| Konto emerytalne, OFE i RIA | Ubezpieczenia | Przykładowe dane. Kalkulator prowadzi do eZUS |
| Świadczenie wspierające, WZON, opiekun | Świadczenia, Moje sprawy | Lokalne formularze SWN, SWN-INF, przykładowy wariant USW i aktualizacja sprawy przez uzupełnienie |
| 800+, Aktywny Rodzic, Dobry Start | Świadczenia | Opisy i przejścia do eZUS |
| Korespondencja, e-ZLA, szkice | Dokumenty, Pisma z urzędów, dzwonek | Podgląd, wzory, szkic POG i dokument po wysyłce demo. Formalny odbiór prowadzi do eZUS |
| Zaświadczenia i dane archiwalne | Dokumenty, Ubezpieczenia | Wybór zakresu, przygotowanie, błąd i ponowienie, pobieranie wzoru PDF lub TXT |
| A1, RUD, USP i pozostałe usługi | Więcej | Reprezentatywny katalog i przejścia do eZUS |
| Wizyta, konto i ustawienia | Więcej | Lokalny zapis i anulowanie wizyty, preferencje e-mail/SMS i przejścia do eZUS |

W Chromium sprawdzono sześć scenariuszy. Zgłoszenie i składki z informacją NFZ, pismo czekające na odbiór, utworzenie i pobranie PDF, wznowienie i wysłanie szkicu POG, uzupełnienie tej samej sprawy oraz rezerwację i anulowanie demonstracyjnej wizyty. Osobno sprawdzono błąd przygotowania archiwum, ponowienie i dokończenie po odświeżeniu.

Do przyszłej integracji potrzebne będą uzgodnione kontrakty tożsamości i reprezentacji, zgłoszeń i składek, spraw i dokumentów, stanu doręczeń z kanałem, potwierdzeń, terminów, dostępności plików oraz zdarzeń z wersją i identyfikatorem.

## Praca i urząd pracy

Katalog grupuje sześć obszarów z praca.gov.pl. Formy KRB i ich tryby mają osobne metadane. Kreatory demonstracyjne obejmują KRB — rejestrację, PSZ-KRBU, PSZ-ZPP, PSZ-PU i PSZ-WWZ. Pozostałe pozycje mają kartę oraz przejście do praca.gov.pl zgodnie z kontekstem. Oferty i wydarzenia ePraca pochodzą z osobnego adaptera demonstracyjnego.

| Scenariusz | Wynik |
|---|---|
| KRB, symulowana wysyłka, UPP i odrębny stan osoby | Sprawdzono w Chromium |
| Oczekujące pismo, jawna symulacja odbioru, UPD i wznowienie korespondencji | Sprawdzono w Chromium |
| Organizacja Demo, drugi podpis i osobna wysyłka | Sprawdzono w Chromium i w teście adaptera |
| Nieznany wynik, sprawdzenie stanu i ponowienie ze zgodnym dokumentem | Sprawdzono w Chromium |
| ePraca, szczegóły oferty i ulubione. Wizyty własne, urzędowe i wejście online | Sprawdzono w Chromium |
| Reset Pracy zachowujący zapisane dane PFRON | Sprawdzono w Chromium |
| PSZ-KRBU, PSZ-ZPP i PSZ-WWZ, w tym zamknięcie zadania po uzupełnieniu | Sprawdzono w Chromium |
| Konflikt i wygaśnięcie terminu rezerwacji | Sprawdzono w Chromium. Konflikt pozostawia jedną wizytę, a wygaśnięcie zachowuje dane formularza |

Subskrypcje i podgląd push są lokalne. Umowy elektroniczne i funkcje pełnego e-Urzędu otwierają właściwe serwisy. Przyszły adapter publicznych ofert może korzystać z udokumentowanego WebService ePraca po spełnieniu warunków dla integratorów. Prywatne sprawy, pisma i wizyty wymagają osobnego uzgodnienia dostępu.

## Sprawy sądowe

**Przegląd**, **Sprawy** i **Terminy** prowadzą do udostępnionych spraw. Szczegół sprawy zawiera **Podsumowanie**, **Przebieg**, **Dokumenty** i **Terminy**. Odczyt lokalny, stan odczytu w portalu, stan doręczenia i dostęp pozostają niezależne. Dokumenty dostępne w demonstracji można pobrać jako TXT. Portal Informacyjny obsługuje formalne doręczenia.

| Scenariusz | Wynik |
|---|---|
| Katalog, trzy zakładki, wyszukiwanie, filtry i powrót | Sprawdzono w Chromium |
| Pismo dostępne z dzwonka, sprawy i wspólnej korespondencji | Sprawdzono w Chromium |
| Niezależne liczniki, dokument bez pliku, pobieranie TXT i cztery warianty doręczenia | Sprawdzono w Chromium |
| Identyczne tytuły z różnymi identyfikatorami oraz ponowne przetworzenie zdarzenia | Sprawdzono w Chromium i w teście adaptera |
| Przesunięcie, anulowanie przypomnienia i posiedzenia historyczne | Sprawdzono w Chromium i w teście adaptera |
| Walidacja wniosku, cofnięcie kroku, osobna akceptacja i przyznanie dostępu | Sprawdzono w Chromium i w teście adaptera |
| Nieudana synchronizacja, wygaśnięcie, ponowne połączenie i cofnięcie dostępu | Sprawdzono w Chromium i w teście adaptera |

## Kontrole techniczne

- `npm run typecheck` i `npm run lint` zakończyły się powodzeniem.
- `npm test` zaliczyło 22 testy, w tym 11 dla nowych modułów.
- `npm run build` wygenerował pakiet TanStack Start/Nitro. Bundler wyświetlił ostrzeżenia zależności o dyrektywie `use client`.
- Główne ścieżki wykonano w Chromium przez Playwright. Dodatkowo zweryfikowano listy modułów przy szerokościach 360, 390, 430 i 1440 px w Porcelanie, Północy i Kontraście ze skalą 100%, 125% i 200%. Naprawiono przewijanie w poziomie oraz powrót fokusu po zamknięciu potwierdzenia.
- Weryfikacja buildu objęła pierwsze renderowanie z wyłączonym JavaScriptem, ponowne wejście, wyszukiwanie bez polskich znaków, migrację zapisanej wizyty na czas letni i globalny reset. W testach prezentacji nie wystąpiły błędy przeglądarki ani odpowiedzi HTTP 4xx/5xx. Axe nie zgłosił naruszeń na sprawdzonych ekranach.
- Czytnik ekranu oraz klawiatura ekranowa na fizycznym telefonie pozostają poza zakresem wykonanych kontroli.

Połączenia z administracją reprezentują lokalne adaptery i odnośniki do publicznych portali. Podpisy, wpłaty, wysyłki, odbiory i rezerwacje to symulacje. Produkcyjne połączenia zależą od uzgodnionego dostępu, autoryzacji i kontraktu każdej instytucji.
