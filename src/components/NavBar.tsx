import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { Button } from "./ui";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-style-600 border-b border-custom-300 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 xs:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          className="text-xl font-bold text-primary-500 font-[family-name:var(--font-family-primary)] tracking-wide"
        >
          JTS
        </NavLink>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `text-sm font-semibold font-[family-name:var(--font-family-primary)] transition-colors duration-200
                  ${isActive ? "text-primary-500" : "text-secondary-300 hover:text-primary-400"}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm">Sign In</Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-secondary-100 p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-style-600 border-t border-custom-300 px-4 pb-4 flex flex-col gap-3">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-semibold font-[family-name:var(--font-family-primary)] py-2 transition-colors duration-200
                ${isActive ? "text-primary-500" : "text-secondary-300 hover:text-primary-400"}`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-custom-300">
            <Button variant="outline" size="sm" fullWidth>Sign In</Button>
            <Button size="sm" fullWidth>Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}
