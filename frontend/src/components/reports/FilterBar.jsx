import { memo } from "react";
import {
  BadgeCheck,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Filter,
  RotateCcw,
  UserRound,
} from "lucide-react";

function FilterInput({ icon: Icon, children }) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </label>
  );
}

function FilterBar({
  filters,
  onInputChange,
  onApply,
  onReset,
  onExport,
  disableUserId,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-5 shadow-lg shadow-slate-200/40 backdrop-blur">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <Filter className="h-4 w-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Filters & Actions</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FilterInput icon={CalendarDays}>
          <input
            type="date"
            value={filters.startDateInput}
            onChange={(e) => onInputChange("startDateInput", e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </FilterInput>
        <FilterInput icon={CalendarDays}>
          <input
            type="date"
            value={filters.endDateInput}
            onChange={(e) => onInputChange("endDateInput", e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </FilterInput>
        <FilterInput icon={BadgeCheck}>
          <input
            type="text"
            placeholder="User ID"
            value={filters.userIdInput}
            onChange={(e) => onInputChange("userIdInput", e.target.value)}
            disabled={disableUserId}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </FilterInput>
        <FilterInput icon={UserRound}>
          <input
            type="text"
            placeholder="Employee name"
            value={filters.employeeNameInput}
            onChange={(e) => onInputChange("employeeNameInput", e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
          />
        </FilterInput>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-500 hover:to-cyan-400 active:scale-[0.99]"
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </button>
        <button
          type="button"
          onClick={() => onExport("excel")}
          title="Download attendance report in Excel format"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99]"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Excel</span>
        </button>
        <button
          type="button"
          onClick={() => onExport("pdf")}
          title="Download attendance report in PDF format"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
        >
          <FileText className="h-4 w-4" />
          <span>Export PDF</span>
        </button>
      </div>
    </section>
  );
}

export default memo(FilterBar);
