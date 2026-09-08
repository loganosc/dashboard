"use client";

import { useMemo, useState, type FormEvent } from "react";
import { GardenButton, PlannerCard } from "@/components/PlannerCard";
import { GardenHeading } from "@/components/GardenHeading";
import {
  addDays,
  isoDate,
  itemsForDay,
  parseISODate,
} from "@/lib/data/selectors";
import type { AcademicEvent, AcademicSnapshot } from "@/lib/types";

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function Calendar({
  snapshot,
  initialDate = new Date(),
  onAddEvent,
}: {
  snapshot: AcademicSnapshot;
  initialDate?: Date;
  onAddEvent: (event: Omit<AcademicEvent, "id">) => void;
}) {
  const [cursor, setCursor] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [selected, setSelected] = useState(isoDate(initialDate));
  const [showForm, setShowForm] = useState(false);
  const days = useMemo(
    () => monthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );
  const today = isoDate(new Date());
  const selectedItems = itemsForDay(snapshot, selected);
  const label = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    onAddEvent({
      title,
      date: String(form.get("date") ?? selected),
      startTime: String(form.get("startTime") ?? "") || undefined,
      endTime: String(form.get("endTime") ?? "") || undefined,
      kind: "event",
      notes: String(form.get("notes") ?? "").trim() || undefined,
    });
    event.currentTarget.reset();
    setShowForm(false);
  }

  return (
    <div>
      <div className="page-header">
        <GardenHeading text={label} />
        <div style={{ display: "flex", gap: 8 }}>
          <GardenButton
            tone="ghost"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            prev
          </GardenButton>
          <GardenButton
            tone="sage"
            onClick={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
              setSelected(isoDate(now));
            }}
          >
            today
          </GardenButton>
          <GardenButton
            tone="ghost"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
          >
            next
          </GardenButton>
        </div>
      </div>
      <div className="calendar-wrap">
        <div className="calendar-grid">
          {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
            <div className="cal-head" key={d}>
              {d}
            </div>
          ))}
          {days.map((day) => {
            const iso = isoDate(day);
            const inMonth = day.getMonth() === cursor.getMonth();
            const items = itemsForDay(snapshot, iso).slice(0, 3);
            return (
              <button
                key={iso}
                type="button"
                className={`cal-cell${inMonth ? "" : " muted-day"}${iso === today ? " is-today" : ""}`}
                onClick={() => setSelected(iso)}
              >
                <div className="cal-num">{day.getDate()}</div>
                {items.map((item) => (
                  <div key={item.id} className={`tiny-item ${item.tone}`}>
                    {item.label}
                  </div>
                ))}
              </button>
            );
          })}
        </div>
      </div>
      <PlannerCard lined className="mt-4">
        <p className="card-kicker">
          {parseISODate(selected).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        {selectedItems.length === 0 ? (
          <p className="muted">Nothing planted on this day — a quiet garden hour.</p>
        ) : (
          selectedItems.map((item) => (
            <div key={item.id} className={`tiny-item ${item.tone}`} style={{ marginBottom: 8 }}>
              {item.kind} · {item.label}
            </div>
          ))
        )}
        <GardenButton tone="pink" onClick={() => setShowForm((visible) => !visible)}>
          {showForm ? "close" : "add event"}
        </GardenButton>
        {showForm ? (
          <form className="event-form" onSubmit={handleSubmit}>
            <label>
              event name
              <input className="field" name="title" required placeholder="Study group" />
            </label>
            <label>
              date
              <input className="field" type="date" name="date" defaultValue={selected} required />
            </label>
            <div className="event-time-fields">
              <label>
                starts
                <input className="field" type="time" name="startTime" />
              </label>
              <label>
                ends
                <input className="field" type="time" name="endTime" />
              </label>
            </div>
            <label>
              notes
              <textarea className="field" name="notes" rows={2} placeholder="Optional details" />
            </label>
            <GardenButton tone="sage" type="submit">save event</GardenButton>
          </form>
        ) : null}
      </PlannerCard>
    </div>
  );
}
