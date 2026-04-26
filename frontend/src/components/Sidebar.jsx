import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  Zap,
  Users,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  const { userInfo } = useSelector((state) => state.auth);

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Attendance", path: "/attendance", icon: Clock },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Overtime", path: "/overtime", icon: Zap },
  ];

  if (userInfo?.role === "manager")
    menu.push({ name: "Team", path: "/team", icon: Users });

  if (userInfo?.role === "admin")
    menu.push({ name: "Users", path: "/users", icon: Shield });

  return (
    <aside className="w-72 h-screen hidden md:flex flex-col 
      bg-gradient-to-b from-white via-emerald-50/40 to-white 
      border-r border-emerald-100/60 
      backdrop-blur-xl 
      p-6 transition-all duration-300">

{/* 🚀 BRAND */}
<div className="group flex items-center gap-3 mb-10 px-3 py-2 rounded-xl 
  transition-all duration-300 hover:bg-white/60 backdrop-blur-md 
  hover:shadow-lg hover:shadow-emerald-100 cursor-pointer">

  {/* ICON */}
  <div className="relative w-12 h-12 flex items-center justify-center">
    
    {/* Glow */}
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-green-500 
      rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition"></div>

    {/* Main Icon */}
    <div className="relative w-11 h-11 bg-gradient-to-tr from-emerald-400 to-green-500 
      rounded-2xl flex items-center justify-center shadow-md 
      shadow-emerald-200/50 transition-transform duration-700 
      group-hover:rotate-[360deg]">

      <span className="text-white text-lg font-bold tracking-wide">
        D
      </span>
    </div>
  </div>

  {/* TEXT */}
  <div className="leading-tight">
    <h2 className="text-lg font-extrabold tracking-tight 
      text-[#0A7775] transition-all duration-300 
      group-hover:text-emerald-600">
      DTable
    </h2>

    <span className="text-[10px] font-bold uppercase tracking-widest 
      text-[#0A7775] transition-all duration-300 
      group-hover:text-emerald-400 group-hover:tracking-[0.2em]">
      Workspace
    </span>
  </div>

</div>

      {/* MENU */}
      <div className="flex-1 space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {menu.map((item, i) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={i}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-2xl relative transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:bg-emerald-50/60 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 h-6 w-[3px] bg-emerald-500 rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-transparent group-hover:bg-emerald-100/70"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      {/* Text */}
                      <span
                        className={`text-sm ${
                          isActive ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Active Dot */}
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 border border-emerald-100">
          <p className="text-xs font-semibold text-slate-600">
            Upgrade your workspace
          </p>
          <p className="text-[11px] text-slate-400 mb-2">
            Get advanced analytics & reports
          </p>
          <button className="w-full text-xs font-bold bg-emerald-500 text-white py-2 rounded-xl hover:bg-emerald-600 transition">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}