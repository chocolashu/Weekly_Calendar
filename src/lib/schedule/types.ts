/**
 * The tab key used by the template selector.
 */
export type TemplateTabKey = "weekly" | "daily";

/**
 * Day labels aligned with the FullCalendar week ordering.
 */
export type DayLabel = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

/**
 * Event categories that are used to color schedule items.
 */
export type EventTag = "仕事" | "副業" | "家事" | "遊び";

/**
 * Weekly template names exposed in the selector.
 */
export type WeeklyTemplateKey = "None" | "Focus Week" | "Team Week" | "Client Week";

/**
 * Daily template names exposed in the selector.
 */
export type DailyTemplateKey = "None" | "Balanced Day" | "Deep Work Day" | "Meeting Day";

/**
 * A single calendar event rendered by FullCalendar.
 */
export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  tag: EventTag;
  backgroundColor: string;
  borderColor: string;
};

/**
 * A slot entry for a weekly template.
 */
export type WeeklyTemplateSlot = {
  day: DayLabel;
  title: string;
  startHour: number;
  duration: number;
  tag: EventTag;
};

/**
 * A slot entry for a daily template.
 */
export type DailyTemplateSlot = {
  title: string;
  startHour: number;
  duration: number;
  tag: EventTag;
};

/**
 * Per-day mapping of template selection for the daily mode.
 */
export type DailyTemplateByDay = Record<DayLabel, DailyTemplateKey>;

/**
 * A selectable tag option used in the event editor.
 */
export type EventTagOption = {
  key: EventTag;
  label: string;
};
