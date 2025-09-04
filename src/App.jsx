// App.jsx
import React, { useEffect, useState } from "react";
import "./index.css";

import ThemeToggle from "./components/ThemeToggle";
import CardGrid from "./components/CardGrid";
import SectionView from "./components/SectionView";

import { DEPT_SHEETS } from "./utils/sheetsConfig";
import { fetchSheetData, formatDateToISO } from "./utils/googleSheets";

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

  // THEME
  const [theme, setTheme] = useState("dark");
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

  // ROUTING + DATA
  const [route, setRoute] = useState({ page: "home", key: null }); // {home|section, deptKey}
  const [data, setData] = useState({}); // { [deptKey]: rowsByDate }
  const [loading, setLoading] = useState(null); // deptKey that's loading
  const [error, setError] = useState(null); // string

  const activeSection = sections.find((s) => s.key === route.key);

  // OPEN A SECTION → fetch that sheet/tab and normalize rows
  const openSection = async (key) => {
    const cfg = DEPT_SHEETS[key];
    if (!cfg) {
      setError(`No sheet config found for "${key}".`);
      return;
    }

    setError(null);
    setLoading(key);

    const sheetData = await fetchSheetData(cfg.sheetId, cfg.range);

    // Expect header row: DATE | MACHINE | SHIFT | TARGET | ACTUAL | EXTRA/LESS | PERCENT | ITEMS
    const rowsByDate = (sheetData || []).slice(1).reduce((acc, row) => {
      const [
        date,
        machine,
        shift,
        totalTarget,
        totalActual,
        extraLess,
        percent,
        items,
      ] = row;

      const iso = formatDateToISO(date);
      if (!iso) return acc;

      (acc[iso] ||= []).push({
        date: iso,
        machine: machine || "",
        shift: shift || "",
        totalTarget: Number(totalTarget) || 0,
        totalActual: Number(totalActual) || 0,
        extraLess: Number(extraLess) || 0,
        percent: Number(percent) || 0,
        items: items || "",
      });
      return acc;
    }, {});

    setData((prev) => ({ ...prev, [key]: rowsByDate }));
    setLoading(null);
    setRoute({ page: "section", key });
  };

  const goHome = () => {
    setRoute({ page: "home", key: null });
    setError(null);
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="dashboard__header">
        <div className="brand">
          <div className="brand__dot" aria-hidden />
          <h1 className="dashboard__title">
            {route.page === "home"
              ? "REPORT OF PRODUCTION"
              : activeSection?.label}
          </h1>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* MAIN */}
      {route.page === "home" ? (
        <>
          <p className="dashboard__subtitle">
            Select a section to view details
          </p>
          <main className="dashboard__grid">
            <CardGrid sections={sections} onOpen={openSection} />
          </main>
        </>
      ) : loading === route.key ? (
        <p className="dashboard__subtitle">Loading {activeSection?.label}…</p>
      ) : error ? (
        <p className="dashboard__subtitle neg">{error}</p>
      ) : (
        <SectionView
          title={activeSection?.label || ""}
          emoji={activeSection?.emoji || ""}
          rowsByDate={data[route.key] || {}}
          onBack={goHome}
        />
      )}

      {/* FOOTER */}
      <footer className="dashboard__footer">
        <small>
          © {new Date().getFullYear()} Supra Pens • Production Dashboard
        </small>
      </footer>
    </div>
  );
}
