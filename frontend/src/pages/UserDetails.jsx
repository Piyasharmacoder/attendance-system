import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetUserDetailsQuery } from "../api/apiSlice";
import {
  ArrowLeft,
  Users,
  User,
  Mail,
  Shield,
  Calendar,
  Hash,
} from "lucide-react";


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
  if (status === "Present")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Late") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
};

export default function UserDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetUserDetailsQuery(id, {
    skip: !id,
  });
  const [rangeTab, setRangeTab] = useState("30D");
  const [previewImage, setPreviewImage] = useState("");
  const [search, setSearch] = useState("");

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
    return attendance.filter(
      (record) => new Date(record.date).getMonth() === targetMonth,
    );
  }, [attendance, rangeTab]);


    const stats = useMemo(() => {
    let present = 0, late = 0, absent = 0;

    filteredAttendance.forEach((r) => {
      const status = getAttendanceLabel(r);
      if (status === "Present") present++;
      else if (status === "Late") late++;
      else absent++;
    });

    return { present, late, absent };
  }, [filteredAttendance]);

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
        <p className="text-rose-600 font-semibold">
          Failed to load user details
        </p>
        <p className="text-slate-500 text-sm mt-1">
          {error?.data?.message || "Please try again."}
        </p>
        <Link
          to="/users"
          className="inline-block mt-4 text-sm font-semibold text-emerald-700 hover:underline"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 shadow-lg p-6 md:p-7">
        {/* 🔥 Background Glow Effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-200 opacity-30 blur-3xl rounded-full"></div>

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          {/* LEFT CONTENT */}
          <div className="flex items-center gap-4">
            {/* ICON */}
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md">
              <Users size={26} />
            </div>

            {/* TEXT */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Users Details
              </h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">
                Profile and attendance history for selected user
              </p>
            </div>
          </div>

          {/* RIGHT BUTTON */}
          <Link
            to="/users"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Users
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 shadow-lg p-6 md:p-7">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-200 opacity-30 blur-3xl rounded-full"></div>

        {/* Header */}
        <div className="relative flex items-center gap-4 mb-6">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              User Information
            </h2>
            <p className="text-slate-500 text-sm">
              Detailed profile and account metadata
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <InfoCard icon={<User size={16} />} label="Name" value={user?.name} />
          <InfoCard
            icon={<Mail size={16} />}
            label="Email"
            value={user?.email}
          />
          <InfoCard
            icon={<Shield size={16} />}
            label="Role"
            value={toTitleCase(user?.role)}
          />
          <InfoCard
            icon={<Users size={16} />}
            label="Manager"
            value={user?.manager?.name || "N/A"}
          />
          <InfoCard
            icon={<Calendar size={16} />}
            label="Created"
            value={formatDate(user?.createdAt)}
          />
          <InfoCard
            icon={<Hash size={16} />}
            label="User ID"
            value={user?._id}
          />
        </div>
      </section>

     <section className="space-y-6">

  {/* 🔥 STATS CARDS */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <StatCard title="Present" value={stats.present} color="emerald" />
    <StatCard title="Late" value={stats.late} color="amber" />
    <StatCard title="Absent" value={stats.absent} color="rose" />
  </div>

  {/* 🔍 FILTER BAR */}
  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
    
    <input
      type="text"
      placeholder="Search by date..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
    />

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

  {/* 📊 TABLE */}
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
    
    <div className="overflow-x-auto max-h-[520px]">
      <table className="min-w-[1080px] w-full text-sm">
        
        <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 z-10">
          <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 border-b">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Check-in</th>
            <th className="px-4 py-3">Check-out</th>
            <th className="px-4 py-3">Selfie</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Hours</th>
          </tr>
        </thead>

        <tbody>
          {filteredAttendance
            .filter((r) =>
              formatDate(r.date).toLowerCase().includes(search.toLowerCase())
            )
            .map((record) => {
              const uiStatus = getAttendanceLabel(record);
              const selfie = getSelfie(record);

              return (
                <tr
                  key={record._id}
                  className="border-b hover:bg-emerald-50/40 transition"
                >
                  <td className="px-4 py-3 font-medium">{formatDate(record.date)}</td>
                  <td className="px-4 py-3">{user?.name}</td>
                  <td className="px-4 py-3">{formatDateTime(record?.punchIn?.time)}</td>
                  <td className="px-4 py-3">{formatDateTime(record?.punchOut?.time)}</td>

                  {/* 📸 IMAGE */}
                  <td className="px-4 py-3">
                    {selfie ? (
                      <img
                        src={selfie}
                        onClick={() => setPreviewImage(selfie)}
                        className="h-10 w-10 rounded-full cursor-pointer hover:scale-110 transition"
                      />
                    ) : "—"}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getStatusClass(uiStatus)}`}>
                      {uiStatus}
                    </span>
                  </td>

                  {/* HOURS */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                          style={{ width: `${getVisualPercent(record.workingHours)}%` }}
                        />
                      </div>
                      {record.workingHours ?? 0}h
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>

      </table>
    </div>
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

function InfoCard({ icon, label, value }) {
  return (
    <div className="group relative p-4 rounded-2xl bg-white/70 backdrop-blur border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      {/* hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-100 to-sky-100 opacity-0 group-hover:opacity-40 transition"></div>

      <div className="relative flex items-start gap-3">
        {/* ICON */}
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition">
          {icon}
        </div>

        {/* TEXT */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">{label}</span>
          <span className="text-sm font-semibold text-slate-800 break-all">
            {value || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
function StatCard({ title, value, color }) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="p-4 rounded-2xl bg-white border shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className={`text-2xl font-bold mt-1 ${colors[color]}`}>
        {value}
      </h3>
    </div>
  );
}