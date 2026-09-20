import { Logo } from "./Logo";

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
          <a className="lbl" href="#">
            Docs
          </a>
          <a className="lbl" href="#">
            GitHub
          </a>
          <a className="lbl" href="#">
            Discord
          </a>
        </span>
      </div>
    </footer>
  );
}
