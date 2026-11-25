# Ruch

Krótko i raz. Bez pętli dekoracyjnych.

- Wejście widoku: 6 px w górę i krycie, 180 ms, `cubic-bezier(0.2, 0, 0, 1)`.
- Przycisk: `scale(0.96)` przy wciśnięciu.
- Rozwinięcie usług: `grid-template-rows` 220 ms.
- Orbita: jeden obrót o 72° przy otwarciu, 680 ms.
- Motyw: zmiana koloru bez osobnej animacji na całym drzewie.

`prefers-reduced-motion: reduce` wyłącza animacje. Ustawienie „Ogranicz ruch” dodaje `data-motion="reduce"` i robi to samo, także gdy system ruchu nie ogranicza.

Nie animuj znaków wodnych. Nie stosuj blur ani sprężyn.
