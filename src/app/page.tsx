"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useState } from "react";
import {
  buildDailyWeekCalendarEvents,
  buildWeeklyCalendarEvents,
  formatDateKey,
  formatDateTimeLocal,
  getEventsForWeek,
  weekDays,
} from "@/lib/schedule/calendar";
import {
  dailyTemplateOptions,
  dailyTemplateSamples,
  defaultDailyTemplateByDay,
  defaultWeeklyTemplate,
  eventTagOptions,
  eventTagPalette,
  sampleExistingSchedule,
  weeklyTemplateOptions,
  weeklyTemplateSamples,
} from "@/lib/schedule/sample-data";
import type {
  CalendarEvent,
  DailyTemplateByDay,
  DailyTemplateKey,
  EventTag,
  TemplateTabKey,
  WeeklyTemplateKey,
} from "@/lib/schedule/types";
import styles from "./page.module.css";

const templateTabs = [
  { key: "weekly", label: "Weekly" },
  { key: "daily", label: "Daily" },
] as const;

/**
 * Main schedule page that renders the weekly calendar, month navigator, and event editor modal.
 */
export default function Home() {
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [scheduleEvents, setScheduleEvents] = useState<CalendarEvent[]>(
    sampleExistingSchedule,
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplateTab, setSelectedTemplateTab] =
    useState<TemplateTabKey>("weekly");
  const [weeklyTemplate, setWeeklyTemplate] =
    useState<WeeklyTemplateKey>(defaultWeeklyTemplate);
  const [dailyTemplateByDay, setDailyTemplateByDay] =
    useState<DailyTemplateByDay>(defaultDailyTemplateByDay);
  const today = new Date();

  /**
   * Applies the currently selected template to the target date without changing the visible layout.
   */
  const applyTemplateForDate = (targetDate: Date) => {
    if (selectedTemplateTab === "weekly") {
      if (weeklyTemplate === "None") {
        return;
      }

      setScheduleEvents((current) => [
        ...current,
        ...buildWeeklyCalendarEvents(
          weeklyTemplateSamples[weeklyTemplate],
          targetDate,
          eventTagPalette,
        ),
      ]);
      return;
    }

    setScheduleEvents((current) => [
      ...current,
      ...buildDailyWeekCalendarEvents(
        dailyTemplateByDay,
        targetDate,
        dailyTemplateSamples,
        eventTagPalette,
      ),
    ]);
  };

  /**
   * Applies the chosen template to the currently selected calendar date.
   */
  const applyTemplate = () => {
    applyTemplateForDate(calendarDate);
  };

  /**
   * Synchronizes the focused date when a month cell is clicked in the mini calendar.
   */
  const handleMonthDateClick = (info: { date: Date }) => {
    const nextDate = new Date(info.date);
    setCalendarDate(nextDate);
  };

  /**
   * Keeps the page state aligned with the visible week range in FullCalendar.
   */
  const handleCalendarDatesSet = (info: { start: Date }) => {
    const nextDate = new Date(info.start);
    const currentKey = formatDateKey(calendarDate);
    const nextKey = formatDateKey(nextDate);

    if (currentKey !== nextKey) {
      setCalendarDate(nextDate);
    }
  };

  /**
   * Updates a dragged or resized event in the in-memory schedule list.
   */
  const updateEventInState = (eventId: string, start: string, end: string) => {
    setScheduleEvents((current) =>
      current.map((event) =>
        event.id === eventId ? { ...event, start, end } : event,
      ),
    );
  };

  /**
   * Handles drag-and-drop and resize updates from FullCalendar.
   */
  const handleEventChange = (info: {
    event: { id: string; startStr: string; endStr: string | null };
  }) => {
    const eventId = info.event.id;
    const eventStart = info.event.startStr;
    const eventEnd = info.event.endStr ?? info.event.startStr;

    updateEventInState(eventId, eventStart, eventEnd);
  };

  const selectedEvent = scheduleEvents.find(
    (event) => event.id === selectedEventId,
  );

  /**
   * Opens the editor modal for the clicked event.
   */
  const handleEventClick = (info: {
    event: { id: string };
  }) => {
    setSelectedEventId(info.event.id);
    setIsEditorOpen(true);
  };

  /**
   * Creates a new schedule item when the user selects a time span in the calendar.
   */
  const handleSelect = (info: { startStr: string; endStr: string }) => {
    const newEventId = `schedule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const defaultTag: EventTag = "仕事";

    setSelectedEventId(newEventId);
    setIsEditorOpen(true);
    setScheduleEvents((current) => [
      ...current,
      {
        id: newEventId,
        title: "New Event",
        start: info.startStr,
        end: info.endStr,
        tag: defaultTag,
        backgroundColor: eventTagPalette[defaultTag],
        borderColor: eventTagPalette[defaultTag],
      },
    ]);
  };

  /**
   * Updates the currently selected event field in the editor modal.
   */
  const updateSelectedEventField = <K extends keyof CalendarEvent>(
    field: K,
    value: CalendarEvent[K],
  ) => {
    if (!selectedEventId) {
      return;
    }

    setScheduleEvents((current) =>
      current.map((event) =>
        event.id === selectedEventId ? { ...event, [field]: value } : event,
      ),
    );
  };

  /**
   * Applies the tag and its matching visual palette to the selected event.
   */
  const updateSelectedEventTag = (tag: EventTag) => {
    updateSelectedEventField("tag", tag);
    updateSelectedEventField("backgroundColor", eventTagPalette[tag]);
    updateSelectedEventField("borderColor", eventTagPalette[tag]);
  };

  /**
   * Removes the selected event from the schedule state and closes the modal.
   */
  const handleDeleteSelectedEvent = () => {
    if (!selectedEventId) {
      return;
    }

    setScheduleEvents((current) =>
      current.filter((event) => event.id !== selectedEventId),
    );
    setSelectedEventId(null);
    setIsEditorOpen(false);
  };

  /**
   * Closes the event editor after save or cancel actions.
   */
  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedEventId(null);
  };

  const visibleEvents = getEventsForWeek(calendarDate, scheduleEvents);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {isEditorOpen && selectedEvent ? (
          <div className={styles.editorBackdrop} onClick={closeEditor}>
            <div
              className={styles.editorModal}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.editorHeaderRow}>
                <div>
                  <span className={styles.selectorTag}>Event</span>
                  <h2>Edit</h2>
                </div>
                <button
                  type="button"
                  className={styles.editorCloseButton}
                  onClick={closeEditor}
                >
                  ×
                </button>
              </div>

              <div className={styles.editForm}>
                <label className={styles.selectorLabel}>Title</label>
                <input
                  className={styles.templateInput}
                  value={selectedEvent.title}
                  onChange={(event) =>
                    updateSelectedEventField("title", event.target.value)
                  }
                />

                <label className={styles.selectorLabel}>Start</label>
                <input
                  className={styles.templateInput}
                  type="datetime-local"
                  value={formatDateTimeLocal(selectedEvent.start)}
                  onChange={(event) =>
                    updateSelectedEventField("start", event.target.value)
                  }
                />

                <label className={styles.selectorLabel}>End</label>
                <input
                  className={styles.templateInput}
                  type="datetime-local"
                  value={formatDateTimeLocal(selectedEvent.end)}
                  onChange={(event) =>
                    updateSelectedEventField("end", event.target.value)
                  }
                />

                <label className={styles.selectorLabel}>Tag</label>
                <select
                  className={styles.templateDropdown}
                  value={selectedEvent.tag}
                  onChange={(event) =>
                    updateSelectedEventTag(event.target.value as EventTag)
                  }
                >
                  {eventTagOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>

              </div>

              <div className={styles.editorActions}>
                <button
                  type="button"
                  className={styles.editorSaveButton}
                  onClick={closeEditor}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.editorDeleteButton}
                  onClick={handleDeleteSelectedEvent}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Weekly view</p>
            <h1>Schedule</h1>
          </div>
          <div className={styles.headerMeta}>
            <span>{today.toLocaleDateString()}</span>
          </div>
        </section>

        <div className={styles.dashboard}>
          <div className={styles.sidebar}>
            <section className={styles.templateSelector}>
              <div className={styles.selectorHeader}>
                <span className={styles.selectorTag}>Template</span>
                <h2>Selector</h2>
              </div>

              <div className={styles.tabRow}>
                {templateTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`${styles.tabButton} ${
                      selectedTemplateTab === tab.key ? styles.tabButtonActive : ""
                    }`}
                    onClick={() => setSelectedTemplateTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {selectedTemplateTab === "weekly" ? (
                <div className={styles.selectorGroup}>
                  <label className={styles.selectorLabel}>Weekly Template</label>
                  <select
                    className={styles.templateDropdown}
                    value={weeklyTemplate}
                    onChange={(event) =>
                      setWeeklyTemplate(event.target.value as WeeklyTemplateKey)
                    }
                  >
                    {weeklyTemplateOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.dailySelectorList}>
                  {weekDays.map((day) => (
                    <div key={day} className={styles.dailySelectorGroup}>
                      <div className={styles.dayBadge}>{day}</div>
                      <select
                        className={styles.templateDropdown}
                        value={dailyTemplateByDay[day]}
                        onChange={(event) =>
                          setDailyTemplateByDay((current) => ({
                            ...current,
                            [day]: event.target.value as DailyTemplateKey,
                          }))
                        }
                      >
                        {dailyTemplateOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className={styles.applyButton}
                onClick={applyTemplate}
              >
                Apply {selectedTemplateTab === "weekly" ? "Weekly" : "Daily"} Template
              </button>
            </section>

            <section className={styles.monthly}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="en"
                headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
                height="auto"
                editable={false}
                dateClick={handleMonthDateClick}
                dayHeaders
              />
            </section>
          </div>

          <section className={styles.calendar}>
            <FullCalendar
              key={formatDateKey(calendarDate)}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              initialDate={calendarDate}
              locale="en"
              headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
              slotMinTime="05:00:00"
              slotMaxTime="24:00:00"
              selectable
              selectMirror
              allDaySlot={false}
              weekends
              nowIndicator
              height="auto"
              expandRows
              editable
              events={visibleEvents}
              select={handleSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventChange}
              eventResize={handleEventChange}
              datesSet={handleCalendarDatesSet}
              eventDisplay="block"
              dayHeaderFormat={{ weekday: "short" }}
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
