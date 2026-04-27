import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from "../api/attendanceApi";

import {
  Calendar,
  Shield,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle
} from "lucide-react";

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject(new Error("Location permission denied")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

export default function Attendance() {
  const { userInfo } = useSelector((state) => state.auth);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [selfie, setSelfie] = useState("");
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");

  const { data, isLoading: recordsLoading, refetch } = useGetAttendanceQuery();
  const [punchIn, { isLoading: punchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: punchingOut }] = usePunchOutMutation();
  const isSubmitting = punchingIn || punchingOut;
  const currentUserId = userInfo?._id;

  const myRecords = useMemo(() => {
    const allRecords = data?.data || [];
    if (!currentUserId) return [];

    return allRecords
      .filter((item) => {
        const userId =
          typeof item?.user === "string"
            ? item.user
            : item?.user?._id;
        return userId === currentUserId;
      })
      .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
  }, [data, currentUserId]);

  const todaysRecord = useMemo(() => {
    const list = myRecords;
    const today = new Date().toISOString().split("T")[0];
    return list.find((item) => {
      if (!item?.date) return false;
      return new Date(item.date).toISOString().split("T")[0] === today;
    });
  }, [myRecords]);

  useEffect(() => {
    const stream = videoRef.current?.srcObject;
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setMessage("");
    } catch {
      setMessage("Camera access required for live selfie capture.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const sourceWidth = videoRef.current.videoWidth;
    const sourceHeight = videoRef.current.videoHeight;

    if (!sourceWidth || !sourceHeight) {
      setMessage("Wait for camera preview before capture.");
      return;
    }

    const maxWidth = 640;
    const ratio = Math.min(1, maxWidth / sourceWidth);
    const width = Math.round(sourceWidth * ratio);
    const height = Math.round(sourceHeight * ratio);

    const context = canvasRef.current.getContext("2d");
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);
    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.6);
    setSelfie(imageData);
    setMessage("Selfie captured successfully.");
  };

  const fetchLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      setMessage("Location captured.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitPunch = async (type) => {
    try {
      if (!selfie) {
        setMessage("Capture selfie first.");
        return;
      }
      if (!location) {
        setMessage("Capture location first.");
        return;
      }

      const payload = { ...location, selfie };
      if (type === "in") {
        await punchIn(payload).unwrap();
      } else {
        await punchOut(payload).unwrap();
      }

      await refetch();
      setMessage(`Punch ${type === "in" ? "In" : "Out"} successful.`);
      setSelfie("");
    } catch (error) {
      setMessage(
        error?.data?.message ||
          error?.error ||
          "Attendance action failed."
      );
    }
  };

  const canPunchIn = !isSubmitting && (!todaysRecord || !todaysRecord?.punchIn?.time);
  const canPunchOut =
    !isSubmitting &&
    !!todaysRecord?.punchIn?.time &&
    !todaysRecord?.punchOut?.time;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-xs font-semibold tracking-wide uppercase">Live Check-in Desk</p>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">Attendance Workspace</h1>
            <p className="text-emerald-100 mt-2">
              Capture selfie and location, then complete your daily punch flow securely.
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 border border-white/20 p-4 min-w-[220px]">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Today</p>
            <p className="text-lg font-bold text-white mt-1">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-emerald-100 mt-1">
              {todaysRecord?.status || "No status yet"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Live Camera</h2>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                cameraOn
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {cameraOn ? "Camera On" : "Camera Off"}
            </span>
          </div>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-2xl bg-slate-100 aspect-video object-cover border border-slate-100"
            />
            {!cameraOn && (
              <div className="absolute inset-0 rounded-2xl bg-slate-900/45 flex items-center justify-center">
                <p className="text-white text-sm font-semibold">Start camera to begin selfie capture</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-wrap gap-3 mt-4">
            {!cameraOn ? (
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-700 text-white font-semibold"
              >
                Stop Camera
              </button>
            )}

            <button
              onClick={captureSelfie}
              disabled={!cameraOn}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Capture Selfie
            </button>
            <button
              onClick={fetchLocation}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
            >
              Capture Location
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4">Punch Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <StatusTile
              title="Location"
              value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Not captured"}
              isReady={!!location}
            />
            <StatusTile title="Selfie" value={selfie ? "Captured" : "Not captured"} isReady={!!selfie} />
          </div>
          {message && (
            <p className="mt-4 text-sm rounded-xl px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
              {message}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => submitPunch("in")}
              disabled={!canPunchIn}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {punchingIn ? "Punching In..." : "Punch In"}
            </button>
            <button
              onClick={() => submitPunch("out")}
              disabled={!canPunchOut}
              className="px-5 py-2 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {punchingOut ? "Punching Out..." : "Punch Out"}
            </button>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="font-semibold mb-2 text-slate-800">Today Status</p>
            {recordsLoading ? (
              <div className="space-y-2">
                <div className="h-3 rounded bg-slate-100 animate-pulse w-1/2" />
                <div className="h-3 rounded bg-slate-100 animate-pulse w-1/3" />
              </div>
            ) : todaysRecord ? (
              <div className="space-y-1 text-sm text-slate-600">
                <p>Status: {todaysRecord.status || "Incomplete"}</p>
                <p>Punch In: {formatTime(todaysRecord?.punchIn?.time)}</p>
                <p>Punch Out: {formatTime(todaysRecord?.punchOut?.time)}</p>
                <p>Working Hours: {todaysRecord.workingHours ?? 0}h</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No attendance record for today yet.</p>
            )}
          </div>
        </div>
      </div>

<div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md overflow-hidden">

  {/* 🔥 Glow */}
  <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-200 opacity-30 blur-3xl rounded-full"></div>
  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-200 opacity-30 blur-3xl rounded-full"></div>

  {/* HEADER */}
  <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow">
        <Calendar size={18} />
      </div>
      <div>
        <h2 className="font-bold text-slate-800 text-lg">Recent Records</h2>
        <p className="text-xs text-slate-500">Your latest attendance activity</p>
      </div>
    </div>
  </div>

  {/* CONTENT */}
  {recordsLoading ? (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-2xl p-4 bg-white/60 border border-slate-100 animate-pulse"
        >
          <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/5" />
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-3">

      {myRecords.slice(0, 5).length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
          <p className="text-slate-600 font-medium">
            No attendance records yet.
          </p>
        </div>
      ) : (
        myRecords.slice(0, 5).map((item) => (
          <div
            key={item._id}
            className="group rounded-2xl p-4 bg-white/70 border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >

            {/* TOP */}
            <div className="flex flex-wrap items-center justify-between gap-3">

              {/* DATE */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <p className="font-semibold text-slate-700">
                  {formatDate(item.date)}
                </p>
              </div>

              {/* STATUS */}
              <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
                <Shield size={12} />
                {item.status || "Incomplete"}
              </span>
            </div>

            {/* DETAILS */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 text-sm">

              <div className="flex items-center gap-2">
                <ArrowRightCircle size={16} className="text-emerald-500" />
                <span>In: {formatTime(item?.punchIn?.time)}</span>
              </div>

              <div className="flex items-center gap-2">
                <ArrowLeftCircle size={16} className="text-rose-500" />
                <span>Out: {formatTime(item?.punchOut?.time)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <span>Hours: {item.workingHours ?? 0}h</span>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  )}
</div>
    </div>
  );
}

function StatusTile({ title, value, isReady }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</p>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            isReady
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-amber-100 text-amber-700 border-amber-200"
          }`}
        >
          {isReady ? "Ready" : "Pending"}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-700 break-all">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
