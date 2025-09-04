import React, { useMemo, useState } from "react";

function getMachineNumber(machine) {
  if (machine == null) return Number.POSITIVE_INFINITY;
  const m = String(machine).match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
}

function parseYMD(d) {
  if (!d) return null;
  const [y, m, day] = String(d).split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

export default function ABMatrixRange({ rowsByDate = {} }) {
  const allDates = useMemo(() => Object.keys(rowsByDate).sort(), [rowsByDate]);

  // start empty (must select both dates)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    const s = parseYMD(startDate);
    const e = parseYMD(endDate);
    if (!s || !e) return [];
    const lo = Math.min(+s, +e);
    const hi = Math.max(+s, +e);
    return allDates.filter((d) => {
      const dt = parseYMD(d);
      if (!dt) return false;
      const t = +dt;
      return !Number.isNaN(t) && t >= lo && t <= hi;
    });
  }, [allDates, startDate, endDate]);

  const machines = useMemo(() => {
    const set = new Set();
    for (const d of filteredDates) {
      for (const r of rowsByDate[d] || []) {
        if (r && r.machine != null) set.add(r.machine);
      }
    }
    return Array.from(set).sort(
      (a, b) => getMachineNumber(a) - getMachineNumber(b)
    );
  }, [filteredDates, rowsByDate]);

  function getPctFor(date, machine, shift) {
    const rows = rowsByDate[date] || [];
    let target = 0,
      actual = 0;
    for (const r of rows) {
      const sh = String(r.shift || "")
        .trim()
        .toUpperCase();
      if (String(r.machine) === String(machine) && sh === shift) {
        target += Number(r.totalTarget || 0);
        actual += Number(r.totalActual || 0);
      }
    }
    if (target === 0) return null;
    return ((actual - target) / target) * 100;
  }

  const fmt = (pct) => (pct == null ? "—" : `${pct.toFixed(2)}%`);
  const cls = (pct) => (pct == null ? "" : pct >= 0 ? "pos" : "neg"); // ✅ fixed

  return (
    <div className="matrix-range">
      <h3 className="panel__title">Machine-wise % (A / B) — Range</h3>

      <MatrixRangeControls
        allDates={allDates}
        startDate={startDate}
        endDate={endDate}
        onStart={setStartDate}
        onEnd={setEndDate}
      />

      {!startDate || !endDate ? (
        <div className="muted small">
          Select a start and end date to view data.
        </div>
      ) : filteredDates.length === 0 || machines.length === 0 ? (
        <div className="muted small">No data for the selected range.</div>
      ) : (
        <div className="matrix-scroll">
          <table className="matrix-table">
            <thead>
              <tr>
                <th rowSpan="2" className="sticky-col">
                  Date
                </th>
                {machines.map((m) => (
                  <th key={`g-${m}`} colSpan={2} className="group-head">
                    {m}
                  </th>
                ))}
              </tr>
              <tr>
                {machines.map((m) => (
                  <React.Fragment key={`h-${m}`}>
                    <th>A</th>
                    <th>B</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDates.map((d) => (
                <tr key={d}>
                  <td className="sticky-col">{d}</td>
                  {machines.map((m) => {
                    const a = getPctFor(d, m, "A");
                    const b = getPctFor(d, m, "B");
                    return (
                      <React.Fragment key={`${d}-${m}`}>
                        <td className={cls(a)}>{fmt(a)}</td>
                        <td className={cls(b)}>{fmt(b)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MatrixRangeControls({ allDates, startDate, endDate, onStart, onEnd }) {
  return (
    <div className="matrix-range-controls">
      <label>
        From:&nbsp;
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStart(e.target.value)}
          list="matrix-dates"
        />
      </label>
      <label>
        To:&nbsp;
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEnd(e.target.value)}
          list="matrix-dates"
        />
      </label>
      <datalist id="matrix-dates">
        {allDates.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </div>
  );
}
