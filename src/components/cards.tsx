"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/PlannerCard";
import { formatShortDate } from "@/lib/data/selectors";
import type { Assignment, Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/classes/${course.id}`} className="course-card">
      <article className={`planner-card ${course.color}`}>
        <p className="course-code">{course.code}</p>
        <h3 style={{ margin: "4px 0 8px", fontSize: "1.05rem" }}>{course.name}</h3>
        <p className="muted">{course.professor}</p>
        <p className="muted">
          {course.meeting.days.map((d) => d.slice(0, 3)).join(" · ")} ·{" "}
          {course.meeting.start}–{course.meeting.end}
        </p>
        <p className="muted">{course.meeting.location}</p>
      </article>
    </Link>
  );
}

export function AssignmentCard({
  assignment,
  course,
  onStatus,
}: {
  assignment: Assignment;
  course?: Course;
  onStatus?: (status: Assignment["status"]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="planner-card assignment-card">
      <div>
        <p className="card-kicker">{course?.code ?? "Course"}</p>
        <button
          type="button"
          className="assignment-title-button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <h3 style={{ margin: "0 0 6px" }}>{assignment.title}</h3>
        </button>
        {isExpanded ? <p className="muted">{assignment.description}</p> : null}
        <div className="meta-row">
          <Badge>{assignment.type}</Badge>
          <Badge tone={assignment.priority}>{assignment.priority}</Badge>
          <Badge>Due {formatShortDate(assignment.dueDate)}{assignment.dueTime ? ` · ${assignment.dueTime}` : ""}</Badge>
        </div>
      </div>
      <div className="assignment-actions">
        {assignment.link ? (
          <a
            className="btn blue"
            href={assignment.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Canvas
          </a>
        ) : null}
        {onStatus ? (
          <select
            className="select"
            value={assignment.status}
            onChange={(e) => onStatus(e.target.value as Assignment["status"])}
            aria-label={`Status for ${assignment.title}`}
          >
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        ) : (
          <Badge>{assignment.status}</Badge>
        )}
      </div>
    </article>
  );
}
