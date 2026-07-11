import scheduleSampleData from "@/data/schedule-sample.json";
import type {
  CalendarEvent,
  DailyTemplateByDay,
  DailyTemplateKey,
  DailyTemplateSlot,
  EventTag,
  EventTagOption,
  WeeklyTemplateKey,
  WeeklyTemplateSlot,
} from "@/lib/schedule/types";

/**
 * JSON payload shape used to keep schedule sample definitions decoupled from the page component.
 */
type ScheduleSamplePayload = {
  eventTagPalette: Record<EventTag, string>;
  eventTagOptions: EventTagOption[];
  weeklyTemplateOptions: WeeklyTemplateKey[];
  dailyTemplateOptions: DailyTemplateKey[];
  weeklyTemplateSamples: Record<Exclude<WeeklyTemplateKey, "None">, WeeklyTemplateSlot[]>;
  dailyTemplateSamples: Record<Exclude<DailyTemplateKey, "None">, DailyTemplateSlot[]>;
  sampleExistingSchedule: CalendarEvent[];
  defaultWeeklyTemplate: WeeklyTemplateKey;
  defaultDailyTemplateByDay: DailyTemplateByDay;
};

const sampleData = scheduleSampleData as ScheduleSamplePayload;

/**
 * Event color mapping extracted from the sample JSON.
 */
export const eventTagPalette = sampleData.eventTagPalette;

/**
 * Tag selector options extracted from the sample JSON.
 */
export const eventTagOptions = sampleData.eventTagOptions;

/**
 * Weekly template options extracted from the sample JSON.
 */
export const weeklyTemplateOptions = sampleData.weeklyTemplateOptions;

/**
 * Daily template options extracted from the sample JSON.
 */
export const dailyTemplateOptions = sampleData.dailyTemplateOptions;

/**
 * Weekly template samples extracted from the sample JSON.
 */
export const weeklyTemplateSamples = sampleData.weeklyTemplateSamples;

/**
 * Daily template samples extracted from the sample JSON.
 */
export const dailyTemplateSamples = sampleData.dailyTemplateSamples;

/**
 * Existing schedule entries used as the initial calendar dataset.
 */
export const sampleExistingSchedule = sampleData.sampleExistingSchedule;

/**
 * Default selection for the weekly template mode.
 */
export const defaultWeeklyTemplate = sampleData.defaultWeeklyTemplate;

/**
 * Default selection for the daily template mode.
 */
export const defaultDailyTemplateByDay = sampleData.defaultDailyTemplateByDay;
