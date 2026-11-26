import { useState } from "react";
import { useNexus } from "@/lib/nexus/store";
import {
  demoDate,
  demoId,
  demoNow,
  eventFor,
  patch,
  publish,
  visible,
  warsaw,
  type CivicAppointment,
  type CivicData,
} from "@/lib/nexus/civic/model";
import { Action, Button, Errors, Field, Filters } from "./ui";

export function Appointments<D extends CivicData>({
  data,
  change,
  office,
  expiredSlot = false,
  selectedId,
}: {
  data: D;
  change: (update: (data: D) => D) => void;
  office: string;
  expiredSlot?: boolean;
  selectedId?: string;
}) {
  const upcoming = (item: CivicAppointment) =>
    item.state === "booked" && Date.parse(item.at) >= Date.parse(demoNow);
  const selectedAppointment = data.appointments.find(
    (item) => item.id === selectedId && visible(data, item),
  );
  const [section, setSection] = useState(
    selectedAppointment && !upcoming(selectedAppointment) ? "Historia" : "Nadchodzące",
  );
  const [book, setBook] = useState(false);
  const [fields, setFields] = useState({
    office: "",
    location: "",
    purpose: "",
    mode: "",
    date: "",
    preferred: "",
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState("");
  const appointments = data.appointments.filter((item) => visible(data, item));
  const rows = appointments.filter(
    (item) =>
      (!selectedId || item.id === selectedId) && upcoming(item) === (section === "Nadchodzące"),
  );
  const target = (id: string) => ({ kind: "module" as const, id: `${data.source}/visits/${id}` });
  const set = (key: keyof typeof fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setSearched(false);
    setSelected("");
  };
  return (
    <section className="civic-stack">
      <h2>Wizyty</h2>
      <Filters
        label="Widok wizyt"
        value={section}
        options={["Nadchodzące", "Historia"]}
        onChange={setSection}
      />
      {selectedId && (
        <Button onClick={() => useNexus.getState().go("urzad", `${data.source}/visits`)}>
          Wszystkie wizyty
        </Button>
      )}
      {rows.map((item) => (
        <article key={item.id} className="nx-sheet civic-stack">
          <h3>{item.title}</h3>
          <p>
            {warsaw(item.at, true)} · {item.office} · {item.location}
          </p>
          <p>
            {item.mode} · {item.state === "cancelled" ? "Odwołana" : "Termin demonstracyjny"}
            {item.position ? ` · ${item.position}` : ""}
          </p>
          {item.history?.map((note) => (
            <p key={note} className="nx-fine">
              {note}
            </p>
          ))}
          {upcoming(item) && item.mode === "online" && (
            <Button onClick={() => setConnected(item.id)}>Dołącz do wizyty demonstracyjnej</Button>
          )}
          {connected === item.id && <p role="status">Otworzono lokalny podgląd wizyty online.</p>}
          {upcoming(item) &&
            (item.cancellable ? (
              <Action
                title="Odwołać wizytę demonstracyjną?"
                body="Wizyta zostanie odwołana w demonstracji."
                onConfirm={() => {
                  change((s) => {
                    const current = s.appointments.find(
                      (entry) => entry.id === item.id && visible(s, entry),
                    );
                    if (
                      !current ||
                      !current.cancellable ||
                      !upcoming(current) ||
                      s.health !== "ready"
                    )
                      return s;
                    return publish(
                      {
                        ...s,
                        appointments: patch(s.appointments, item.id, { state: "cancelled" }),
                      },
                      eventFor(
                        item,
                        "visit.cancelled",
                        "Odwołano wizytę demonstracyjną",
                        target(item.id),
                        null,
                      ),
                    );
                  });
                }}
              >
                Anuluj wizytę demonstracyjną
              </Action>
            ) : (
              <p>Wizytę wyznaczył urząd. Skontaktuj się z urzędem, jeśli potrzebujesz zmiany.</p>
            ))}
        </article>
      ))}
      {rows.length === 0 && <p>Brak wizyt w tym widoku.</p>}
      <Button primary onClick={() => setBook(!book)}>
        {book ? "Zamknij formularz wizyty" : "Umów wizytę demonstracyjną"}
      </Button>
      {book && (
        <div className="nx-sheet civic-stack">
          <h3>Wybierz termin</h3>
          <Errors errors={errors} />
          {(
            [
              ["office", "Urząd lub placówka", [office]],
              ["location", "Lokalizacja", ["Punkt Obsługi Demo", "Filia Demo"]],
              [
                "purpose",
                "Temat wizyty",
                ["Konsultacja", "Dokumenty i sprawy", "Informacja o wsparciu"],
              ],
              ["mode", "Tryb", ["stacjonarna", "online"]],
            ] as const
          ).map(([key, label, options]) => (
            <Field key={key} label={label} error={errors[key]}>
              {(field) => (
                <select {...field} value={fields[key]} onChange={(e) => set(key, e.target.value)}>
                  <option value="">Wybierz</option>
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              )}
            </Field>
          ))}
          <Field label="Preferowany dzień" error={errors.date}>
            {(field) => (
              <input
                {...field}
                type="date"
                min={demoNow.slice(0, 10)}
                value={fields.date}
                onChange={(e) => set("date", e.target.value)}
              />
            )}
          </Field>
          <Field label="Preferowana godzina" error={errors.preferred}>
            {(field) => (
              <input
                {...field}
                type="time"
                value={fields.preferred}
                onChange={(e) => set("preferred", e.target.value)}
              />
            )}
          </Field>
          <Button
            onClick={() => {
              const invalid: Record<string, string> = {};
              Object.entries(fields).forEach(([key, value]) => {
                if (!value) invalid[key] = "Uzupełnij to pole.";
              });
              if (fields.date && fields.date < demoNow.slice(0, 10))
                invalid.date = "Podaj bieżącą lub przyszłą datę scenariusza.";
              setErrors(invalid);
              if (Object.keys(invalid).length) return;
              setSearched(true);
              const weekday = new Date(`${fields.date}T12:00:00Z`).getUTCDay();
              setSlots(
                weekday === 0 || weekday === 6
                  ? []
                  : [fields.preferred, fields.preferred === "14:30" ? "10:00" : "14:30"],
              );
            }}
          >
            Wyszukaj wolne terminy
          </Button>
          {searched &&
            (slots.length ? (
              <Filters
                label="Wolne terminy"
                value={selected}
                options={slots}
                onChange={setSelected}
              />
            ) : (
              <p role="status">Brak terminów w wybranym dniu.</p>
            ))}
          {selected && (
            <>
              <p>
                {fields.purpose} · {fields.date} · {selected} · {fields.location} · {fields.mode}
              </p>
              <Action
                title="Potwierdzić termin demonstracyjny?"
                body="Termin zostanie zapisany tylko w NEXUS."
                onConfirm={() => {
                  const at = demoDate(
                    Math.round(
                      (Date.parse(fields.date) - Date.parse(demoNow.slice(0, 10))) / 86_400_000,
                    ),
                    selected,
                  );
                  if (
                    expiredSlot ||
                    data.health !== "ready" ||
                    Date.parse(at) <= Date.parse(demoNow)
                  ) {
                    setSelected("");
                    setErrors({ slot: "Termin nie jest już dostępny. Wybierz inny termin." });
                    return;
                  }
                  if (appointments.some((item) => item.state === "booked" && item.at === at)) {
                    setErrors({ slot: "Masz już wizytę o tej godzinie." });
                    return;
                  }
                  const item: CivicAppointment = {
                    id: demoId(data.source, "visit"),
                    scope: data.scope,
                    source: data.source,
                    at,
                    title: fields.purpose,
                    office,
                    location: fields.location,
                    mode: fields.mode === "online" ? "online" : "stacjonarna",
                    state: "booked",
                    cancellable: true,
                  };
                  change((s) =>
                    publish(
                      { ...s, appointments: [item, ...s.appointments] },
                      eventFor(
                        item,
                        "visit.booked",
                        "Zapisano wizytę demonstracyjną",
                        target(item.id),
                        null,
                      ),
                    ),
                  );
                  setBook(false);
                  setSelected("");
                  setSearched(false);
                  setErrors({});
                  setSection("Nadchodzące");
                  useNexus
                    .getState()
                    .showToast(
                      data.source === "zus"
                        ? "Termin demonstracyjny — nie zarezerwowano wizyty w ZUS"
                        : "Zapisano termin demonstracyjny w NEXUS",
                    );
                }}
              >
                Zapisz wizytę demonstracyjną
              </Action>
            </>
          )}
        </div>
      )}
    </section>
  );
}
