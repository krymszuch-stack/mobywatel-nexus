import { useEffect } from "react";
import { downloadDocument } from "@/lib/nexus/civic/files";
import {
  agencyNames,
  demoNow,
  patch,
  visible,
  warsaw,
  type Agency,
  type CivicDocument,
} from "@/lib/nexus/civic/model";
import {
  caseVisible,
  changeCivic,
  useCivicData,
  visibleEvents,
  visibleNotices,
} from "@/lib/nexus/civic/select";
import { useSow } from "@/lib/nexus/civic/pfron";
import { CourtCaseDetail, Courts } from "./sady";
import { Praca, WorkCaseActions, WorkDocumentActions } from "./praca";
import { Zus, ZusCaseActions, ZusDocumentActions } from "./zus";
import { useNexus } from "@/lib/nexus/store";
import { PageHead, Row, Status } from "../ui";
import { Pfron, SowDetails, SowDocumentActions } from "./pfron";
import { civicGlyph, openTarget, usePresenterTools } from "./navigation";
import { Button, Filters, TaskRows } from "./ui";

export function AgencyScreen({ id }: { id: string }) {
  const [agency, section = "home", resource] = id.split("/");
  if (agency === "sady") return <Courts section={section} resource={resource} />;
  if (agency === "praca") return <Praca section={section} resource={resource} />;
  if (agency === "zus") return <Zus section={section} resource={resource} />;
  if (agency === "pfron") return <Pfron section={section} resource={resource} />;
  return <Unavailable title="Ta usługa jest niedostępna" />;
}

function Unavailable({ title }: { title: string }) {
  const back = useNexus((s) => s.back);
  return (
    <div className="nx-stage civic-view">
      <PageHead title={title} lede="Sprawdź kontekst i dostęp do danych tej usługi." />
      <Button onClick={back}>Wróć do poprzedniego widoku</Button>
    </div>
  );
}

export function CivicCaseDetail({ id }: { id: string }) {
  const all = useCivicData();
  const sow = useSow((state) => state.data);
  const data = all.find((data) => caseVisible(data, id));
  const item = data?.cases.find((entry) => entry.id === id);
  const sowItem = sow.cases.find((entry) => entry.id === id);
  const go = useNexus((s) => s.go);
  if (id.startsWith("DEMO-sady-")) return <CourtCaseDetail id={id} />;
  if (!item || !data) return <Unavailable title="Brak dostępu do sprawy" />;
  const events = visibleEvents(data).filter((entry) => entry.caseId === item.id);
  const documents = data.documents.filter(
    (entry) => entry.caseId === item.id && visible(data, entry),
  );
  const tasks = data.tasks.filter(
    (entry) => entry.caseId === item.id && visible(data, entry) && !entry.completedAt,
  );
  return (
    <div className="nx-stage civic-view">
      <PageHead kicker={agencyNames[item.source]} title={item.title} lede={item.summary} />
      <p>{[item.number, item.office, warsaw(item.updatedAt)].filter(Boolean).join(" · ")}</p>
      {!sowItem && tasks.length > 0 && (
        <section className="civic-stack">
          <h2>Wymaga działania</h2>
          <TaskRows tasks={tasks} />
        </section>
      )}
      {sowItem && <SowDetails item={sowItem} />}
      {item.source === "zus" && <ZusCaseActions item={item} />}
      {item.source === "praca" && <WorkCaseActions item={item} />}
      {item.source === "zus" && (
        <Status tone="info">{item.sourceStatus ?? "Brak informacji o rozstrzygnięciu"}</Status>
      )}
      <section className="civic-stack">
        <h2>Dokumenty</h2>
        <div className="nx-list">
          {documents.map((entry) => (
            <Row
              key={entry.id}
              glyph="documents"
              title={entry.title}
              meta={`Wersja ${entry.version} · ${warsaw(entry.publishedAt)}`}
              onClick={() => go("pismo", entry.id)}
            />
          ))}
        </div>
        {!documents.length && <p>Brak dokumentów w tej sprawie.</p>}
      </section>
      <section className="civic-stack">
        <h2>Historia</h2>
        {events.length ? (
          <ul className="nx-bullets">
            {events.map((entry) => (
              <li key={entry.id}>
                {entry.title} · {warsaw(entry.at, true)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak zdarzeń w tej sprawie.</p>
        )}
      </section>
    </div>
  );
}

function documentCanOpen(item: CivicDocument) {
  return !item.requiresReceipt || item.delivery === "received" || item.delivery === "deemed";
}

export function CivicDocumentDetail({ id }: { id: string }) {
  const all = useCivicData();
  const go = useNexus((s) => s.go);
  const item = all.flatMap((data) =>
    data.documents.filter(
      (entry) => entry.id === id && visible(data, entry) && caseVisible(data, entry.caseId),
    ),
  )[0];
  const canOpen = Boolean(item && documentCanOpen(item));
  const source = item?.source;
  useEffect(() => {
    if (!source || !canOpen) return;
    changeCivic(source, (data) => ({
      ...data,
      documents: patch(data.documents, id, {
        readAt: data.documents.find((entry) => entry.id === id)?.readAt ?? demoNow,
      }),
    }));
  }, [source, id, canOpen]);
  if (!item) return <Unavailable title="Brak dostępu do dokumentu" />;
  return (
    <div className="nx-stage civic-view">
      <PageHead kicker={agencyNames[item.source]} title={item.title} lede={item.office} />
      <section className="nx-sheet civic-stack">
        <p>
          {item.kind} · Wersja {item.version} · Opublikowano {warsaw(item.publishedAt)}
        </p>
        {item.formCode && <p>Kod formularza · {item.formCode}</p>}
        {item.authoredOn && <p>Data sporządzenia · {warsaw(item.authoredOn)}</p>}
        {item.signature && (
          <p>
            Podpisy · {item.signature.completed} z {item.signature.required} podpisów
          </p>
        )}
        {item.sourceRead && <p>Odczyt w źródle · {item.sourceRead}</p>}
        {item.readAt && <p>Przeczytano w NEXUS · {warsaw(item.readAt)}</p>}
        {item.delivery && (
          <p>
            Doręczenie ·{" "}
            {
              {
                waiting: "Wymaga odbioru",
                received: "Odebrane",
                deemed: "Uznane za doręczone",
                other: "Inny kanał",
              }[item.delivery]
            }
            {item.deliveryAt ? ` · ${warsaw(item.deliveryAt, true)}` : ""}
          </p>
        )}
        {item.expiryAt && <p>Ważność szkicu · {warsaw(item.expiryAt)}</p>}
        {canOpen ? (
          item.body === undefined ? (
            <p>Brak pliku do podglądu lub pobrania.</p>
          ) : (
            <>
              <h2>Podgląd</h2>
              <p className="nx-fine">WZÓR — DANE FIKCYJNE</p>
              <p className="civic-doc-body">{item.body}</p>
              {item.format && (
                <Button onClick={() => downloadDocument(item)}>
                  Pobierz {item.format.toUpperCase()}
                </Button>
              )}
              {item.attachments?.map((file) => (
                <p key={file.name}>
                  Załącznik · {file.name} · {file.size} B. Dostępne metadane.
                </p>
              ))}
            </>
          )
        ) : (
          <p>Treść będzie dostępna po odbiorze w pokazanym kanale.</p>
        )}
        {item.receipts?.map((receipt) => (
          <div className="nx-note" key={receipt.id}>
            <strong>
              {receipt.type === "UPP"
                ? "Potwierdzenie złożenia — UPP"
                : receipt.type === "UPD"
                  ? "Potwierdzenie odbioru — UPD"
                  : "Potwierdzenie zapisu"}
            </strong>
            <p>Wzór demonstracyjny · {warsaw(receipt.at, true)}</p>
          </div>
        ))}
        {item.source === "pfron" && <SowDocumentActions item={item} />}
        {item.source === "zus" && <ZusDocumentActions item={item} />}
        {item.source === "praca" && <WorkDocumentActions item={item} />}
      </section>
      {item.caseId && <Button onClick={() => go("sprawa", item.caseId!)}>Otwórz sprawę</Button>}
    </div>
  );
}

export function CivicNotifications({ initial }: { initial?: string }) {
  const all = useCivicData();
  const presenterTools = usePresenterTools();
  const go = useNexus((s) => s.go);
  const source = initial ?? "all";
  const select = useNexus((s) => s.select);
  const rows = all
    .flatMap(visibleNotices)
    .filter(({ notice }) => source === "all" || notice.source === source)
    .sort((a, b) => Date.parse(b.event.at) - Date.parse(a.event.at));
  return (
    <div className="nx-stage civic-view">
      <PageHead title="Powiadomienia" />
      <Filters
        label="Źródło powiadomień"
        value={source}
        options={[
          ["all", "Wszystkie"],
          ...all.map((data): [Agency, string] => [data.source, agencyNames[data.source]]),
        ]}
        onChange={(value) => select(value === "all" ? undefined : value)}
      />
      <div className="nx-list">
        {rows.map(({ notice, event }) => (
          <Row
            key={notice.id}
            glyph={civicGlyph[notice.source]}
            title={event.title}
            meta={`${agencyNames[notice.source]} · ${warsaw(event.at, true)} · ${notice.priority === "action" ? "Działanie" : "Informacja"}`}
            aside={
              <Status tone={notice.readAt ? "info" : "warn"}>
                {notice.readAt ? "Przeczytane" : "Nowe"}
              </Status>
            }
            onClick={() => {
              changeCivic(notice.source, (data) => ({
                ...data,
                notices: patch(data.notices, notice.id, { readAt: notice.readAt ?? demoNow }),
              }));
              openTarget(
                notice.source === "sady" && event.target.kind === "document"
                  ? { kind: "module", id: `sady/notice/${event.target.id}` }
                  : event.target,
              );
            }}
          />
        ))}
      </div>
      {!rows.length && <p role="status">Brak powiadomień w tym zakresie.</p>}
      {presenterTools ? (
        <details className="nx-sheet civic-demo">
          <summary>Podgląd powiadomienia push</summary>
          <p>Nowa informacja w aplikacji NEXUS</p>
          <p>Otwórz aplikację, aby zobaczyć szczegóły.</p>
        </details>
      ) : null}
      <Button onClick={() => go("pisma")}>Otwórz pisma z urzędów</Button>
    </div>
  );
}
