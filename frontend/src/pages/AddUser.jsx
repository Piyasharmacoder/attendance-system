import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Info } from 'lucide-react';
import { useCreateUserMutation, useGetManagersQuery } from "../api/apiSlice";

export default function AddUser() {
  const navigate = useNavigate();
  const { data: managersData, isLoading: isManagersLoading } = useGetManagersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const managers = useMemo(() => managersData?.data || [], [managersData]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");

    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        managerId: form.managerId || null,
      }).unwrap();

      setSuccessMessage("User created successfully. Redirecting...");
      setTimeout(() => {
        navigate("/users");
      }, 700);
    } catch (apiError) {
      setSubmitError(apiError?.data?.message || "Unable to create user.");
    }
  };

  return (
    <div className="space-y-6">
<div className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:-translate-y-1">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        
        {/* Left Section: Icon & Text */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 rotate-0 group-hover:rotate-12 shadow-inner">
            <UserPlus size={28} />
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 transition-colors duration-300 hover:text-emerald-600 cursor-default">
              Add User
            </h1>
            
            {/* Animated Underline Text */}
            <div className="relative inline-block mt-1 group/text">
              <p className="text-slate-500 transition-colors duration-300 group-hover/text:text-slate-800 flex items-center gap-2">
                <Info size={14} className="text-emerald-500" />
                Create a new user account from admin panel.
              </p>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-500 group-hover/text:w-full"></span>
            </div>
          </div>
        </div>

        {/* Right Section: Animated Button */}
        <Link 
          to="/users" 
          className="relative overflow-hidden px-6 py-3 rounded-xl bg-green-900 text-white flex items-center gap-2 transition-all duration-300 hover:bg-emerald-600 hover:ring-4 hover:ring-emerald-100 group/btn"
        >
          {/* Moving background effect */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></span>
          
          <ArrowLeft size={18} className="relative z-10 transition-transform duration-300 group-hover/btn:-translate-x-1" />
          <span className="relative z-10 font-bold">Back to Users</span>
        </Link>
        
      </div>
    </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>

          <Field label="Role">
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <Field label="Manager (optional)">
            <select
              name="managerId"
              value={form.managerId}
              onChange={onChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">No Manager</option>
              {isManagersLoading ? (
                <option value="" disabled>
                  Loading managers...
                </option>
              ) : (
                managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} ({manager.email})
                  </option>
                ))
              )}
            </select>
          </Field>
        </div>

        {submitError && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 text-rose-700 text-sm px-4 py-3">
            {submitError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-sm px-4 py-3">
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
          >
            {isCreating ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700 mb-2 block">{label}</span>
      {children}
    </label>
  );
}