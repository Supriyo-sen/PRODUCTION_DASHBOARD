import React, { useMemo, useState } from "react";
import PieChart from "./PieChart";
import DataTable from "./DataTable";

export default function SectionView({ title, emoji, rowsByDate, onBack }) {
  const allDates = useMemo(() => Object.keys(rowsByDate).sort(), [rowsByDate]);
  const defaultDate = allDates[allDates.length - 1] || "";

  const [tableDate, setTableDate] = useState(defaultDate);
  const [chartDate, setChartDate] = useState(defaultDate);

  const tableRows = rowsByDate[tableDate] || [];
  const chartRows = rowsByDate[chartDate] || [];

  return (
    <section className="section">
      <div className="section__toolbar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="section__title">
          <span className="section__emoji">{emoji}</span>
          <span>{title} • Report</span>
        </div>
      </div>

      <div className="filters">
        <label>
          Table date:&nbsp;
          <input
            type="date"
            value={tableDate}
            onChange={(e) => setTableDate(e.target.value)}
            list="dates-list"
          />
        </label>
        <label>
          Pie chart date:&nbsp;
          <input
            type="date"
            value={chartDate}
            onChange={(e) => setChartDate(e.target.value)}
            list="dates-list"
          />
        </label>

        {/* helper datalist for available dates */}
        <datalist id="dates-list">
          {allDates.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>

      <div className="split">
        <div className="split__left">
          <h3 className="panel__title">Table</h3>
          <DataTable rows={tableRows} />
        </div>
        <div className="split__right">
          <h3 className="panel__title">Pie Chart (by |LESS/EXTRA|)</h3>
          <PieChart rows={chartRows} width={520} height={520} />
        </div>
      </div>
    </section>
  );
}
