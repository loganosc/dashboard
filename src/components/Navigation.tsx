import Link from "next/link";

const links = [
  { href: "/", label: "home", tone: "sage" },
  { href: "/classes", label: "classes", tone: "blue" },
  { href: "/assignments", label: "assignments", tone: "pink" },
  { href: "/calendar", label: "calendar", tone: "sage" },
  { href: "/exams", label: "exams", tone: "pink" },
  { href: "/grades", label: "grades", tone: "blue" },
  { href: "/semester", label: "semester", tone: "sage" },
  { href: "/notes", label: "notes", tone: "pink" },
] as const;

export function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="nav-bar" aria-label="Primary">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            data-tone={link.tone}
            className={`nav-tab${active ? " is-active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
