import { useSelector } from "react-redux";
import { useGetDashboardQuery } from "../api/dashboardApi";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data } = useGetDashboardQuery(userInfo?.role, { skip: !userInfo });
  const summary = data?.summary || {};
  const weeklyActivity = [
    { day: "Mon", value: 8.2 },
    { day: "Tue", value: 7.6 },
    { day: "Wed", value: 9.1 },
    { day: "Thu", value: 8.4 },
    { day: "Fri", value: 8.9 },
    { day: "Sat", value: 5.4 },
    { day: "Sun", value: 0 },
  ];
  const weekTargetHours = 48;
  const totalWorkedHours = Number(summary.totalHours || 0);
  const targetProgress = Math.max(0, Math.min(100, Math.round((totalWorkedHours / weekTargetHours) * 100)));
  const attendanceRate = Math.max(
    0,
    Math.min(100, Math.round(((Number(summary.totalDays) || 0) / 7) * 100))
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-green-50 to-white text-slate-800">
      
      {/* 🌟 TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-green-100">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Good Morning, {userInfo?.name || "User"}!
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <span>📅</span> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/attendance")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <span>📍</span> Punch In
          </button>
          <button
            onClick={() => navigate("/attendance")}
            className="flex items-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 active:scale-95"
          >
            <span>👋</span> Punch Out
          </button>
        </div>
      </div>

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon="🕒" 
          title="Total Work Hours" 
          value={summary.totalHours || "00"} 
          color="bg-emerald-500" 
          trend="+2.5% vs last week"
        />
        <StatCard 
          icon="🗓️" 
          title="Days Present" 
          value={summary.totalDays || "0"} 
          color="bg-teal-500" 
          trend="On Track"
        />
        <StatCard 
          icon="⚡" 
          title="Overtime" 
          value={`${summary.overtimeCount || 0} Hrs`} 
          color="bg-green-600" 
          trend="Extra Effort!"
        />
        <StatCard 
          icon="🌴" 
          title="Leaves Taken" 
          value={summary.totalLeaves || "0"} 
          color="bg-slate-700" 
          trend="Available: 12"
        />
      </div>

      {/* 📉 RECENT ACTIVITY / EXTRA SECTION (Placeholder) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-green-50">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span className="p-2 bg-green-100 rounded-lg">📈</span> Weekly Activity
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Your attendance rhythm and work-hour performance for this week.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Target Completion</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-slate-800">{targetProgress}%</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {totalWorkedHours}h of {weekTargetHours}h target
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-100">
                  +4.2%
                </span>
              </div>
              <div className="mt-3 h-2.5 bg-white rounded-full overflow-hidden border border-emerald-100">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Attendance Rate</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-slate-800">{attendanceRate}%</p>
                  <p className="text-xs text-slate-500 mt-1">Based on present days this week</p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-white px-2.5 py-1 rounded-full border border-sky-100">
                  Stable
                </span>
              </div>
              <div className="mt-3 h-2.5 bg-white rounded-full overflow-hidden border border-sky-100">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4 bg-gradient-to-b from-white to-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-700">Day-wise Work Hours</p>
              <p className="text-xs text-slate-500">Avg goal: 8h/day</p>
            </div>

            <div className="flex items-end justify-between gap-3 h-44">
              {weeklyActivity.map((item) => {
                const height = Math.max(8, Math.round((item.value / 10) * 100));
                const isWeekend = item.day === "Sat" || item.day === "Sun";
                return (
                  <div key={item.day} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{item.value}h</span>
                    <div className="w-full max-w-[34px] h-28 bg-slate-100 rounded-xl flex items-end p-1">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          isWeekend
                            ? "bg-gradient-to-t from-slate-400 to-slate-300"
                            : "bg-gradient-to-t from-emerald-500 to-teal-400"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-tr from-green-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Company Notice</h2>
            <p className="text-green-100 text-sm leading-relaxed">
              New attendance policy is live. Please ensure your GPS is enabled while punching in.
            </p>
            <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2 rounded-xl text-sm font-semibold transition-all">
              Read More
            </button>
          </div>
          {/* Abstract Design Element */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

// 🧱 REUSABLE PREMIUM CARD COMPONENT
function StatCard({ icon, title, value, color, trend }) {
  return (
    <div className="group bg-white p-1 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-green-50 hover:-translate-y-2">
      <div className="bg-white rounded-[2.2rem] p-6 h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:rotate-6 transition-transform`}>
            {icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            Live Data
          </span>
        </div>
        
        <div>
          <h3 className="text-slate-500 font-semibold text-sm mb-1">{title}</h3>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-xs font-medium text-green-600">
          <span className="mr-1">↗</span> {trend}
        </div>
      </div>
    </div>
  );
}