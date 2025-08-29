import React, { useEffect, useState } from "react";
import "./index.css";
import ThemeToggle from "./components/ThemeToggle";
import CardGrid from "./components/CardGrid";
import SectionView from "./components/SectionView";
import { DATA } from "./data";

export default function App() {
  const sections = [
    { key: "imd", label: "IMD", hint: "View report →", emoji: "🏭" },
    { key: "refill", label: "REFILL", hint: "View report →", emoji: "🖊️" },
    { key: "foil", label: "FOIL", hint: "View report →", emoji: "✨" },
    {
      key: "extrution",
      label: "EXTRUTION",
      hint: "View report →",
      emoji: "⚙️",
    },
  ];

  const [theme, setTheme] = useState("dark");
  const [route, setRoute] = useState({ page: "home", key: null });

  // init theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  // simple navigation
  const openSection = (key) => setRoute({ page: "section", key });
  const goHome = () => setRoute({ page: "home", key: null });

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="brand">
          <div className="brand__dot" aria-hidden />
          <h1 className="dashboard__title">
            {route.page === "home"
              ? "REPORT OF PRODUCTION"
              : sections.find((s) => s.key === route.key)?.label}
          </h1>
        </div>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {route.page === "home" ? (
        <>
          <p className="dashboard__subtitle">
            Select a section to view details
          </p>
          <main className="dashboard__grid">
            <CardGrid sections={sections} onOpen={openSection} />
          </main>
        </>
      ) : (
        <SectionView
          title={sections.find((s) => s.key === route.key)?.label || ""}
          emoji={sections.find((s) => s.key === route.key)?.emoji || ""}
          rowsByDate={DATA[route.key] || {}}
          onBack={goHome}
        />
      )}

      <footer className="dashboard__footer">
        <small>
          © {new Date().getFullYear()} Supra Pens • Production Dashboard
        </small>
      </footer>
    </div>
  );
}
