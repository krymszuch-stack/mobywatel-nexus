import { demoDate, demoNow } from "./model";

export const ePraca = {
  source: "ePraca · demonstracja",
  fetchedAt: demoNow,
  offers: [
    {
      id: "DEMO-praca-offer-1",
      title: "Asystent administracyjny",
      place: "Miasto Brzozowe Demo",
      contract: "Umowa o pracę",
      hours: "Pełny etat",
      gross: 5200,
      period: "miesiąc",
      description: "Przykładowe zadania: organizacja dokumentów i kontakt z zespołem.",
    },
    {
      id: "DEMO-praca-offer-2",
      title: "Pracownik biblioteki",
      place: "Gmina Nadleśna Demo",
      contract: "Umowa o pracę",
      hours: "Pół etatu",
      description: "Przykładowa obsługa katalogu i wypożyczalni.",
    },
    {
      id: "DEMO-praca-offer-3",
      title: "Staż przy organizacji wydarzeń",
      place: "Miasto Brzozowe Demo",
      contract: "Staż",
      hours: "Pełny etat",
      gross: 2900,
      period: "miesiąc",
      description: "Przykładowe wsparcie przygotowania zajęć.",
    },
  ],
  events: [
    {
      id: "DEMO-praca-event-1",
      title: "Targi pracy Demo",
      place: "Dom Spotkań Demo",
      at: demoDate(8, "12:00"),
    },
    {
      id: "DEMO-praca-event-2",
      title: "Warsztat planowania kariery Demo",
      place: "Klub Pracy Demo",
      at: demoDate(14, "10:00"),
    },
  ],
};
