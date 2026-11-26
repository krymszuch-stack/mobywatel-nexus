import { courtHearings, courtProjection, useCourt } from "./sady";
import { useWork } from "./praca";
import { useZus } from "./zus";
import { useSow } from "./pfron";
import { contexts, visible, type CivicData, type CivicEvent, type CivicNotice } from "./model";

export function caseVisible(data: CivicData, id: string | null) {
  return !id || data.cases.some((item) => item.id === id && visible(data, item));
}

export function visibleEvents(data: CivicData) {
  return data.events
    .filter((event) => visible(data, event) && caseVisible(data, event.caseId))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export function visibleNotices(data: CivicData): { notice: CivicNotice; event: CivicEvent }[] {
  const events = visibleEvents(data);
  return data.notices
    .flatMap((notice) => {
      if (!visible(data, notice) || notice.recipientId !== contexts[data.scope].recipientId)
        return [];
      const event = events.find((item) => item.id === notice.eventId);
      if (!event) return [];
      if (event.type === "task.deadline_reminder") {
        const id = event.id.split("/")[0];
        if (
          !data.tasks.some((task) => task.id === id && task.dueAt && !task.completedAt) ||
          events.some(
            (item) =>
              item.id.startsWith(`${id}/task.deadline_reminder/`) && item.version > event.version,
          )
        )
          return [];
      }
      return [{ notice, event }];
    })
    .sort((a, b) => Date.parse(b.event.at) - Date.parse(a.event.at));
}

export function resetCivicData() {
  useSow.getState().reset();
  useZus.getState().reset();
  useWork.getState().reset();
  useCourt.getState().reset();
}

export function useCivicData(): CivicData[] {
  return [
    useSow((state) => state.data),
    useZus((state) => state.data),
    useWork((state) => state.data),
    courtProjection(useCourt((state) => state.data)),
  ];
}

export function changeCivic(source: CivicData["source"], update: (data: CivicData) => CivicData) {
  if (source === "pfron")
    useSow
      .getState()
      .change((data) => ({ ...data, ...update(data), cases: data.cases, extra: data.extra }));
  if (source === "sady")
    useCourt
      .getState()
      .change((data) => ({ ...data, ...update(data), cases: data.cases, extra: data.extra }));
  if (source === "praca")
    useWork
      .getState()
      .change((data) => ({ ...data, ...update(data), cases: data.cases, extra: data.extra }));
  if (source === "zus")
    useZus.getState().change((data) => ({ ...data, ...update(data), extra: data.extra }));
}

export function useAgencySchedule() {
  const data = useCivicData();
  const court = useCourt((state) => state.data);
  const hearings = courtHearings(court);
  return [
    ...data.flatMap((source) =>
      source.appointments
        .filter((item) => visible(source, item) && item.state === "booked")
        .map((item) => ({
          id: item.id,
          label: item.title,
          at: item.at,
          agency: item.source,
          targetId: `${item.source}/visits/${item.id}`,
        })),
    ),
    ...court.extra.reminders.flatMap((reminder) => {
      const hearing = hearings.find((item) => item.id === reminder.hearingId);
      if (!hearing || reminder.state !== "active") return [];
      return [
        {
          id: reminder.id,
          label: "Przypomnienie o posiedzeniu",
          at: reminder.at,
          agency: "sady" as const,
          targetId: `sady/hearing/${hearing.id}`,
        },
      ];
    }),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

export function useUnreadCivicNotices() {
  return useCivicData()
    .flatMap(visibleNotices)
    .filter(({ notice }) => !notice.readAt).length;
}

export function activeCivicTasks(data: CivicData) {
  return data.tasks.filter(
    (item) => visible(data, item) && caseVisible(data, item.caseId) && !item.completedAt,
  );
}
