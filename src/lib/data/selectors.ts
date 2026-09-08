import type {
  AcademicSnapshot,
  Assignment,
  Course,
  Exam,
  Weekday,
} from "@/lib/types";

const weekdayNames: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(iso: string) {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function weekdayOf(date: Date): Weekday {
  return weekdayNames[date.getDay()];
}

export function isoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function courseById(snapshot: AcademicSnapshot, id: string) {
  return snapshot.courses.find((course) => course.id === id);
}

export function todayCourses(snapshot: AcademicSnapshot, date = new Date()) {
  const day = weekdayOf(date);
  return snapshot.courses.filter((course) => course.meeting.days.includes(day));
}

export function isSameDay(iso: string, date: Date) {
  return iso === isoDate(date);
}

export function assignmentsDueOn(snapshot: AcademicSnapshot, date: Date) {
  const iso = isoDate(date);
  return snapshot.assignments.filter((item) => item.dueDate === iso);
}

export function upcomingAssignments(
  snapshot: AcademicSnapshot,
  date = new Date(),
  limit = 6,
) {
  const today = isoDate(date);
  return snapshot.assignments
    .filter((item) => item.status !== "Completed" && item.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function upcomingExams(snapshot: AcademicSnapshot, date = new Date()) {
  const today = isoDate(date);
  return snapshot.exams
    .filter((exam) => exam.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function weekDays(date = new Date()) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function assignmentsInRange(
  snapshot: AcademicSnapshot,
  startIso: string,
  endIso: string,
) {
  return snapshot.assignments.filter(
    (item) => item.dueDate >= startIso && item.dueDate <= endIso,
  );
}

export function filterAssignments(
  items: Assignment[],
  view: "Today" | "This Week" | "Upcoming" | "Completed",
  date = new Date(),
) {
  const today = isoDate(date);
  const weekEnd = isoDate(addDays(startOfWeek(date), 6));
  if (view === "Completed") return items.filter((item) => item.status === "Completed");
  const open = items.filter((item) => item.status !== "Completed");
  if (view === "Today") return open.filter((item) => item.dueDate === today);
  if (view === "This Week") {
    return open.filter((item) => item.dueDate >= today && item.dueDate <= weekEnd);
  }
  return open
    .filter((item) => item.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function semesterProgress(snapshot: AcademicSnapshot, date = new Date()) {
  const start = parseISODate(snapshot.semester.startDate).getTime();
  const end = parseISODate(snapshot.semester.endDate).getTime();
  const now = date.getTime();
  const pct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  const credits = snapshot.courses.reduce((sum, course) => sum + course.credits, 0);
  const done = snapshot.assignments.filter((item) => item.status === "Completed").length;
  return {
    percent: Math.round(pct),
    credits,
    assignmentDone: done,
    assignmentTotal: snapshot.assignments.length,
    examTotal: snapshot.exams.length,
  };
}

export function courseAssignments(snapshot: AcademicSnapshot, courseId: string) {
  return snapshot.assignments.filter((item) => item.courseId === courseId);
}

export function courseExams(snapshot: AcademicSnapshot, courseId: string) {
  return snapshot.exams.filter((item) => item.courseId === courseId);
}

export function courseReadings(snapshot: AcademicSnapshot, courseId: string) {
  return snapshot.readings.filter((item) => item.courseId === courseId);
}

export function courseNotes(snapshot: AcademicSnapshot, courseId: string) {
  return snapshot.notes.filter((item) => item.courseId === courseId);
}

export function weightedCourseGrade(
  snapshot: AcademicSnapshot,
  course: Course,
  overrides: Record<string, number> = {},
) {
  const categories = snapshot.gradeCategories.filter((c) => c.courseId === course.id);
  const items = snapshot.assignments.filter((a) => a.courseId === course.id);
  if (!categories.length) return course.currentGrade ?? null;

  let earned = 0;
  let weightUsed = 0;
  for (const category of categories) {
    const catItems = items.filter((item) => item.category === category.name);
    const scored = catItems.filter((item) => {
      const value = overrides[item.id] ?? item.score;
      return value != null && item.maxScore;
    });
    if (!scored.length) continue;
    const avg =
      scored.reduce((sum, item) => {
        const value = overrides[item.id] ?? item.score ?? 0;
        return sum + (value / (item.maxScore || 1)) * 100;
      }, 0) / scored.length;
    earned += avg * (category.weight / 100);
    weightUsed += category.weight;
  }
  if (!weightUsed) return course.currentGrade ?? null;
  return Math.round((earned / (weightUsed / 100)) * 10) / 10;
}

export function calendarItems(snapshot: AcademicSnapshot, iso: string) {
  const classes = snapshot.courses.filter((course) =>
    course.meeting.days.includes(weekdayOf(parseISODate(iso))),
  );
  return {
    classes,
    assignments: snapshot.assignments.filter((item) => item.dueDate === iso),
    exams: snapshot.exams.filter((exam) => exam.date === iso),
    events: snapshot.events.filter((event) => event.date === iso),
  };
}

export function letterGrade(score?: number | null) {
  if (score == null) return "—";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  return "C-";
}

export type CalendarCellItem = {
  id: string;
  label: string;
  tone: Course["color"] | "ink";
  kind: "class" | "assignment" | "exam" | "event";
};

export function itemsForDay(snapshot: AcademicSnapshot, iso: string): CalendarCellItem[] {
  const items: CalendarCellItem[] = [];
  const day = weekdayOf(parseISODate(iso));
  for (const course of snapshot.courses) {
    if (course.meeting.days.includes(day)) {
      items.push({
        id: `class-${course.id}-${iso}`,
        label: course.code,
        tone: course.color,
        kind: "class",
      });
    }
  }
  for (const assignment of snapshot.assignments) {
    if (assignment.dueDate === iso) {
      const course = courseById(snapshot, assignment.courseId);
      items.push({
        id: assignment.id,
        label: assignment.title,
        tone: course?.color ?? "cream",
        kind: "assignment",
      });
    }
  }
  for (const exam of snapshot.exams) {
    if (exam.date === iso) {
      items.push({
        id: exam.id,
        label: exam.title,
        tone: "pink",
        kind: "exam",
      });
    }
  }
  for (const event of snapshot.events) {
    if (event.date === iso) {
      items.push({
        id: event.id,
        label: event.title,
        tone: "blue",
        kind: "event",
      });
    }
  }
  return items;
}

export function nextExam(snapshot: AcademicSnapshot, date = new Date()): Exam | undefined {
  return upcomingExams(snapshot, date)[0];
}
