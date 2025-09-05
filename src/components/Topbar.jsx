import React from "react";

export default function Topbar({title, subtitle}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="px-3 py-1 rounded-full border border-white/8 text-sm">Upgrade</button>
        <div className="w-9 h-9 rounded-full bg-white/6"></div>
      </div>
    </div>
  );
}
