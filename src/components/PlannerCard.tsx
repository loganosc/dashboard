import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PlannerCard({
  children,
  className = "",
  tone,
  lined,
}: {
  children: ReactNode;
  className?: string;
  tone?: "sage" | "blue" | "pink";
  lined?: boolean;
}) {
  const cls = [
    "planner-card",
    tone,
    lined ? "lined" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <section className={cls}>{children}</section>;
}

export function Badge({
  children,
  tone = "status",
}: {
  children: ReactNode;
  tone?: "high" | "medium" | "low" | "status";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function GardenButton({
  children,
  tone = "pink",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "pink" | "sage" | "blue" | "ghost";
}) {
  return (
    <button className={`btn ${tone}`} {...props}>
      {children}
    </button>
  );
}
