import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery } from "../api/apiSlice";
import { useGetAttendanceQuery } from "../api/attendanceApi";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
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

const getRecordUserId = (record) => {
  const value = record?.user;
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

export default function Team() {
  const navigate = useNavigate();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: attendanceData, isLoading: isLoadingAttendance } = useGetAttendanceQuery();
  const [selectedUserId, setSelectedUserId] = useState("");

  const teamMembers = useMemo(() => {
    const users = usersData || [];
    return users.filter((user) => user.role === "employee");
  }, [usersData]);

  const teamAttendance = useMemo(() => attendanceData?.data || [], [attendanceData]);

  const selectedMember = useMemo(
    () => teamMembers.find((user) => user._id === selectedUserId) || null,
    [teamMembers, selectedUserId]
  );

  const selectedMemberLogs = useMemo(() => {
    if (!selectedUserId) return [];
    return teamAttendance.filter((record) => getRecordUserId(record) === selectedUserId);
  }, [teamAttendance, selectedUserId]);

  const isLoading = isLoadingUsers || isLoadingAttendance;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Team Management</h1>
        <p className="text-slate-500 mt-1">
          View assigned employees, open employee details, and check employee attendance logs.
        </p>
      </div>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-lg font-bold text-slate-800">Assigned Team Members</h2>
          <p className="text-sm text-slate-500">
            Total employees: <span className="font-semibold text-slate-700">{teamMembers.length}</span>
          </p>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Loading team members...</p>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
            <p className="text-slate-700 font-semibold">No assigned team members found</p>
            <p className="text-slate-500 text-sm mt-1">
              New employees assigned to you will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member._id} className="border-t border-slate-100 hover:bg-emerald-50/30 transition">
                    <td className="px-4 py-3 font-semibold text-slate-700">{member.name}</td>
                    <td className="px-4 py-3 text-slate-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedUserId(member._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          View Attendance
                        </button>
                        {/* <button
                          onClick={() => navigate(`/users/${member._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          View Details
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="font-semibold text-slate-800">Employee Attendance Logs</h2>
            <p className="text-sm text-slate-500">
              {selectedMember
                ? `Attendance logs for ${selectedMember.name}`
                : "Choose a team member to view attendance logs"}
            </p>
          </div>
          {selectedMember && (
            <button
              onClick={() => navigate(`/users/${selectedMember._id}`)}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Open Full User Master View
            </button>
          )}
        </div>

        {!selectedMember ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
            <p className="text-slate-700 font-semibold">No employee selected</p>
            <p className="text-slate-500 text-sm mt-1">
              Click "View Attendance" for any team member above.
            </p>
          </div>
        ) : selectedMemberLogs.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
            <p className="text-slate-700 font-semibold">No attendance logs available</p>
            <p className="text-slate-500 text-sm mt-1">
              This employee has not submitted attendance entries yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[520px] border border-slate-100 rounded-2xl">
            <table className="min-w-[1060px] w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Working Hours</th>
                </tr>
              </thead>
              <tbody>
                {selectedMemberLogs.map((record) => {
                  const uiStatus = getAttendanceLabel(record);
                  return (
                    <tr
                      key={record._id}
                      className="border-b border-slate-100 hover:bg-emerald-50/30 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-slate-700">{selectedMember.name}</td>
                      <td className="px-4 py-3 text-slate-700">{formatTime(record?.punchIn?.time)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatTime(record?.punchOut?.time)}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {record?.punchIn?.location
                          ? `${record.punchIn.location.lat}, ${record.punchIn.location.lng}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusClass(
                            uiStatus
                          )}`}
                        >
                          {uiStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{record.workingHours ?? 0}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
