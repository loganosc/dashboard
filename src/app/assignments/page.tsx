"use client";

import { useMemo, useState } from "react";
import { AssignmentCard } from "@/components/cards";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { GardenButton } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { filterAssignments } from "@/lib/data/selectors";
import type { AssignmentStatus, AssignmentType } from "@/lib/types";

const views = ["Today", "This Week", "Upcoming", "Completed"] as const;

export default function AssignmentsPage() {
  const { data, setAssignmentStatus } = useAcademic();
  const [view, setView] = useState<(typeof views)[number]>("Upcoming");
  const [type, setType] = useState<AssignmentType | "All">("All");
  const [status, setStatus] = useState<AssignmentStatus | "All">("All");

  const items = useMemo(() => {
    let list = filterAssignments(data.assignments, view);
    if (type !== "All") list = list.filter((item) => item.type === type);
    if (status !== "All") list = list.filter((item) => item.status === status);
    return list;
  }, [data.assignments, view, type, status]);

  return (
    <div>
      <PageHeader
        kicker="get it done"
        title="ASSIGNMENTS"
        subtitle="Homework, readings, papers, studios — one tidy patch."
      />
      <DecorativeDivider />
      <div className="filters">
        {views.map((item) => (
          <GardenButton
            key={item}
            tone={view === item ? "sage" : "ghost"}
            onClick={() => setView(item)}
          >
            {item}
          </GardenButton>
        ))}
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value as AssignmentType | "All")}
        >
          <option>All</option>
          <option>Homework</option>
          <option>Reading</option>
          <option>Project</option>
          <option>Paper</option>
          <option>Quiz</option>
          <option>Exam</option>
          <option>Other</option>
        </select>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as AssignmentStatus | "All")}
        >
          <option>All</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <div className="assignment-list">
        {items.length ? (
          items.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              course={data.courses.find((c) => c.id === item.courseId)}
              onStatus={(next) => setAssignmentStatus(item.id, next)}
            />
          ))
        ) : (
          <p className="muted">Nothing in this basket. Try another view.</p>
        )}
      </div>
    </div>
  );
}
