import React from "react";

export default function DataTable({ rows = [] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Machine</th>
            <th>Total Target</th>
            <th>Total Actual</th>
            <th>Less or Extra (E)</th>
            <th>% (F)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty">
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.machine}</td>
                <td>{r.totalTarget.toLocaleString()}</td>
                <td>{r.totalActual.toLocaleString()}</td>
                <td className={r.extraLess >= 0 ? "pos" : "neg"}>
                  {r.extraLess.toLocaleString()}
                </td>
                <td className={r.percent >= 0 ? "pos" : "neg"}>
                  {(r.percent * 100).toFixed(2)}%
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
