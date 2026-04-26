import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Clock3, Hourglass,BarChart3  } from "lucide-react";
import { useGetAttendanceQuery } from "../api/attendanceApi";
import FilterBar from "../components/reports/FilterBar";
import PreviewModal from "../components/reports/PreviewModal";
import ReportsTable from "../components/reports/ReportsTable";
import StatsCard from "../components/reports/StatsCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialFilterInputs = {
  startDateInput: "",
  endDateInput: "",
  userIdInput: "",
  employeeNameInput: "",
};

function LoadingSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        {[...Array(8)].map((_, idx) => (
          <div key={idx} className="h-10 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export default function Reports() {
  const [filterInputs, setFilterInputs] = useState(initialFilterInputs);
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    employeeName: "",
  });
  const [previewImage, setPreviewImage] = useState("");

  const localUser = useMemo(() => {
    const userInfo = localStorage.getItem("userInfo");
    const user = localStorage.getItem("user");
    const parsed = userInfo || user;
    if (!parsed) return null;
    try {
      return JSON.parse(parsed);
    } catch {
      return null;
    }
  }, []);

  const { data, isLoading } = useGetAttendanceQuery({
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
    userId: appliedFilters.userId || undefined,
  });

  const records = useMemo(() => data?.data || [], [data]);

  const filteredRecords = useMemo(() => {
    const role = localUser?.role;
    const currentUserId = localUser?._id;
    let rows = [...records];

    if (role === "employee" && currentUserId) {
      rows = rows.filter((row) => row?.user?._id === currentUserId);
    }

    if (appliedFilters.employeeName.trim()) {
      const term = appliedFilters.employeeName.trim().toLowerCase();
      rows = rows.filter((row) => (row?.user?.name || "").toLowerCase().includes(term));
    }

    return rows;
  }, [records, appliedFilters.employeeName, localUser?._id, localUser?.role]);

  const totalHours = useMemo(
    () => filteredRecords.reduce((sum, row) => sum + (row.workingHours || 0), 0),
    [filteredRecords]
  );
  const completedDays = useMemo(
    () => filteredRecords.filter((row) => row.status === "Completed").length,
    [filteredRecords]
  );
  const averageHours = filteredRecords.length
    ? (totalHours / filteredRecords.length).toFixed(2)
    : "0.00";
  const onTimeRate = filteredRecords.length
    ? Math.round((completedDays / filteredRecords.length) * 100)
    : 0;

  const openExport = async (type) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (appliedFilters.startDate) params.set("startDate", appliedFilters.startDate);
    if (appliedFilters.endDate) params.set("endDate", appliedFilters.endDate);
    if (appliedFilters.userId) params.set("userId", appliedFilters.userId);

    const url = `${API_URL}/reports/${type}?${params.toString()}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = type === "excel" ? "attendance_report.xlsx" : "attendance_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileUrl);
    } catch {
      alert("Unable to export report.");
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getVisualPercent = (hours) => {
    const safeHours = Number(hours || 0);
    return Math.max(5, Math.min(100, Math.round((safeHours / 10) * 100)));
  };

  const getSelfie = (row) => row?.punchIn?.image || row?.punchIn?.selfie || "";

  const handleInputChange = (name, value) => {
    setFilterInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      startDate: filterInputs.startDateInput,
      endDate: filterInputs.endDateInput,
      userId: filterInputs.userIdInput,
      employeeName: filterInputs.employeeNameInput,
    });
  };

  const handleResetFilters = () => {
    setFilterInputs(initialFilterInputs);
    setAppliedFilters({
      startDate: "",
      endDate: "",
      userId: "",
      employeeName: "",
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40 p-4 md:p-6">


<section className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
  
  {/* Soft Glow Background */}
  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-2xl group-hover:scale-110 transition-all duration-500"></div>

  {/* Header Content */}
  <div className="flex items-start gap-4">
    
    {/* Icon */}
    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm 
                    group-hover:bg-indigo-600 group-hover:text-white 
                    transition-all duration-300">
      <BarChart3 size={26} />
    </div>

    {/* Text Content */}
    <div>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 
                     group-hover:text-indigo-700 transition">
        Attendance Summary Reports
      </h1>

      <p className="mt-1 text-sm md:text-base text-slate-500">
        Monitor trends, apply filters, and export attendance logs.
      </p>
    </div>
  </div>

  {/* Bottom Accent Line */}
  <div className="mt-5 h-[3px] w-16 bg-indigo-500 rounded-full 
                  group-hover:w-28 transition-all duration-300"></div>
</section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Average Hours / Day"
          value={`${averageHours}h`}
          subtitle={`${onTimeRate}% on-time completion`}
          Icon={Clock3}
          tone="emerald"
        />
        <StatsCard
          title="Completed Days"
          value={completedDays}
          subtitle={`${filteredRecords.length} total records`}
          Icon={CheckCircle2}
          tone="sky"
        />
        <StatsCard
          title="Total Logged Hours"
          value={`${totalHours.toFixed(1)}h`}
          subtitle="Across selected filter range"
          Icon={Hourglass}
          tone="slate"
        />
        <StatsCard
          title="Live View"
          value={isLoading ? "Syncing..." : "Updated"}
          subtitle="Latest attendance data"
          Icon={Activity}
          tone="white"
        />
      </section>

      <FilterBar
        filters={filterInputs}
        onInputChange={handleInputChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={openExport}
        disableUserId={localUser?.role === "employee"}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ReportsTable
          records={filteredRecords}
          onPreview={setPreviewImage}
          formatDate={formatDate}
          formatTime={formatTime}
          getVisualPercent={getVisualPercent}
          getSelfie={getSelfie}
        />
      )}

      <PreviewModal image={previewImage} onClose={() => setPreviewImage("")} />
    </div>
  );
}
