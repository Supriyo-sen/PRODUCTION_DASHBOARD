import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PieChart({ rows = [], width = 560, height = 420 }) {
  const canvasRef = useRef(null);

  // track theme (dark/light) from data-theme
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

  // build slices (machine label + % and absolute value)
  const data = useMemo(() => {
    const items = rows
      .map((r) => ({
        machine: String(r.machine ?? ""),
        percent: Number(r.percent ?? 0),
        value: Math.abs(Number(r.extraLess ?? 0)),
      }))
      .filter((d) => d.value > 0);

    const total = items.reduce((a, b) => a + b.value, 0) || 1;

    const withFrac = items.map((x) => ({
      ...x,
      frac: x.value / total,
      label: `${x.machine}  ${x.percent >= 0 ? "+" : ""}${(
        x.percent * 100
      ).toFixed(1)}%`,
    }));

    // stable order (largest first looks nicer)
    withFrac.sort((a, b) => b.frac - a.frac);
    return { total, items: withFrac };
  }, [rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // theme colors
    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue("--text")?.trim() || "#0f172a";
    const bgColor = styles.getPropertyValue("--bg-elev")?.trim() || "#ffffff";

    const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");

    // we draw only the left "pane" of the component; legend is HTML on the right
    const legendPane = 200; // px reserved for legend (right column)
    const cw = Math.max(340, width - legendPane); // drawing width
    const ch = height;

    canvas.width = cw * ratio;
    canvas.height = ch * ratio;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // layout inside canvas
    const pad = 16;
    const cx = cw / 2;
    const cy = ch / 2;
    const r = Math.min(cw, ch) * 0.36;

    // palette
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
      "#f472b6",
      "#4ade80",
      "#c084fc",
      "#fca5a5",
      "#fde047",
    ];

    // clear
    ctx.clearRect(0, 0, cw, ch);

    // draw slices
    let ang = -Math.PI / 2;
    data.items.forEach((s, i) => {
      const next = ang + s.frac * Math.PI * 2;

      // sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, ang, next);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();

      // separator
      ctx.lineWidth = 2;
      ctx.strokeStyle = bgColor; // neat seams
      ctx.stroke();

      // tiny tick (no text) to indicate connection point
      const mid = (ang + next) / 2;
      const tx1 = cx + Math.cos(mid) * (r + 8);
      const ty1 = cy + Math.sin(mid) * (r + 8);
      const tx2 = cx + Math.cos(mid) * (r + 18);
      const ty2 = cy + Math.sin(mid) * (r + 18);
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(148,163,184,0.6)";
      ctx.stroke();

      // inside label only if slice is big enough
      const angle = next - ang;
      const minAngleForText = (12 * Math.PI) / 180; // 12°
      if (angle >= minAngleForText) {
        const ix = cx + Math.cos(mid) * (r * 0.6);
        const iy = cy + Math.sin(mid) * (r * 0.6);
        const pct = Math.round(s.frac * 100);
        ctx.font =
          "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = textColor;
        ctx.fillText(`${pct}%`, ix, iy);
      }

      ang = next;
    });
  }, [data, width, height, themeKey]);

  // legend (HTML) with colors on the right
  const legendItems = data.items.map((s, i) => ({
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
      "#38bdf8",
      "#f472b6",
      "#4ade80",
      "#c084fc",
      "#fca5a5",
      "#fde047",
    ][i % 15],
    text: s.label,
    pct: (s.frac * 100).toFixed(1) + "%",
  }));

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
      {/* left: canvas (pie only) */}
      <div style={{ display: "grid", placeItems: "center" }}>
        <canvas ref={canvasRef} width={width} height={height} />
      </div>

      {/* right: legend (scrollable if long) */}
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
              title={li.text}
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
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              >
                {li.text}
              </span>
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--muted)",
                  fontSize: 12,
                }}
              >
                {li.pct}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
