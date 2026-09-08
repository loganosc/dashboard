"use client";

import Link from "next/link";
import { AssignmentCard, CourseCard } from "@/components/cards";
import { DecorativeDivider, SectionHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { ProgressWidget } from "@/components/ProgressWidget";
import { useAcademic } from "@/lib/data/AcademicProvider";
import {
  formatLongDate,
  greetingForHour,
  isoDate,
  nextExam,
  semesterProgress,
  todayCourses,
  upcomingAssignments,
  weekDays,
} from "@/lib/data/selectors";

export default function HomePage() {
  const { data, setAssignmentStatus } = useAcademic();
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const todayList = todayCourses(data, now);
  const upcoming = upcomingAssignments(data, now, 4);
  const exam = nextExam(data, now);
  const progress = semesterProgress(data, now);
  const week = weekDays(now).slice(0, 5);
  const todayDue = data.assignments.filter(
    (item) => item.dueDate === isoDate(now) && item.status !== "Completed",
  ).length;

  return (
    <div>
      <PlannerCard tone="blue" className="mb-4">
        <p className="hand-kicker">
          {greeting}, {data.studentName}!
        </p>
        <h2 className="display-title pink-shadow" style={{ fontSize: "2.4rem" }}>
          WELCOME
        </h2>
        <p className="date-line">{formatLongDate(now)}</p>
        <div className="bubble-row">
          <span className="chip sage">{todayList.length} classes today</span>
          <span className="chip pink">{todayDue} assignments due</span>
          <span className="chip blue">
            {exam ? `next exam ${exam.title}` : "no exams this week"}
          </span>
        </div>
      </PlannerCard>

      <DecorativeDivider />

      <div className="layout-home">
        <div className="stack">
          <SectionHeader title="THIS WEEK" script="mon–fri" />
          <div className="week-grid">
            {week.map((day) => {
              const iso = isoDate(day);
              const isToday = iso === isoDate(now);
              const classes = todayCourses(data, day);
              const due = data.assignments.filter((item) => item.dueDate === iso);
              return (
                <div key={iso} className={`week-cell${isToday ? " is-today" : ""}`}>
                  <h4>
                    ꒰ {day.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()} ꒱
                  </h4>
                  {classes.map((course) => (
                    <div key={course.id} className={`tiny-item ${course.color}`}>
                      {course.code}
                    </div>
                  ))}
                  {due.map((item) => (
                    <div key={item.id} className="tiny-item pink">
                      {item.title}
                    </div>
                  ))}
                  {!classes.length && !due.length ? (
                    <p className="muted">open sky</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <SectionHeader title="UPCOMING" script="due soon" />
          {upcoming.map((item) => (
            <AssignmentCard
              key={item.id}
              assignment={item}
              course={data.courses.find((c) => c.id === item.courseId)}
              onStatus={(status) => setAssignmentStatus(item.id, status)}
            />
          ))}
          <Link href="/assignments" className="btn ghost" style={{ width: "fit-content" }}>
            see the full list
          </Link>
        </div>

        <div className="stack">
          <SectionHeader title="MY CLASSES" script="fall garden" />
          {data.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          <ProgressWidget
            label="semester progress"
            value={progress.percent}
            hint={`${progress.credits} credits`}
          />
          <PlannerCard lined>
            <p className="card-kicker">quick notes</p>
            {data.notes
              .filter((note) => note.pinned)
              .map((note) => (
                <p key={note.id} className="muted" style={{ marginBottom: 10 }}>
                  <strong>{note.title}.</strong> {note.body}
                </p>
              ))}
          </PlannerCard>
        </div>
      </div>
    </div>
  );
}
