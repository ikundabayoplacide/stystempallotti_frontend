import { NavLink } from "react-router-dom";
import { Icon } from "./ui";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

const socials = [
  { id: "github-icon" as const, href: "https://github.com", label: "GitHub" },
  { id: "discord-icon" as const, href: "https://discord.com", label: "Discord" },
  { id: "x-icon" as const, href: "https://x.com", label: "X" },
];

export default function Footer() {
  return (
    <footer className="bg-style-600 border-t border-custom-300 font-[family-name:var(--font-family-primary)]">
      <div className="max-w-7xl mx-auto px-4 xs:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <span className="text-xl font-bold text-primary-500 tracking-wide">JTS</span>

        {/* Links */}
        <ul className="flex flex-wrap justify-center gap-4 md:gap-6">
          {footerLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className="text-sm text-secondary-300 hover:text-primary-400 transition-colors duration-200"
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Socials */}
        <div className="flex items-center gap-4">
          {socials.map(({ id, href, label }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
            >
              <Icon id={id} size={20} />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-custom-300 py-4 text-center text-xs text-custom-700">
        © {new Date().getFullYear()} JTS. All rights reserved.
      </div>
    </footer>
  );
}
