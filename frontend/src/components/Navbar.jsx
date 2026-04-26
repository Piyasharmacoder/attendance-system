import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/authSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100/70 bg-gradient-to-r from-emerald-50 via-white to-green-50 px-4 py-3 backdrop-blur-xl md:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Smart Attendance
          </p>
          <h1 className="truncate text-sm font-bold text-slate-800 md:text-base">
            Welcome back, {userInfo?.name || "User"}
          </h1>
        </div>

        <div className="relative flex items-center gap-2 md:gap-4">
          <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 shadow-sm shadow-emerald-100 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            {userInfo?.role || "Employee"}
          </span>

          <button
            type="button"
            className="relative hidden rounded-xl border border-emerald-100 bg-white/90 p-2 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50/70 hover:text-emerald-700 hover:shadow-md md:inline-flex"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="group flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-2 py-1.5 shadow-sm shadow-emerald-100/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md md:px-3"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-sm font-black text-white">
              {userInfo?.name?.charAt(0).toUpperCase() || "U"}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
            <span className="hidden text-left md:block">
              <span className="block max-w-32 truncate text-sm font-semibold text-slate-800">
                {userInfo?.name}
              </span>
              <span className="block text-[11px] font-medium text-slate-500">Online</span>
            </span>
            <ChevronDown
                className={`h-4 w-4 text-slate-400 transition duration-200 group-hover:text-emerald-600 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[-1] cursor-default"
                onClick={() => setOpen(false)}
                aria-label="Close user menu overlay"
              />

              <div className="absolute right-0 top-14 w-72 rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-2xl shadow-emerald-200/40 backdrop-blur">
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-white p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-sm font-bold text-white">
                    {userInfo?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{userInfo?.name}</p>
                    <p className="truncate text-xs text-slate-500">{userInfo?.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:translate-x-1 hover:bg-emerald-50/70 hover:text-emerald-700"
                  >
                    <CircleUserRound className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:translate-x-1 hover:bg-emerald-50/70 hover:text-emerald-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    My Stats
                  </button>

                  <div className="my-2 h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold text-red-500 transition-all duration-200 hover:translate-x-1 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                    <span className="ml-auto text-base">→</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}