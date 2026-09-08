import "server-only";

import { Client } from "@notionhq/client";
import type { AcademicSnapshot, Assignment, Course, Exam, AcademicEvent, Reading, Note, Semester, GradeCategory } from "@/lib/types";

type NotionProperty = Record<string, unknown>;
type NotionPage = { id: string; url?: string; properties: Record<string, NotionProperty> };

function getNotionToken() {
  return (process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY)?.trim();
}

function getNotionClient() {
  const token = getNotionToken();
  if (!token) throw new Error("Notion token is not configured");
  return new Client({ auth: token });
}

function value(properties: Record<string, NotionProperty>, names: string[]): NotionProperty | undefined {
  const key = Object.keys(properties).find((name) => names.includes(name.toLowerCase()));
  return key ? properties[key] : undefined;
}

function text(property?: NotionProperty): string {
  if (!property) return "";
  const title = property.title as Array<{ plain_text?: string }> | undefined;
  const richText = property.rich_text as Array<{ plain_text?: string }> | undefined;
  return [...(title ?? []), ...(richText ?? [])].map((item) => item.plain_text ?? "").join("");
}

function stringValue(properties: Record<string, NotionProperty>, names: string[], fallback = "") {
  const property = value(properties, names);
  if (!property) return fallback;
  if (property.type === "title" || property.type === "rich_text") return text(property) || fallback;
  if (property.type === "select") return ((property.select as { name?: string } | null)?.name ?? fallback);
  if (property.type === "status") return ((property.status as { name?: string } | null)?.name ?? fallback);
  if (property.type === "url") return (property.url as string | null) ?? fallback;
  return fallback;
}

function numberValue(properties: Record<string, NotionProperty>, names: string[], fallback = 0) {
  const property = value(properties, names);
  return typeof property?.number === "number" ? property.number : fallback;
}

function dateValue(properties: Record<string, NotionProperty>, names: string[], fallback = "") {
  const property = value(properties, names);
  return ((property?.date as { start?: string } | null)?.start ?? fallback).slice(0, 10);
}

function relationId(properties: Record<string, NotionProperty>, names: string[]) {
  const property = value(properties, names);
  return ((property?.relation as Array<{ id: string }> | undefined)?.[0]?.id ?? "");
}

async function databaseId(name: string) {
  const configured = process.env[`NOTION_${name.toUpperCase()}_DATABASE_ID`];
  if (configured) return configured;
  const response = await getNotionClient().search({
    query: name,
    filter: { property: "object", value: "data_source" },
    page_size: 10,
  });
  const match = response.results.find((item) => {
    const title = "title" in item ? item.title : [];
    return title.some((part) => "plain_text" in part && part.plain_text.toLowerCase() === name.toLowerCase());
  });
  return match?.id;
}

async function pages(name: string): Promise<NotionPage[]> {
  const id = await databaseId(name);
  if (!id) return [];
  const response = await getNotionClient().dataSources.query({ data_source_id: id, page_size: 100 });
  return response.results.filter((item) => "properties" in item) as unknown as NotionPage[];
}

async function loadCourses(): Promise<Course[]> {
  return (await pages("Courses")).map(({ id, url, properties }) => ({
    id,
    code: stringValue(properties, ["code", "course code"]),
    name: stringValue(properties, ["name", "course", "title"], "Untitled course"),
    professor: stringValue(properties, ["professor", "instructor"]),
    credits: numberValue(properties, ["credits"]),
    color: stringValue(properties, ["color"], "sage") as Course["color"],
    meeting: { days: [], start: "", end: "", location: "" },
    syllabusUrl: stringValue(properties, ["syllabus", "syllabus url"]),
    websiteUrl: stringValue(properties, ["website", "website url"]),
    notionUrl: url,
    currentGrade: numberValue(properties, ["current grade"], 0),
    targetGrade: numberValue(properties, ["target grade"], 0),
  }));
}

export function isNotionConfigured() {
  return Boolean(getNotionToken());
}

function richText(value: string) {
  return [{ type: "text", text: { content: value.slice(0, 2000) } }];
}

function titleProperty(value: string) {
  return { title: richText(value) };
}

function textProperty(value: string) {
  return { rich_text: richText(value) };
}

export async function syncNotesToNotion(notes: Note[]) {
  const notionNotes = await pages("Notes");
  const byId = new Map(notes.map((note) => [note.id, note]));

  for (const page of notionNotes) {
    const note = byId.get(page.id);
    if (!note) continue;
    const properties: Record<string, NotionProperty> = {};
    const titleKey = Object.keys(page.properties).find((key) => ["title", "name"].includes(key.toLowerCase()));
    const bodyKey = Object.keys(page.properties).find((key) => ["body", "content", "notes"].includes(key.toLowerCase()));
    if (titleKey) properties[titleKey] = titleProperty(note.title);
    if (bodyKey) properties[bodyKey] = textProperty(note.body);
    if (Object.keys(properties).length) {
      await getNotionClient().pages.update({ page_id: page.id, properties: properties as never });
    }
  }

  const snapshot = await loadNotionSnapshot();
  return { snapshot, updated: notionNotes.filter((page) => byId.has(page.id)).length };
}

export async function loadNotionSnapshot(): Promise<AcademicSnapshot> {
  const [courses, assignments, exams, events, readings, notes, gradeCategories, semesters] = await Promise.all([
    loadCourses(),
    pages("Assignments"),
    pages("Exams"),
    pages("Events"),
    pages("Readings"),
    pages("Notes"),
    pages("Grades"),
    pages("Semesters"),
  ]);

  const mappedAssignments: Assignment[] = assignments.map(({ id, properties }) => ({
    id,
    courseId: relationId(properties, ["course"]),
    title: stringValue(properties, ["title", "name", "assignment"], "Untitled assignment"),
    description: stringValue(properties, ["description"]),
    dueDate: dateValue(properties, ["due date", "due"]),
    dueTime: stringValue(properties, ["due time"]),
    type: stringValue(properties, ["type"], "Other") as Assignment["type"],
    priority: stringValue(properties, ["priority"], "medium") as Assignment["priority"],
    status: stringValue(properties, ["status"], "Not Started") as Assignment["status"],
    link: stringValue(properties, ["link", "url"]),
    category: stringValue(properties, ["category"]),
    weight: numberValue(properties, ["weight"]),
    score: numberValue(properties, ["score"]),
    maxScore: numberValue(properties, ["max score"]),
  }));

  const mappedExams: Exam[] = exams.map(({ id, properties }) => ({
    id,
    courseId: relationId(properties, ["course"]),
    title: stringValue(properties, ["title", "name", "exam"], "Untitled exam"),
    date: dateValue(properties, ["date", "exam date"]),
    startTime: stringValue(properties, ["start time"]),
    endTime: stringValue(properties, ["end time"]),
    location: stringValue(properties, ["location"]),
    notes: stringValue(properties, ["notes"]),
  }));

  const mappedEvents: AcademicEvent[] = events.map(({ id, properties }) => ({
    id,
    title: stringValue(properties, ["title", "name", "event"], "Untitled event"),
    date: dateValue(properties, ["date", "event date"]),
    startTime: stringValue(properties, ["start time"]),
    endTime: stringValue(properties, ["end time"]),
    kind: stringValue(properties, ["kind", "type"], "event") as AcademicEvent["kind"],
    courseId: relationId(properties, ["course"]),
    notes: stringValue(properties, ["notes"]),
  }));

  const mappedReadings: Reading[] = readings.map(({ id, properties }) => ({
    id,
    courseId: relationId(properties, ["course"]),
    title: stringValue(properties, ["title", "name", "reading"], "Untitled reading"),
    source: stringValue(properties, ["source"]),
    dueDate: dateValue(properties, ["due date", "due"]),
    completed: value(properties, ["completed"])?.checkbox === true,
    link: stringValue(properties, ["link", "url"]),
  }));

  const mappedNotes: Note[] = notes.map(({ id, url, properties }) => ({
    id,
    courseId: relationId(properties, ["course"]),
    title: stringValue(properties, ["title", "name"], "Untitled note"),
    notionUrl: url,
    body: stringValue(properties, ["body", "content", "notes"]),
    pinned: value(properties, ["pinned"])?.checkbox === true,
    updatedAt: dateValue(properties, ["updated at", "date"], new Date().toISOString()),
  }));

  const semesterPage = semesters[0];
  const semesterProperties = semesterPage?.properties ?? {};
  const semester: Semester = {
    id: semesterPage?.id ?? "notion-semester",
    name: stringValue(semesterProperties, ["name", "semester"], "Current semester"),
    season: stringValue(semesterProperties, ["season"], "Fall") as Semester["season"],
    year: numberValue(semesterProperties, ["year"], new Date().getFullYear()),
    startDate: dateValue(semesterProperties, ["start date"]),
    endDate: dateValue(semesterProperties, ["end date"]),
    importantDates: [],
  };

  const mappedGrades: GradeCategory[] = gradeCategories.map(({ id, properties }) => ({
    id,
    courseId: relationId(properties, ["course"]),
    name: stringValue(properties, ["name", "category"], "Category"),
    weight: numberValue(properties, ["weight"]),
  }));

  return {
    studentName: process.env.NOTION_STUDENT_NAME ?? "Student",
    semester,
    courses,
    assignments: mappedAssignments,
    exams: mappedExams,
    events: mappedEvents,
    readings: mappedReadings,
    notes: mappedNotes,
    gradeCategories: mappedGrades,
  };
}
