import { memo, useMemo, useState } from "react";
import {
  CalendarDays,
  Camera,
  CircleDot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

function HeaderCell({ icon: Icon, label }) {
  return (
    <th className="px-4 py-3.5">
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
        <Icon className="h-3.5 w-3.5 text-sky-700/80" />
        {label}
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </span>
    </th>
  );
}

function ReportsTable({ records, onPreview, formatDate, formatTime, getVisualPercent, getSelfie }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const searchedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;
    return records.filter((row) => {
      const dateLabel = row?.date ? new Date(row.date).toISOString().split("T")[0] : "";
      const name = (row?.user?.name || "").toLowerCase();
      const userId = (row?.user?._id || "").toLowerCase();
      const status = (row?.status || "").toLowerCase();
      return (
        name.includes(term) ||
        userId.includes(term) ||
        status.includes(term) ||
        dateLabel.includes(term)
      );
    });
  }, [records, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(searchedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedRows.slice(start, start + pageSize);
  }, [currentPage, searchedRows]);

  const statusClass = (status) =>
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Attendance Logs</h2>
          <p className="text-sm text-slate-500">Search, inspect records, and preview selfies.</p>
        </div>
        <label className="relative block w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, date, user ID, status"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-2xl border border-slate-200">
        <table className="min-w-[1120px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-sky-100/95 via-slate-100/95 to-emerald-100/95 shadow-sm backdrop-blur">
            <tr className="text-left">
              <HeaderCell icon={CalendarDays} label="Date" />
              <HeaderCell icon={UserRound} label="Employee Name" />
              <HeaderCell icon={Clock3} label="Punch In" />
              <HeaderCell icon={Clock3} label="Punch Out" />
              <HeaderCell icon={CircleDot} label="Status" />
              <HeaderCell icon={Camera} label="Selfie" />
              <HeaderCell icon={MapPin} label="Location" />
              <HeaderCell icon={Clock3} label="Working Hours" />
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const selfie = getSelfie(row);
                const isCompleted = row?.status === "Completed";
                return (
                  <tr
                    key={row._id}
                    className={`border-t border-slate-100 transition duration-200 hover:-translate-y-[1px] hover:bg-sky-50/70 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">{formatDate(row.date)}</td>
                    <td className="px-4 py-3 text-slate-700">{row?.user?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTime(row?.punchIn?.time)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTime(row?.punchOut?.time)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          isCompleted ? "Completed" : "Incomplete"
                        )}`}
                      >
                        {isCompleted ? "Completed" : "Incomplete"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {selfie ? (
                        <button
                          type="button"
                          onClick={() => onPreview(selfie)}
                          className="rounded-full transition hover:scale-105"
                        >
                          <img
                            src={selfie}
                            alt="selfie"
                            className="h-10 w-10 rounded-full border border-slate-300 object-cover"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row?.punchIn?.location
                        ? `${row.punchIn.location.lat}, ${row.punchIn.location.lng}`
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 transition-all duration-500"
                            style={{ width: `${getVisualPercent(row.workingHours)}%` }}
                          />
                        </div>
                        <span className="text-slate-700">{row.workingHours ?? 0}h</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(currentPage - 1) * pageSize + (paginatedRows.length ? 1 : 0)}-
          {(currentPage - 1) * pageSize + paginatedRows.length} of {searchedRows.length}
        </p>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(ReportsTable);
