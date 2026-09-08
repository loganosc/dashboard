"use client";

import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { courseById } from "@/lib/data/selectors";

export default function NotesPage() {
  const { data } = useAcademic();

  return (
    <div>
      <PageHeader
        kicker="bulletin"
        title="NOTES"
        subtitle="Pinned scraps, course materials, and the links you keep losing."
      />
      <DecorativeDivider />
      <div className="notes-grid">
        {data.notes.map((note) => {
          const course = note.courseId ? courseById(data, note.courseId) : undefined;
          return (
            <PlannerCard key={note.id} lined>
              <p className="card-kicker">
                {note.pinned ? "pinned · " : ""}
                {course?.code ?? "general"}
              </p>
              <h3 style={{ marginTop: 0 }}>{note.title}</h3>
              <p>{note.body}</p>
              {note.notionUrl ? (
                <a className="chip pink" href={note.notionUrl} target="_blank" rel="noopener noreferrer">
                  Open in Notion
                </a>
              ) : null}
              {note.links?.map((link) => (
                <a key={link.url} className="chip sage" href={link.url} target="_blank">
                  {link.label}
                </a>
              ))}
              <p className="muted" style={{ marginTop: 12 }}>
                updated {note.updatedAt}
              </p>
            </PlannerCard>
          );
        })}
      </div>
    </div>
  );
}
