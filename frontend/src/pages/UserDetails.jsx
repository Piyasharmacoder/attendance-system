import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetUserDetailsQuery } from "../api/apiSlice";

const toTitleCase = (value) => {
  if (!value) return "N/A";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAttendanceLabel = (record) => {
  if (!record?.punchIn?.time) return "Absent";
  if (record.status === "Completed") return "Present";
  return "Late";
};

const getStatusClass = (status) => {
  if (status === "Present") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Late") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
};

export default function UserDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetUserDetailsQuery(id, { skip: !id });
  const [rangeTab, setRangeTab] = useState("30D");
  const [previewImage, setPreviewImage] = useState("");

  const user = data?.user;
  const attendance = useMemo(() => data?.attendance || [], [data]);
  const filteredAttendance = useMemo(() => {
    if (rangeTab === "30D") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return attendance.filter((record) => new Date(record.date) >= cutoff);
    }

    const months = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11,
    };

    const targetMonth = months[rangeTab];
    if (targetMonth === undefined) return attendance;
    return attendance.filter((record) => new Date(record.date).getMonth() === targetMonth);
  }, [attendance, rangeTab]);

  const getVisualPercent = (hours) => {
    const safeHours = Number(hours || 0);
    return Math.max(5, Math.min(100, Math.round((safeHours / 10) * 100)));
  };

  const getSelfie = (row) => row?.punchIn?.image || row?.punchIn?.selfie || "";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
          <div className="h-6 w-48 bg-slate-100 rounded" />
          <div className="mt-3 h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
          <div className="h-5 w-40 bg-slate-100 rounded mb-4" />
          <div className="h-28 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
        <p className="text-rose-600 font-semibold">Failed to load user details</p>
        <p className="text-slate-500 text-sm mt-1">
          {error?.data?.message || "Please try again."}
        </p>
        <Link to="/users" className="inline-block mt-4 text-sm font-semibold text-emerald-700 hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Details</h1>
            <p className="text-slate-500 mt-1">Profile and attendance history for selected user.</p>
          </div>
          <Link to="/users" className="text-sm font-semibold text-emerald-700 hover:underline">
            Back to Users
          </Link>
        </div>
      </div>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Name" value={user?.name} />
          <DetailItem label="Email" value={user?.email} />
          <DetailItem label="Role" value={toTitleCase(user?.role)} />
          <DetailItem label="Manager" value={user?.manager?.name || "N/A"} />
          <DetailItem label="Created" value={formatDate(user?.createdAt)} />
          <DetailItem label="User ID" value={user?._id} />
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Attendance Logs</h2>
            <p className="text-sm text-slate-500">Daily punches and status for selected user.</p>
          </div>
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            {["30D", "MAR", "FEB", "JAN", "DEC"].map((tab) => (
              <button
                key={tab}
                onClick={() => setRangeTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  rangeTab === tab
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[520px] border border-slate-100 rounded-2xl">
          <table className="min-w-[1080px] w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Selfie</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const uiStatus = getAttendanceLabel(record);
                  const selfie = getSelfie(record);
                  return (
                    <tr
                      key={record._id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-slate-700">{user?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(record?.punchIn?.time)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(record?.punchOut?.time)}</td>
                      <td className="px-4 py-3">
                        {selfie ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(selfie)}
                            className="focus:outline-none"
                          >
                            <img
                              src={selfie}
                              alt="selfie"
                              className="h-10 w-10 rounded-full object-cover border border-slate-200"
                            />
                          </button>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {record?.punchIn?.location
                          ? `${record.punchIn.location.lat}, ${record.punchIn.location.lng}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusClass(uiStatus)}`}
                        >
                          {uiStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                              style={{ width: `${getVisualPercent(record.workingHours)}%` }}
                            />
                          </div>
                          <span className="text-slate-700">{record.workingHours ?? 0}h</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage("")}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Selfie Preview</h3>
              <button
                onClick={() => setPreviewImage("")}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <img
              src={previewImage}
              alt="Selfie preview"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/40">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1 break-all">{value || "N/A"}</p>
    </div>
  );
}