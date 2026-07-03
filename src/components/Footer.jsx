import { Component } from "react";

const columns = [
  ["Audio and Subtitles", "Media Center", "Privacy", "Contact us"],
  ["Audio Description", "Investor Relations", "Legal Notices"],
  ["Help Center", "Jobs", "Cookie Preferences"],
  ["Gift Cards", "Terms of Use", "Corporate Information"],
];

const socials = ["Facebook", "Instagram", "Twitter", "YouTube"];

class Footer extends Component {
  render() {
    return (
      <footer className="app-footer">
        <div className="footer-socials">
          {socials.map((social, index) => (
            <a href="#" key={index} aria-label={social}>
              {social[0]}
            </a>
          ))}
        </div>

        <div className="footer-columns">
          {columns.map((column, colIndex) => (
            <ul className="footer-column" key={colIndex}>
              {column.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <button type="button" className="footer-service-code">
          Service Code
        </button>

        <p className="footer-copy">&copy; 1997-2026 Netflix, Inc.</p>
      </footer>
    );
  }
}

export default Footer;
