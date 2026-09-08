"use client";

import Link from "next/link";
import { CourseCard } from "@/components/cards";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { ProgressWidget } from "@/components/ProgressWidget";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { formatShortDate, semesterProgress, upcomingExams } from "@/lib/data/selectors";

export default function SemesterPage() {
  const { data } = useAcademic();
  const progress = semesterProgress(data);
  const exams = upcomingExams(data);
  const projects = data.assignments.filter((item) => item.type === "Project");

  return (
    <div>
      <PageHeader
        kicker={data.semester.name}
        title="SEMESTER"
        subtitle={`${data.semester.startDate} → ${data.semester.endDate}`}
      />
      <DecorativeDivider />
      <div className="stat-row" style={{ marginBottom: 18 }}>
        <div className="stat">
          <b>{progress.credits}</b>
          credits
        </div>
        <div className="stat">
          <b>{data.courses.length}</b>
          courses
        </div>
        <div className="stat">
          <b>
            {progress.assignmentDone}/{progress.assignmentTotal}
          </b>
          assignments
        </div>
        <div className="stat">
          <b>{progress.examTotal}</b>
          exams
        </div>
      </div>
      <ProgressWidget label="term unfolding" value={progress.percent} />
      <DecorativeDivider />
      <div className="layout-home">
        <div className="stack">
          <h3 className="garden-heading" style={{ fontSize: "1.7rem" }}>
            courses
          </h3>
          {data.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="stack">
          <PlannerCard lined>
            <p className="card-kicker">important dates</p>
            {data.semester.importantDates.map((item) => (
              <p key={item.date}>
                <strong>{formatShortDate(item.date)}</strong> · {item.label}
              </p>
            ))}
          </PlannerCard>
          <PlannerCard tone="pink">
            <p className="card-kicker">exams and reviews</p>
            {exams.map((exam) => (
              <p key={exam.id}>
                {formatShortDate(exam.date)} · {exam.title}
              </p>
            ))}
          </PlannerCard>
          <PlannerCard tone="sage">
            <p className="card-kicker">major projects</p>
            {projects.map((item) => (
              <p key={item.id}>
                {formatShortDate(item.dueDate)} · {item.title}
              </p>
            ))}
            <Link href="/assignments" className="chip" style={{ marginTop: 8 }}>
              assignment list
            </Link>
          </PlannerCard>
        </div>
      </div>
    </div>
  );
}
