"use client";

import { DecorativeDivider, PageHeader } from "@/components/GardenHeading";
import { PlannerCard } from "@/components/PlannerCard";
import { useAcademic } from "@/lib/data/AcademicProvider";
import { courseById } from "@/lib/data/selectors";
import { useState } from "react";

export default function NotesPage() {
  const { data, refresh } = useAcademic();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  async function syncWithNotion() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/notion/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: data.notes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Sync failed");
      await refresh(result.snapshot);
      setSyncMessage(`Synced ${result.updated} note${result.updated === 1 ? "" : "s"}.`);
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="bulletin"
        title="NOTES"
        subtitle="Pinned scraps, course materials, and the links you keep losing."
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
        <button className="chip sage" type="button" onClick={syncWithNotion} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync with Notion"}
        </button>
        {syncMessage && <span className="muted" role="status">{syncMessage}</span>}
      </div>
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
