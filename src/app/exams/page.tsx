"use client";

import Link from "next/link";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { courseById, formatShortDate, upcomingExams } from "@/lib/data/selectors";

export default function ExamsPage() {
  const { data } = useAcademic();
  const exams = upcomingExams(data);

  return (
    <div>
      <PageHeader
        kicker="important"
        title="EXAMS"
        subtitle="Upcoming assessments, locations, and a little breathing room to review."
      />
      <DecorativeDivider />
      <div className="stack">
        {exams.map((exam) => {
          const course = courseById(data, exam.courseId);
          return (
            <PlannerCard key={exam.id} tone="pink">
              <p className="card-kicker">{course?.code}</p>
              <h3 style={{ margin: "0 0 6px" }}>{exam.title}</h3>
              <p>
                {formatShortDate(exam.date)}
                {exam.startTime ? ` · ${exam.startTime}` : ""}
                {exam.endTime ? `–${exam.endTime}` : ""}
              </p>
              <p className="muted">{exam.location}</p>
              {exam.notes ? <p className="muted">{exam.notes}</p> : null}
              {course ? (
                <Link href={`/classes/${course.id}`} className="chip sage" style={{ marginTop: 8 }}>
                  open course
                </Link>
              ) : null}
            </PlannerCard>
          );
        })}
        {!exams.length ? <p className="muted">No upcoming exams. Enjoy the quiet.</p> : null}
      </div>
    </div>
  );
}
