import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { DocSearch } from "./DocSearch";
import { GitHubStars } from "./GitHubStars";
import { MobileMenu } from "./MobileMenu";
import { withBase } from "@/lib/site";

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
        <a className="brand" href={withBase("/")}>
          <Logo />
          VERDICT
        </a>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={withBase(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <DocSearch />
          <GitHubStars />
          <ThemeToggle />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
