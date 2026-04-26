import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add User</h1>
            <p className="text-slate-500 mt-1">Create a new user account from admin panel.</p>
          </div>
          <Link to="/users" className="text-sm font-semibold text-emerald-700 hover:underline">
            Back to Users
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