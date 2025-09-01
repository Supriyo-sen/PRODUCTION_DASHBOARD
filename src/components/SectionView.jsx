import React, { useMemo, useState } from "react";
import PieChart from "./PieChart";
import DataTable from "./DataTable";

export default function SectionView({ title, emoji, rowsByDate, onBack }) {
  const allDates = useMemo(() => Object.keys(rowsByDate).sort(), [rowsByDate]);
  const defaultDate = allDates[allDates.length - 1] || "";

  const [date, setDate] = useState(defaultDate);

  const rows = rowsByDate[date] || [];
  const rowsA = rows.filter((r) => String(r.shift).toUpperCase() === "A");
  const rowsB = rows.filter((r) => String(r.shift).toUpperCase() === "B");

  return (
    <section className="section">
      {/* toolbar */}
      <div className="section__toolbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="section__title">
          <span className="section__emoji">{emoji}</span>
          <span>{title} • Report</span>
        </div>
      </div>

      {/* date filter */}
      <div className="filters">
        <label>
          Select date:&nbsp;
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            list="dates-list"
          />
        </label>
        <datalist id="dates-list">
          {allDates.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>

      {/* table */}
      <h3 className="panel__title">Production Table</h3>
      <DataTable rows={rows} />

      {/* two pie charts side by side */}
      <div className="charts-grid">
        <div>
          <h3 className="panel__title">Shift A</h3>
          <div className="chart-wrap">
            <PieChart rows={rowsA} width={460} height={380} />
          </div>
        </div>

        <div>
          <h3 className="panel__title">Shift B</h3>
          <div className="chart-wrap">
            <PieChart rows={rowsB} width={460} height={380} />
          </div>
        </div>
      </div>
    </section>
  );
}
