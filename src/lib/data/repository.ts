import type { AcademicSnapshot, Assignment, AssignmentStatus } from "@/lib/types";

/**
 * Swap this interface's implementation from MockRepository to a Notion-backed
 * repository later. Client components should never talk to Notion directly.
 */
export interface AcademicRepository {
  load(): Promise<AcademicSnapshot>;
  updateAssignmentStatus?(
    id: string,
    status: AssignmentStatus,
  ): Promise<Assignment>;
}

export const NOTION_ENTITY_MAP = {
  Course: "notion.databases.courses",
  Assignment: "notion.databases.assignments",
  Exam: "notion.databases.exams",
  Event: "notion.databases.events",
  Grade: "notion.databases.grades",
  Reading: "notion.databases.readings",
  Note: "notion.databases.notes",
  Semester: "notion.databases.semesters",
} as const;
