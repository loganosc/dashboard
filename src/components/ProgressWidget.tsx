import { PlannerCard } from "@/components/PlannerCard";

export function ProgressWidget({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <PlannerCard tone="sage">
      <p className="card-kicker">{label}</p>
      <div className="progress-track" aria-label={`${label} ${value}%`}>
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        {value}% through the term{hint ? ` · ${hint}` : ""}
      </p>
    </PlannerCard>
  );
}
