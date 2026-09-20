import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/docs", label: "Docs" },
  { href: "/api-reference", label: "API" },
  { href: "/#roadmap", label: "Roadmap" },
];

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a className="brand" href="/">
          <Logo />
          VERDICT
        </a>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <span className="ghpill mono">★ 2.4k</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
