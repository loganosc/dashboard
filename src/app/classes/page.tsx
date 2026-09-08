"use client";

import { CourseCard } from "@/components/cards";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";

export default function ClassesPage() {
  const { data } = useAcademic();
  const credits = data.courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <div>
      <PageHeader
        kicker="the greenhouse"
        title="CLASSES"
        subtitle={`${data.courses.length} courses · ${credits} credits this term`}
      />
      <DecorativeDivider />
      <div className="course-grid">
        {data.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
        <PlannerCard lined>
          <p className="card-kicker">how to use</p>
          <p className="muted">
            Each class has its own page for schedule, syllabus, assignments,
            readings, notes, and grades. Later these records will sync from Notion.
          </p>
        </PlannerCard>
      </div>
    </div>
  );
}
