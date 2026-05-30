"use client";
import { useRef, useEffect, useState } from "react";

function CameraSection({
  backgroundMode = false,
  isCameraOn,
  videoRef,
  canvasRef,
  status,
  monitoringTime,
  setMonitoringTime
}) {
  const [cameraAlert, setCameraAlert] = useState("");
  // =========================================
  // ⏱️ TIMER
  // =========================================
  // ⏱️ TIMER
  useEffect(() => {
    if (!backgroundMode) return;

    if (!isCameraOn) return;

    const interval = setInterval(() => {
      setMonitoringTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [backgroundMode, isCameraOn]);

  // =========================================
  const [seconds, setSeconds] =
    useState(0);

  // =========================================
  // 🕒 FORMAT TIME
  // =========================================
  const formatTime = () => {
    const hours = String(Math.floor(monitoringTime / 3600)).padStart(2, "0");

    const minutes = String(Math.floor((monitoringTime % 3600) / 60)).padStart(
      2,
      "0",
    );

    const seconds = String(monitoringTime % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  // =========================================
  // 🎨 UI
  // =========================================
  if (backgroundMode) {
    return (
      <div className="hidden">
        <video ref={videoRef} autoPlay playsInline muted />

        <canvas ref={canvasRef} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border p-3 md:p-4 shadow">
      <div className="relative h-[260px] sm:h-[340px] md:h-[420px] overflow-hidden rounded-xl">
        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute w-full h-full object-cover scale-x-[-1]"
        />

        {/* HIDDEN CANVAS */}
        <canvas ref={canvasRef} className="hidden" />
        {/* ALERT */}
        {cameraAlert && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium shadow-lg z-50">
            {cameraAlert}
          </div>
        )}

        {/* STATUS */}
        <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow flex items-center gap-2 md:gap-3">
          <span className="text-sm md:text-base font-medium">STATUS:</span>

          <span
            className={`text-sm md:text-base font-bold ${
              status === "DROWSY" ? "text-red-500" : "text-green-500"
            }`}
          >
            {status}
          </span>
        </div>

        {/* TIMER */}
        <div className="absolute bottom-3 left-3 text-white bg-black/50 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
          {formatTime()} • Monitoring
        </div>
      </div>
    </div>
  );
}

export default CameraSection;