import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      <span className="theme-toggle__icon" aria-hidden>
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
      <span className="theme-toggle__label">
        {theme === "dark" ? "Dark" : "Light"} mode
      </span>
      <span className="theme-toggle__thumb" />
    </button>
  );
}
