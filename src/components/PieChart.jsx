import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PieChart({ rows = [], width = 520, height = 400 }) {
  const canvasRef = useRef(null);
  const [themeKey, setThemeKey] = useState(
    document.documentElement.getAttribute("data-theme") || "dark"
  );

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setThemeKey(el.getAttribute("data-theme") || "dark");
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  const data = useMemo(() => {
    const items = rows
      .map((r) => ({
        machine: r.machine,
        value: Math.abs(r.totalActual - r.totalTarget),
      }))
      .filter((d) => d.value > 0);

    const total = items.reduce((a, b) => a + b.value, 0) || 1;

    const withFrac = items.map((x) => ({
      ...x,
      frac: x.value / total,
      label: `${x.machine} (${x.value.toLocaleString()})`,
    }));

    withFrac.sort((a, b) => b.frac - a.frac);
    return { total, items: withFrac };
  }, [rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue("--text")?.trim() || "#0f172a";
    const bgColor = styles.getPropertyValue("--bg-elev")?.trim() || "#ffffff";

    const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");

    const legendPane = 200;
    const cw = Math.max(340, width - legendPane);
    const ch = height;

    canvas.width = cw * ratio;
    canvas.height = ch * ratio;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const cx = cw / 2;
    const cy = ch / 2;
    const r = Math.min(cw, ch) * 0.36;

    const palette = [
      "#60a5fa",
      "#34d399",
      "#fbbf24",
      "#f87171",
      "#a78bfa",
      "#22d3ee",
      "#fb7185",
      "#93c5fd",
      "#f59e0b",
      "#38bdf8",
    ];

    ctx.clearRect(0, 0, cw, ch);

    let ang = -Math.PI / 2;
    data.items.forEach((s, i) => {
      const next = ang + s.frac * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, ang, next);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = bgColor;
      ctx.stroke();

      const mid = (ang + next) / 2;
      const ix = cx + Math.cos(mid) * (r * 0.6);
      const iy = cy + Math.sin(mid) * (r * 0.6);
      if (next - ang > (12 * Math.PI) / 180) {
        ctx.font =
          "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = textColor;
        ctx.fillText(`${Math.round(s.frac * 100)}%`, ix, iy);
      }

      ang = next;
    });
  }, [data, width, height, themeKey]);

  const legendItems = data.items
    .sort((a, b) => {
      // Extract numeric part after "T/"
      const numA = parseInt(a.machine.split("/")[1], 10);
      const numB = parseInt(b.machine.split("/")[1], 10);
      return numA - numB;
    })
    .map((s, i) => {
      const diff = rows.find((r) => r.machine === s.machine);
      const percentDiff =
        diff && diff.totalTarget > 0
          ? ((diff.totalActual - diff.totalTarget) / diff.totalTarget) * 100
          : 0;

      return {
        color: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
          "#22d3ee",
          "#fb7185",
          "#93c5fd",
          "#f59e0b",
        ][i % 9],
        machine: s.machine,
        label: `${s.machine}`, // only machine name
        percentDiff: percentDiff.toFixed(1) + "%",
        positive: percentDiff >= 0,
      };
    });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        gap: "16px",
        alignItems: "center",
        border: "1px solid var(--card-border)",
        borderRadius: "14px",
        background: "var(--bg-elev)",
        padding: "12px",
      }}
    >
      <div style={{ display: "grid", placeItems: "center" }}>
        <canvas ref={canvasRef} width={width} height={height} />
      </div>
      <div
        style={{
          maxHeight: height - 24,
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Breakdown
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {legendItems.map((li, idx) => (
            <li
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr auto",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                borderBottom:
                  idx !== legendItems.length - 1
                    ? "1px dashed var(--card-border)"
                    : "none",
              }}
              title={li.label}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: li.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  color: "var(--text)",
                  fontSize: 13,
                }}
              >
                {li.label}
              </span>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 12,
                  fontWeight: 600,
                  color: li.positive ? "#22c55e" : "#ef4444", // green / red
                }}
              >
                {li.percentDiff}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
