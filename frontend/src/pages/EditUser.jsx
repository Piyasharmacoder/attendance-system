import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useGetManagersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../api/apiSlice";
import { ArrowLeft, Users, Shield, User, Mail  } from "lucide-react";
export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetUserDetailsQuery(id, {
    skip: !id,
  });
  const { data: managersData, isLoading: isManagersLoading } =
    useGetManagersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [draftForm, setDraftForm] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const initialForm = useMemo(() => {
    const user = data?.user;
    return {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "employee",
      managerId: user?.manager?._id || user?.manager || "",
    };
  }, [data]);

  const form = draftForm ?? initialForm;
  const managers = useMemo(() => managersData?.data || [], [managersData]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setDraftForm((prev) => ({ ...(prev ?? initialForm), [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    try {
      await updateUser({
        id,
        payload: {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          managerId: form.managerId || null,
        },
      }).unwrap();

      navigate(`/users/${id}`);
    } catch (apiError) {
      setSubmitError(apiError?.data?.message || "Unable to update user.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 w-56 bg-slate-100 rounded" />
        <div className="mt-4 h-32 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
        <p className="text-rose-600 font-semibold">Failed to load user</p>
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
      /* HEADER CARD */
      <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg overflow-hidden">
        {/* 🔥 Background Glow */}
        <div className="absolute -top-12 -right-12 w-52 h-52 bg-emerald-300 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-sky-300 opacity-30 blur-3xl rounded-full"></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 pointer-events-none"></div>

        <div className="relative flex items-center justify-between flex-wrap gap-6">
          {/* 🔹 LEFT */}
          <div className="flex items-center gap-4">
            {/* ICON BOX */}
            <div className="relative">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl">
                <Users size={26} />
              </div>

              {/* Status Dot */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
            </div>

            {/* TEXT */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Edit User
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Admin Panel
                </span>
              </h1>

              <p className="text-slate-500 mt-1 text-sm flex items-center gap-2">
                <Shield size={16} className="text-emerald-500" />
                Update user profile, roles & permissions securely.
              </p>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <Users size={14} />
                <span>Dashboard</span>
                <ArrowLeft size={12} className="rotate-180" />
                <span>Users</span>
                <ArrowLeft size={12} className="rotate-180" />
                <span className="text-slate-600 font-semibold">Edit</span>
              </div>
            </div>
          </div>

          {/* 🔹 RIGHT */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <Shield size={14} />
              Secure Edit Mode
            </div>

            {/* Back Button */}
            <Link
              to={`/users/${id}`}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition"
              />
              Back
            </Link>
          </div>
        </div>
      </div>

<form
  onSubmit={handleSubmit}
  className="relative bg-white/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6 overflow-hidden"
>

  {/* 🔥 Background Glow */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200 opacity-30 blur-3xl rounded-full"></div>
  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-200 opacity-30 blur-3xl rounded-full"></div>

  {/* 🔹 FORM GRID */}
  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* NAME */}
    <FormField label="Full Name">
      <div className="relative group">
        <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition" size={18} />
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
          placeholder="Enter full name"
        />
      </div>
    </FormField>

    {/* EMAIL */}
    <FormField label="Email Address">
      <div className="relative group">
        <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition" size={18} />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          required
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
          placeholder="Enter email"
        />
      </div>
    </FormField>

    {/* ROLE */}
    <FormField label="User Role">
      <div className="relative group">
        <Shield className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition" size={18} />
        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </FormField>

    {/* MANAGER */}
    <FormField label="Assign Manager">
      <div className="relative group">
        <Users className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition" size={18} />
        <select
          name="managerId"
          value={form.managerId}
          onChange={onChange}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-white/70 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
        >
          <option value="">No Manager</option>
          {isManagersLoading ? (
            <option disabled>Loading managers...</option>
          ) : (
            managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name} ({manager.email})
              </option>
            ))
          )}
        </select>
      </div>
    </FormField>

  </div>

  {/* ❌ ERROR MESSAGE */}
  {submitError && (
    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm px-4 py-3">
      ⚠️ {submitError}
    </div>
  )}

  {/* 🔘 ACTION BUTTONS */}
  <div className="relative flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">

    <button
      type="submit"
      disabled={isUpdating}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-md hover:scale-105 transition-all active:scale-95 disabled:opacity-60"
    >
      💾 {isUpdating ? "Saving..." : "Save Changes"}
    </button>

    <button
      type="button"
      onClick={() => navigate(`/users/${id}`)}
      className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
    >
      Cancel
    </button>

  </div>
</form>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700 mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}
