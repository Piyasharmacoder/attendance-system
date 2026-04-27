import { useMemo, useState } from "react";
import {
  useGetOvertimeRequestsQuery,
  useRequestOvertimeMutation,
  useUpdateOvertimeStatusMutation,
} from "../api/overtimeApi";
import { useSelector } from "react-redux";
import {
  Clock,
  User,
  Calendar,
  Shield
} from "lucide-react";

export default function Overtime() {
  const { userInfo } = useSelector((state) => state.auth);
  const isEmployee = userInfo?.role === "employee";
  const isReviewer = userInfo?.role === "manager" || userInfo?.role === "admin";
  const [filters, setFilters] = useState({
    status: "All",
    startDate: "",
    endDate: "",
  });

  const [activeTab, setActiveTab] = useState("request");
  const queryFilters = useMemo(() => {
    return filters;
  }, [filters]);

  const { data, isLoading, refetch } =
    useGetOvertimeRequestsQuery(queryFilters);
  const [requestOvertime, { isLoading: requesting }] =
    useRequestOvertimeMutation();
  const [updateOvertimeStatus, { isLoading: updating }] =
    useUpdateOvertimeStatusMutation();
  const [form, setForm] = useState({
    date: "",
    requestedHours: "",
    reason: "",
  });
  const list = useMemo(() => data?.data || [], [data]);

  const stats = useMemo(() => {
    return list.reduce(
      (acc, item) => {
        if (item.status === "Pending") acc.pending += 1;
        if (item.status === "Approved") acc.approved += 1;
        if (item.status === "Rejected") acc.rejected += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 },
    );
  }, [list]);

  const statusBadgeClass = (status) => {
    if (status === "Approved") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    }
    if (status === "Rejected") {
      return "bg-rose-50 text-rose-700 border border-rose-100";
    }
    return "bg-amber-50 text-amber-700 border border-amber-100";
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    try {
      await requestOvertime({
        date: form.date,
        requestedHours: Number(form.requestedHours),
        reason: form.reason,
      }).unwrap();
      setForm({ date: "", requestedHours: "", reason: "" });
    } catch (error) {
      alert(error?.data?.message || "Failed to request overtime");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateOvertimeStatus({ id, status }).unwrap();
      refetch(); // for refreching the list after update
    } catch (error) {
      alert(error?.data?.message || "Failed to update overtime");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-600 to-green-600 p-5 sm:p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Overtime Workflow</h1>
        <p className="mt-1 text-emerald-50 text-sm sm:text-base">
          {isEmployee
            ? "Request overtime and track approval progress in one place."
            : "Review pending overtime requests and take action quickly."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Approved</p>
          <p className="text-2xl font-bold text-emerald-800">
            {stats.approved}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">Rejected</p>
          <p className="text-2xl font-bold text-rose-800">{stats.rejected}</p>
        </div>
      </div>

      {isEmployee && (
        <div className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("request")}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "request"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Request OT
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("myRequests")}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "myRequests"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              My Requests
            </button>
          </div>
        </div>
      )}

      {isEmployee && activeTab === "request" && (
        <form
          onSubmit={submitRequest}
          className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-800">
            Request Overtime
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              required
              min="1"
              placeholder="Requested hours"
              value={form.requestedHours}
              onChange={(e) =>
                setForm({ ...form, requestedHours: e.target.value })
              }
              className="p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              required
              placeholder="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>
          <button
            disabled={requesting}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {requesting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {(!isEmployee || activeTab === "myRequests") && (
  <div className="relative rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-5 sm:p-7 shadow-md overflow-hidden">

    {/* 🔥 Glow */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200 opacity-30 blur-3xl rounded-full"></div>
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-200 opacity-30 blur-3xl rounded-full"></div>

    {/* HEADER */}
    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow">
          <Clock size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isEmployee ? "My Overtime Requests" : "Overtime Requests"}
          </h2>
          <p className="text-xs text-slate-500">Track and manage overtime workflow</p>
        </div>
      </div>

      {isReviewer && queryFilters.status === "Pending" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
          ⚡ Pending Only
        </span>
      )}
    </div>

    {/* FILTERS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      <select
        value={filters.status}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, status: e.target.value }))
        }
        className="p-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 outline-none"
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>

      <input
        type="date"
        value={filters.startDate}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, startDate: e.target.value }))
        }
        className="p-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 outline-none"
      />

      <input
        type="date"
        value={filters.endDate}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, endDate: e.target.value }))
        }
        className="p-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 outline-none"
      />

      <button
        type="button"
        onClick={() =>
          setFilters({
            status: "All",
            startDate: "",
            endDate: "",
          })
        }
        className="p-3 rounded-xl border border-slate-200 font-medium hover:bg-slate-50 transition"
      >
        Reset
      </button>
    </div>

    {/* CONTENT */}
    {isLoading ? (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
        ))}
      </div>
    ) : (
      <div className="space-y-3">

        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-sm">
            No overtime requests found.
          </div>
        )}

        {list.map((item) => (
          <div
            key={item._id}
            className="group rounded-2xl border border-slate-200 bg-white/70 p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* LEFT INFO */}
              <div className="space-y-1 text-sm text-slate-700">

                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <User size={14} />
                  {item.user?.name || "N/A"}
                </p>

                <p className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(item.date).toLocaleDateString()}
                </p>

                <p className="flex items-center gap-2">
                  <Clock size={14} />
                  {item.requestedHours} hrs
                </p>

                <p className="text-slate-500">
                  {item.reason}
                </p>

                <p className="text-xs text-slate-400">
                  Reviewed By: {item.approvedBy?.name || "Pending"}
                </p>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col gap-2 md:items-end">

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(item.status)}`}
                >
                  <Shield size={12} />
                  {item.status}
                </span>

                {isReviewer && item.status === "Pending" && (
                  <div className="flex gap-2">

                    <button
                      disabled={updating}
                      onClick={() => updateStatus(item._id, "Approved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:scale-105 transition disabled:opacity-60"
                    >
                      Approve
                    </button>

                    <button
                      disabled={updating}
                      onClick={() => updateStatus(item._id, "Rejected")}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:scale-105 transition disabled:opacity-60"
                    >
                      Reject
                    </button>

                  </div>
                )}

              </div>

            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}
