"use client";

import { Calendar } from "@/components/Calendar";
import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { useAcademic } from "@/lib/data/AcademicProvider";

export default function CalendarPage() {
  const { data, addEvent } = useAcademic();
  return (
    <div>
      <PageHeader
        kicker="paper moon dates"
        title="CALENDAR"
        subtitle="Classes, assignments, exams, and campus events in one planner page."
      />
      <DecorativeDivider />
      <Calendar snapshot={data} onAddEvent={addEvent} />
    </div>
  );
}
