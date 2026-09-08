import { NextResponse } from "next/server";
import { loadCalendarFeedData } from "@/lib/data/calendar-feed";
import { loadNotionSnapshot } from "@/lib/data/notion-repository";

export async function GET() {
  if (!process.env.NOTION_TOKEN && !process.env.CALENDAR_FEED_URL) {
    return NextResponse.json({ error: "No academic data source is configured" }, { status: 503 });
  }

  try {
    const snapshot = process.env.NOTION_TOKEN
      ? await loadNotionSnapshot()
      : {
          studentName: process.env.NOTION_STUDENT_NAME ?? "Student",
          semester: { id: "feed-semester", name: "Current semester", season: "Fall" as const, year: new Date().getFullYear(), startDate: "", endDate: "", importantDates: [] },
          courses: [],
          assignments: [],
          exams: [],
          events: [],
          readings: [],
          notes: [],
          gradeCategories: [],
        };
    const calendarData = await loadCalendarFeedData();
    const existingCourseCodes = new Set(snapshot.courses.map((course) => course.code));
    return NextResponse.json({
      ...snapshot,
      courses: [
        ...snapshot.courses,
        ...calendarData.courses.filter((course) => !existingCourseCodes.has(course.code)),
      ],
      events: [...snapshot.events, ...calendarData.events],
      assignments: [...snapshot.assignments, ...calendarData.assignments],
    });
  } catch (error) {
    console.error("Academic data load failed", error);
    return NextResponse.json({ error: "Unable to load academic data" }, { status: 502 });
  }
}