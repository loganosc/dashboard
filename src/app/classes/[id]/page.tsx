"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AssignmentCard } from "@/components/cards";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import {
  courseAssignments,
  courseExams,
  courseNotes,
  courseReadings,
  letterGrade,
} from "@/lib/data/selectors";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, setAssignmentStatus, toggleReading } = useAcademic();
  const course = data.courses.find((item) => item.id === id);

  if (!course) {
    return (
      <PlannerCard>
        <p>That course is not in this garden.</p>
        <Link href="/classes">Back to classes</Link>
      </PlannerCard>
    );
  }

  const assignments = courseAssignments(data, course.id);
  const exams = courseExams(data, course.id);
  const readings = courseReadings(data, course.id);
  const notes = courseNotes(data, course.id);

  return (
    <div>
      <PageHeader
        kicker={course.professor}
        title={course.code}
        pill={course.name}
        subtitle={`${course.meeting.days.join(" / ")} · ${course.meeting.start}–${course.meeting.end} · ${course.meeting.location}`}
      />
      <DecorativeDivider />
      <div className="layout-home">
        <div className="stack">
          <PlannerCard tone={course.color === "cream" ? "sage" : course.color}>
            <p className="card-kicker">course information</p>
            <p>
              <strong>Credits:</strong> {course.credits}
            </p>
            <p>
              <strong>Current grade:</strong> {course.currentGrade}% (
              {letterGrade(course.currentGrade)})
            </p>
            <p>
              <strong>Target:</strong> {course.targetGrade}%
            </p>
            {course.notes ? <p className="muted">{course.notes}</p> : null}
            <div className="bubble-row">
              {course.syllabusUrl ? (
                <a className="chip" href={course.syllabusUrl} target="_blank">
                  Syllabus
                </a>
              ) : null}
              {course.websiteUrl ? (
                <a className="chip sage" href={course.websiteUrl} target="_blank">
                  Course site
                </a>
              ) : null}
            </div>
          </PlannerCard>

          <h3 className="garden-heading" style={{ fontSize: "1.8rem" }}>
            assignments
          </h3>
          {assignments.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              course={course}
              onStatus={(status) => setAssignmentStatus(item.id, status)}
            />
          ))}
        </div>
        <div className="stack">
          <PlannerCard lined>
            <p className="card-kicker">readings</p>
            {readings.map((reading) => (
              <label key={reading.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={reading.completed}
                  onChange={() => toggleReading(reading.id)}
                />
                <span>
                  <strong>{reading.title}</strong>
                  <br />
                  <span className="muted">
                    {reading.source}
                    {reading.dueDate ? ` · ${reading.dueDate}` : ""}
                  </span>
                </span>
              </label>
            ))}
          </PlannerCard>
          <PlannerCard tone="pink">
            <p className="card-kicker">exams</p>
            {exams.length ? (
              exams.map((exam) => (
                <p key={exam.id}>
                  <strong>{exam.title}</strong>
                  <br />
                  <span className="muted">
                    {exam.date} {exam.startTime} {exam.location}
                  </span>
                </p>
              ))
            ) : (
              <p className="muted">No exams listed yet.</p>
            )}
          </PlannerCard>
          <PlannerCard>
            <p className="card-kicker">notes</p>
            {notes.length ? (
              notes.map((note) => (
                <div key={note.id}>
                  <strong>{note.title}</strong>
                  <p className="muted">{note.body}</p>
                </div>
              ))
            ) : (
              <p className="muted">No course notes yet.</p>
            )}
          </PlannerCard>
        </div>
      </div>
    </div>
  );
}
