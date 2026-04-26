import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery } from "../api/apiSlice";

export default function Users() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetUsersQuery();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [statusById, setStatusById] = useState({});
  const [deletedIds, setDeletedIds] = useState({});
  const users = useMemo(() => data || [], [data]);
  const perPage = 8;

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((user) => !deletedIds[user._id])
      .filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !term ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter, deletedIds]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, page]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const managers = users.filter((u) => u.role === "manager").length;
    const employees = users.filter((u) => u.role === "employee").length;
    return { total, admins, managers, employees };
  }, [users]);

  const getRoleBadge = (role) => {
    if (role === "admin") return "bg-violet-100 text-violet-700 border-violet-200";
    if (role === "manager") return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const getStatus = (user) => {
    if (statusById[user._id] !== undefined) return statusById[user._id];
    return user.isActive ?? true;
  };

  const toggleStatus = (user) => {
    const current = getStatus(user);
    const action = current ? "deactivate" : "activate";
    const confirmed = window.confirm(`Are you sure you want to ${action} ${user.name}?`);
    if (!confirmed) return;
    setStatusById((prev) => ({ ...prev, [user._id]: !current }));
  };

  const deleteUser = (user) => {
    const confirmed = window.confirm(`Delete ${user.name}? This action cannot be undone.`);
    if (!confirmed) return;
    setDeletedIds((prev) => ({ ...prev, [user._id]: true }));
  };

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Management Console</h1>
            <p className="text-slate-500 mt-1">
              Monitor users, roles, and access distribution in one place.
            </p>
          </div>
          <button
            onClick={() => navigate("/users/add")}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} color="from-slate-700 to-slate-900" />
        <StatCard title="Admins" value={stats.admins} color="from-violet-500 to-fuchsia-600" />
        <StatCard title="Managers" value={stats.managers} color="from-sky-500 to-cyan-600" />
        <StatCard title="Employees" value={stats.employees} color="from-emerald-500 to-teal-600" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search by name or email"
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                resetToFirstPage();
              }}
              className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-sm font-semibold ${
                viewMode === "table"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 text-sm font-semibold ${
                viewMode === "cards"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 p-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
            <p className="text-slate-700 font-semibold">No users found</p>
            <p className="text-slate-500 text-sm mt-1">
              Try changing search term or role filter.
            </p>
          </div>
        ) : viewMode === "table" ? (
          <UsersTable
            users={paginatedUsers}
            getRoleBadge={getRoleBadge}
            getStatus={getStatus}
            onView={(user) => navigate(`/users/${user._id}`)}
            onEdit={(user) => navigate(`/users/${user._id}/edit`)}
            onToggleStatus={toggleStatus}
            onDelete={deleteUser}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedUsers.map((user) => (
              <div
                key={user._id}
                className="group rounded-2xl border border-slate-100 p-4 bg-gradient-to-br from-white to-slate-50/50 hover:border-emerald-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-600">Status:</span>{" "}
                    <span className={getStatus(user) ? "text-emerald-600" : "text-rose-600"}>
                      {getStatus(user) ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-600">User ID:</span> {user._id}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <ActionButton
                    title="Edit"
                    icon="edit"
                    onClick={() => navigate(`/users/${user._id}/edit`)}
                  />
                  <ActionButton
                    title="View"
                    icon="eye"
                    onClick={() => navigate(`/users/${user._id}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length > 0 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * perPage + 1}-
              {Math.min(page * perPage, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-semibold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-2xl p-4 text-white bg-gradient-to-br ${color} shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-white/80">{title}</p>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}

function UsersTable({ users, getRoleBadge, getStatus, onView, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="min-w-[860px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isActive = getStatus(user);
            return (
              <tr key={user._id} className="border-t border-slate-100 hover:bg-emerald-50/40 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="font-semibold text-slate-700">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionButton label="View" icon="eye" onClick={() => onView(user)} />
                    <ActionButton label="Edit" icon="edit" onClick={() => onEdit(user)} />
                    {/* <ActionButton
                      label={isActive ? "Deactivate" : "Activate"}
                      icon={isActive ? "pause" : "play"}
                      onClick={() => onToggleStatus(user)}
                    />
                    <ActionButton label="Delete" icon="trash" danger onClick={() => onDelete(user)} /> */}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActionButton({ title, onClick, icon, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
        danger
          ? "border-rose-200 text-rose-600 hover:bg-rose-50"
          : "border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon name={icon} />
      {title}
    </button>
  );
}

function Icon({ name }) {
  if (name === "eye") {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "edit") {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    );
  }
  if (name === "pause") {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  if (name === "play") {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6m3 0V4h8v2" />
    </svg>
  );
}