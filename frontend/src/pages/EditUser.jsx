import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetManagersQuery, useGetUserDetailsQuery, useUpdateUserMutation } from "../api/apiSlice";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetUserDetailsQuery(id, { skip: !id });
  const { data: managersData, isLoading: isManagersLoading } = useGetManagersQuery();
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
        <p className="text-slate-500 text-sm mt-1">{error?.data?.message || "Please try again."}</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Edit User</h1>
            <p className="text-slate-500 mt-1">Update user details and save changes.</p>
          </div>
          <Link to={`/users/${id}`} className="text-sm font-semibold text-emerald-700 hover:underline">
            Back to Details
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </FormField>

          <FormField label="Role">
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
          </FormField>

          <FormField label="Manager">
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
          </FormField>
        </div>

        {submitError && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 text-rose-700 text-sm px-4 py-3">
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/users/${id}`)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
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
      <span className="text-sm font-semibold text-slate-700 mb-2 block">{label}</span>
      {children}
    </label>
  );
}