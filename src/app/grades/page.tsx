"use client";

import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { letterGrade, weightedCourseGrade } from "@/lib/data/selectors";

export default function GradesPage() {
  const { data, scoreOverrides, setScoreOverride } = useAcademic();

  return (
    <div>
      <PageHeader
        kicker="review"
        title="GRADES"
        subtitle="Weighted categories, scored work, and a gentle what-if slider."
      />
      <DecorativeDivider />
      <div className="grade-grid">
        {data.courses.map((course) => {
          const grade = weightedCourseGrade(data, course, scoreOverrides);
          const categories = data.gradeCategories.filter((c) => c.courseId === course.id);
          const work = data.assignments.filter((a) => a.courseId === course.id);
          return (
            <PlannerCard key={course.id} tone={course.color === "cream" ? undefined : course.color}>
              <p className="course-code" style={{ fontSize: "1.4rem" }}>
                {course.code}
              </p>
              <p>
                {grade ?? course.currentGrade}% · {letterGrade(grade ?? course.currentGrade)}
              </p>
              <p className="muted">target {course.targetGrade}%</p>
              <div className="progress-track" style={{ margin: "10px 0 14px" }}>
                <div
                  className="progress-fill"
                  style={{ width: `${grade ?? course.currentGrade ?? 0}%` }}
                />
              </div>
              {categories.map((category) => (
                <p key={category.id} className="muted">
                  {category.name} · {category.weight}%
                </p>
              ))}
              {work
                .filter((item) => item.maxScore)
                .map((item) => {
                  const value = scoreOverrides[item.id] ?? item.score ?? 0;
                  return (
                    <label key={item.id} style={{ display: "block", marginTop: 10 }}>
                      <span className="muted">
                        {item.title} ({value}/{item.maxScore})
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={item.maxScore}
                        value={value}
                        onChange={(e) => setScoreOverride(item.id, Number(e.target.value))}
                        style={{ width: "100%" }}
                      />
                    </label>
                  );
                })}
            </PlannerCard>
          );
        })}
      </div>
    </div>
  );
}
