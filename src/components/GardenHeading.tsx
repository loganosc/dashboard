export function GardenHeading({
  text,
  fill = "cream",
}: {
  text: string;
  fill?: "cream" | "sage" | "pink";
}) {
  return (
    <h2 className="garden-heading" data-fill={fill}>
      {text.split("").map((char, i) => (
        <span className="letter" key={`${char}-${i}`}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h2>
  );
}

export function SectionHeader({
  title,
  script,
}: {
  title: string;
  script?: string;
}) {
  return (
    <div className="section-head">
      <GardenHeading text={title} />
      {script ? <span className="script-label">{script}</span> : null}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  subtitle,
  pill,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  pill?: string;
}) {
  const [first, ...rest] = title.split(" ");
  return (
    <header className="page-header">
      <div>
        {kicker ? <p className="hand-kicker">{kicker}</p> : null}
        <div className="pill-pair">
          <span className="word-pill">{first}</span>
          {rest.length ? <span className="word-pill pink">{rest.join(" ")}</span> : null}
          {pill ? <span className="word-pill pink">{pill}</span> : null}
        </div>
        {subtitle ? <p className="muted" style={{ marginTop: 8 }}>{subtitle}</p> : null}
      </div>
    </header>
  );
}

export function DecorativeDivider() {
  return <div className="fence-divider" aria-hidden="true" />;
}
