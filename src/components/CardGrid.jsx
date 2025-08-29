import React from "react";

export default function CardGrid({ sections, onOpen }) {
  return sections.map((s) => (
    <button
      key={s.key}
      className="card"
      onClick={() => onOpen(s.key)}
      aria-label={`Open ${s.label} report`}
    >
      <div className="card__shine" aria-hidden />
      <div className="card__content">
        <div className="card__emoji" aria-hidden>
          {s.emoji}
        </div>
        <div className="card__label">{s.label}</div>
        <div className="card__hint">{s.hint}</div>
      </div>
    </button>
  ));
}
