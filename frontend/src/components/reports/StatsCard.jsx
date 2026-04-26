import { memo } from "react";

const toneMap = {
  emerald:
    "from-emerald-500 to-teal-500 text-white border-emerald-300/20 shadow-emerald-900/15",
  slate: "from-slate-800 to-slate-700 text-white border-slate-500/20 shadow-slate-900/20",
  sky: "from-sky-500 to-cyan-500 text-white border-sky-300/20 shadow-sky-900/15",
  white: "from-white to-slate-50 text-slate-800 border-slate-200 shadow-slate-300/25",
};

function StatsCard({ title, value, subtitle, Icon, tone = "emerald" }) {
  return (
    <article
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-xl transition duration-200 hover:-translate-y-0.5 ${toneMap[tone]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>
        <span className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium opacity-85">{subtitle}</p>
    </article>
  );
}

export default memo(StatsCard);
