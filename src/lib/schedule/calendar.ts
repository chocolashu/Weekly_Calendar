import type {
  CalendarEvent,
  DailyTemplateByDay,
  DailyTemplateSlot,
  DayLabel,
  WeeklyTemplateSlot,
} from "@/lib/schedule/types";

/**
 * Week-day order used for template expansion.
 */
export const weekDays: DayLabel[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Converts a JavaScript date into a YYYY-MM-DD string for calendar keys.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Returns the start date of the week that contains the provided reference date.
 */
export function getWeekStart(referenceDate: Date): Date {
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  return startOfWeek;
}

/**
 * Filters events down to the current week based on the provided reference date.
 */
export function getEventsForWeek(
  referenceDate: Date,
  events: CalendarEvent[],
): CalendarEvent[] {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return events.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate < weekEnd;
  });
}

/**
 * Converts an ISO-like datetime string into a local datetime input value.
 */
export function formatDateTimeLocal(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Expands a weekly template into FullCalendar events for the current week.
 */
export function buildWeeklyCalendarEvents(
  slots: WeeklyTemplateSlot[],
  referenceDate: Date,
  palette: Record<string, string>,
): CalendarEvent[] {
  const weekStart = getWeekStart(referenceDate);

  return slots.map((slot) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + weekDays.indexOf(slot.day));

    const start = `${formatDateKey(date)}T${String(slot.startHour).padStart(2, "0")}:00:00`;
    const endHour = slot.startHour + slot.duration;
    const end = `${formatDateKey(date)}T${String(endHour).padStart(2, "0")}:00:00`;

    return {
      id: `template-week-${slot.day}-${slot.title}-${slot.startHour}`,
      title: slot.title,
      start,
      end,
      tag: slot.tag,
      backgroundColor: palette[slot.tag],
      borderColor: palette[slot.tag],
    };
  });
}

/**
 * Expands a daily template for a single selected day into FullCalendar events.
 */
export function buildDailyCalendarEvents(
  slots: DailyTemplateSlot[],
  referenceDate: Date,
  day: DayLabel,
  palette: Record<string, string>,
): CalendarEvent[] {
  const weekStart = getWeekStart(referenceDate);
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + weekDays.indexOf(day));

  return slots.map((slot) => {
    const start = `${formatDateKey(date)}T${String(slot.startHour).padStart(2, "0")}:00:00`;
    const endHour = slot.startHour + slot.duration;
    const end = `${formatDateKey(date)}T${String(endHour).padStart(2, "0")}:00:00`;

    return {
      id: `template-day-${day}-${slot.title}-${slot.startHour}`,
      title: slot.title,
      start,
      end,
      tag: slot.tag,
      backgroundColor: palette[slot.tag],
      borderColor: palette[slot.tag],
    };
  });
}

/**
 * Expands the daily template map into a full-week event list.
 */
export function buildDailyWeekCalendarEvents(
  templateByDay: DailyTemplateByDay,
  referenceDate: Date,
  dailyTemplateSamples: Record<string, DailyTemplateSlot[]>,
  palette: Record<string, string>,
): CalendarEvent[] {
  return weekDays.flatMap((day) => {
    const templateKey = templateByDay[day];

    if (templateKey === "None") {
      return [];
    }

    return buildDailyCalendarEvents(
      dailyTemplateSamples[templateKey],
      referenceDate,
      day,
      palette,
    );
  });
}
