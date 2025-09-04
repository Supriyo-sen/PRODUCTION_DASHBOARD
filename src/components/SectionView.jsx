// SectionView.jsx
import React, { useMemo, useState } from "react";
import PieChart from "./PieChart";
import DataTable from "./DataTable";
import ABMatrixRange from "./ABMatrix";
import MachinePerformance from "./MachinePerformance";
// Robust numeric extractor: "M/C1", "MC02", "1", "Machine 12" → 1, 2, 1, 12
function getMachineNumber(machine) {
  if (machine == null) return Number.POSITIVE_INFINITY;
  const m = String(machine).match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
}

export default function SectionView({ title, emoji, rowsByDate, onBack }) {
  const allDates = useMemo(() => Object.keys(rowsByDate).sort(), [rowsByDate]);
  const defaultDate = allDates[allDates.length - 1] || "";
  const [date, setDate] = useState(defaultDate);

  // rows for selected date
  const rows = rowsByDate[date] || [];

  // --- Build ABAB per machine, with machines sorted ascending ---
  const interleavedRows = useMemo(() => {
    // Group rows by machine "number|label" to preserve label while sorting by number
    const byMachine = new Map();

    for (const r of rows) {
      const num = getMachineNumber(r.machine);
      const key = `${num}|${r.machine ?? ""}`;

      if (!byMachine.has(key)) {
        byMachine.set(key, { A: [], B: [], other: [] });
      }
      const bucket = byMachine.get(key);
      const shift = String(r.shift || "")
        .trim()
        .toUpperCase();

      if (shift === "A") bucket.A.push(r);
      else if (shift === "B") bucket.B.push(r);
      else bucket.other.push(r); // in case of missing/other shifts
    }

    // Sort machine keys by numeric part ascending
    const sortedKeys = Array.from(byMachine.keys()).sort((ka, kb) => {
      const [na] = ka.split("|");
      const [nb] = kb.split("|");
      return Number(na) - Number(nb);
    });

    // For each machine: push all A rows (in input order), then all B rows, then others
    const out = [];
    for (const k of sortedKeys) {
      const g = byMachine.get(k);
      out.push(...g.A, ...g.B, ...g.other);
    }
    return out;
  }, [rows]);

  // Keep your existing shift-specific arrays for charts
  const rowsA = useMemo(
    () => rows.filter((r) => String(r.shift).toUpperCase() === "A"),
    [rows]
  );
  const rowsB = useMemo(
    () => rows.filter((r) => String(r.shift).toUpperCase() === "B"),
    [rows]
  );

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
      <h3 className="panel__title">
        Production Table (Machine-wise • A then B)
      </h3>
      <DataTable rows={interleavedRows} />

      {/* pie charts side by side */}
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

      <ABMatrixRange rowsByDate={rowsByDate} />
      <MachinePerformance rowsByDate={rowsByDate} />
    </section>
  );
}
