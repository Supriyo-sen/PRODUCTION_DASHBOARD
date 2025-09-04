import React, { useMemo, useState } from "react";

// extract first number from labels like "MC-01", "M/C2", "Machine 12" → 1,2,12
function getMachineNumber(machine) {
  if (machine == null) return Number.POSITIVE_INFINITY;
  const m = String(machine).match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
}

/** Parse common date strings to Date @ local midnight.
 * Supports: YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY
 * Returns null if invalid.
 */
function parseDateSmart(str) {
  if (!str) return null;
  const s = String(str).trim();

  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [_, y, mo, d] = m.map(Number);
    const dt = new Date(y, mo - 1, d);
    return isNaN(+dt) ? null : dt;
  }

  // DD-MM-YYYY
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [_, d, mo, y] = m.map(Number);
    const dt = new Date(y, mo - 1, d);
    return isNaN(+dt) ? null : dt;
  }

  // MM/DD/YYYY
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [_, mo, d, y] = m.map(Number);
    const dt = new Date(y, mo - 1, d);
    return isNaN(+dt) ? null : dt;
  }

  return null;
}

function fmtYMD(dt) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

const fmtPct = (pct) => (pct == null ? "—" : `${pct.toFixed(2)}%`);
const clsPct = (pct) => (pct == null ? "" : pct >= 0 ? "pos" : "neg");

export default function MachinePerformance({ rowsByDate = {} }) {
  // Sort actual date keys by time (not lexicographically)
  const allKeysSorted = useMemo(() => {
    const pairs = Object.keys(rowsByDate).map((k) => {
      const dt = parseDateSmart(k);
      return {
        k,
        t: dt ? +new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) : NaN,
      };
    });
    return pairs
      .filter((p) => !Number.isNaN(p.t))
      .sort((a, b) => a.t - b.t)
      .map((p) => p.k);
  }, [rowsByDate]);

  const latestKey = allKeysSorted[allKeysSorted.length - 1] || null;
  const latestDate = latestKey ? parseDateSmart(latestKey) : null;

  const [days, setDays] = useState(10); // 10 / 15 / 30 / 60

  // Window anchored at latest date
  const { loTime, hiTime, windowLabel } = useMemo(() => {
    if (!latestDate || !days)
      return { loTime: null, hiTime: null, windowLabel: "No data" };
    const hi = new Date(
      latestDate.getFullYear(),
      latestDate.getMonth(),
      latestDate.getDate()
    );
    const lo = new Date(hi);
    lo.setDate(lo.getDate() - (Number(days) - 1)); // last N days inclusive
    return {
      loTime: +lo,
      hiTime: +hi,
      windowLabel: `${fmtYMD(lo)} → ${fmtYMD(hi)}`,
    };
  }, [latestDate, days]);

  // Collect rows inside window
  const windowRows = useMemo(() => {
    if (loTime == null || hiTime == null) return [];
    const rows = [];
    for (const k of allKeysSorted) {
      const dt = parseDateSmart(k);
      if (!dt) continue;
      const t = +new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
      if (t >= loTime && t <= hiTime) {
        rows.push(...(rowsByDate[k] || []));
      }
    }
    return rows;
  }, [allKeysSorted, rowsByDate, loTime, hiTime]);

  // Aggregate by machine
  const machinePerf = useMemo(() => {
    const map = new Map(); // machine -> { target, actual }
    for (const r of windowRows) {
      const m = r?.machine ?? "";
      if (!map.has(m)) map.set(m, { target: 0, actual: 0 });
      const obj = map.get(m);
      obj.target += Number(r?.totalTarget || 0);
      obj.actual += Number(r?.totalActual || 0);
    }
    const arr = Array.from(map.entries()).map(
      ([machine, { target, actual }]) => {
        if (target === 0) return { machine, target, actual, pct: null };
        return {
          machine,
          target,
          actual,
          pct: ((actual - target) / target) * 100,
        };
      }
    );
    // Best → worst, nulls last, tie-break by machine number
    arr.sort((a, b) => {
      if (a.pct == null && b.pct == null)
        return getMachineNumber(a.machine) - getMachineNumber(b.machine);
      if (a.pct == null) return 1;
      if (b.pct == null) return -1;
      if (b.pct !== a.pct) return b.pct - a.pct;
      return getMachineNumber(a.machine) - getMachineNumber(b.machine);
    });
    return arr;
  }, [windowRows]);

  return (
    <section className="section">
      <h3 className="panel__title">Which machine gives best performance</h3>

      <div className="perf-controls">
        <label>
          Range:&nbsp;
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={10}>Last 10 days</option>
            <option value={15}>Last 15 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
          </select>
        </label>
        <span className="perf-window muted">
          {latestDate ? windowLabel : "No data"}
        </span>
      </div>

      {!latestDate ? (
        <div className="muted small">No data available.</div>
      ) : machinePerf.length === 0 ? (
        <div className="muted small">No data in this window.</div>
      ) : (
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Machine</th>
                <th>Performance %</th>
                <th>Total Target</th>
                <th>Total Actual</th>
              </tr>
            </thead>
            <tbody>
              {machinePerf.map((m, idx) => (
                <tr key={m.machine}>
                  <td>{idx + 1}</td>
                  <td>{m.machine}</td>
                  <td className={clsPct(m.pct)}>{fmtPct(m.pct)}</td>
                  <td>{Number(m.target ?? 0).toLocaleString()}</td>
                  <td>{Number(m.actual ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
