import { Logo } from "./Logo";
import { REPO_URL, withBase } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="wrap foot-in">
        <a className="brand" href="#top">
          <Logo />
          VERDICT
        </a>
        <span className="lbl">Apache-2.0 · built for the request path</span>
        <span className="rt">
          <a className="lbl" href={withBase("/docs")}>
            Docs
          </a>
          <a className="lbl" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
