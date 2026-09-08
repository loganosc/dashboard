import "server-only";

import ical, { type CalendarResponse, type EventInstance, type VEvent } from "node-ical";
import type { AcademicEvent, Assignment, AssignmentType, Course } from "@/lib/types";

function parameterValue(value: VEvent["summary"] | VEvent["location"] | VEvent["description"] | VEvent["url"] | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.val;
}

function courseFromSummary(summary: string): Course | null {
  const match = summary.match(/\[([^\]]+)\]$/);
  if (!match) return null;
  const sourceCode = match[1].split(".")[0];
  const codeMatch = sourceCode.match(/^([A-Z]+)(\d+)$/i);
  if (!codeMatch) return null;
  const code = `${codeMatch[1].toUpperCase()} ${codeMatch[2]}`;
  return {
    id: `canvas-course-${sourceCode.toLowerCase()}`,
    code,
    name: `Canvas course ${code}`,
    professor: "",
    credits: 0,
    color: "sage",
    meeting: { days: [], start: "", end: "", location: "" },
  };
}

function parts(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
}

function eventFromInstance(instance: EventInstance, index: number): AcademicEvent {
  const source = instance.event;
  const timeZone = instance.start.tz ?? process.env.CALENDAR_TIMEZONE ?? "America/New_York";
  const start = parts(instance.start, timeZone);
  const end = parts(instance.end, timeZone);

  return {
    id: `canvas-${source.uid}-${start.year}-${start.month}-${start.day}-${index}`,
    title: parameterValue(instance.summary),
    date: `${start.year}-${start.month}-${start.day}`,
    startTime: instance.isFullDay ? undefined : `${start.hour}:${start.minute}`,
    endTime: instance.isFullDay ? undefined : `${end.hour}:${end.minute}`,
    kind: "class",
    notes: [parameterValue(source.location), parameterValue(source.description)]
      .filter(Boolean)
      .join(" · "),
  };
}

function assignmentFromInstance(instance: EventInstance, index: number, courseId: string): Assignment | null {
  const source = instance.event;
  const link = parameterValue(source.url);
  if (!link.includes("#assignment_")) return null;

  const timeZone = instance.start.tz ?? process.env.CALENDAR_TIMEZONE ?? "America/New_York";
  const start = parts(instance.start, timeZone);
  const title = parameterValue(instance.summary).replace(/\s*\[[^\]]+\]\s*$/, "");
  const lowerTitle = title.toLowerCase();
  let type: AssignmentType = "Homework";
  if (lowerTitle.includes("read")) type = "Reading";
  if (lowerTitle.includes("project")) type = "Project";
  if (lowerTitle.includes("quiz") || lowerTitle.includes("pretest")) type = "Quiz";
  if (lowerTitle.includes("exam")) type = "Exam";

  return {
    id: `canvas-${source.uid}-${start.year}-${start.month}-${start.day}-${index}`,
    courseId,
    title: title || "Canvas assignment",
    description: parameterValue(source.description),
    dueDate: `${start.year}-${start.month}-${start.day}`,
    dueTime: instance.isFullDay ? undefined : `${start.hour}:${start.minute}`,
    type,
    priority: "medium",
    status: "Not Started",
    link,
  };
}

function eventInstances(event: VEvent, from: Date, to: Date): EventInstance[] {
  if (event.rrule) {
    return ical.expandRecurringEvent(event, { from, to });
  }

  if (!event.start || event.start < from || event.start > to || event.status === "CANCELLED") {
    return [];
  }

  return [{
    start: event.start,
    end: event.end ?? event.start,
    summary: event.summary,
    isFullDay: event.datetype === "date",
    isRecurring: false,
    isOverride: false,
    event,
  }];
}

export async function loadCalendarFeedData(): Promise<{ courses: Course[]; events: AcademicEvent[]; assignments: Assignment[] }> {
  const url = process.env.CALENDAR_FEED_URL;
  if (!url) return { courses: [], events: [], assignments: [] };

  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Calendar feed returned ${response.status}`);

  const calendar = (await response.text()) as string;
  const parsed = ical.parseICS(calendar) as CalendarResponse;
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const to = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const courses = new Map<string, Course>();
  const events: AcademicEvent[] = [];
  const assignments: Assignment[] = [];

  for (const item of Object.values(parsed)) {
    if (item?.type !== "VEVENT") continue;
    for (const [index, instance] of eventInstances(item, from, to).entries()) {
      events.push(eventFromInstance(instance, index));
      const course = courseFromSummary(parameterValue(instance.summary));
      if (course) courses.set(course.id, course);
      const assignment = assignmentFromInstance(instance, index, course?.id ?? "");
      if (assignment) assignments.push(assignment);
    }
  }

  return { courses: [...courses.values()], events, assignments };
}