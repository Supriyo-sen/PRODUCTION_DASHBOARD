// DataTable.jsx
import React from "react";

export default function DataTable({ rows = [] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Machine No.</th>
            <th>Shift</th>
            <th>Target</th>
            <th>Actual</th>
            <th>Loss / Profit</th>
            <th>Loss / Profit (%)</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty">
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const diff = r.totalActual - r.totalTarget;
              const percent =
                r.totalTarget > 0 ? (diff / r.totalTarget) * 100 : 0;

              return (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.machine}</td>
                  <td>{r.shift || ""}</td>
                  <td>{Number(r.totalTarget).toLocaleString()}</td>
                  <td>{Number(r.totalActual).toLocaleString()}</td>
                  <td className={diff >= 0 ? "pos" : "neg"}>
                    {diff.toLocaleString()}
                  </td>
                  <td className={percent >= 0 ? "pos" : "neg"}>
                    {percent.toFixed(2)}%
                  </td>
                  <td>{r.items || ""}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
