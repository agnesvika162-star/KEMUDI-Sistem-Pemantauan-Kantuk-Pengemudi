import { useState, useEffect, useRef } from "react";
import CameraSection from "../components/CameraSection";
import WarningBox from "../components/WarningBox";
import StatusGrid from "../components/StatusGrid";

export default function LiveDetectionPage({
  status,
  confidence,
  setStatus,
  setConfidence,
  drowsinessLevel,
  setDrowsinessLevel,
  isCameraOn,
  setIsCameraOn,
  isMuted,
  setIsMuted,
  monitoringTime,
  setMonitoringTime,

  warningCount,
  setWarningCount,

  totalDrowsyDuration,
  setTotalDrowsyDuration,

  wasDrowsy,
  setWasDrowsy,
}) {
  // const [status, setStatus] = useState("AWAKE");
  // const [confidence, setConfidence] = useState(0);

  const alarmRef = useRef(null);

  // =====================================
  // DURASI KANTUK
  // =====================================
  useEffect(() => {
    let interval;

    if (status === "DROWSY" && isCameraOn) {
      interval = setInterval(() => {
        setTotalDrowsyDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status, isCameraOn]);

  // =====================================
  // WARNING COUNT
  // =====================================
  useEffect(() => {
    if (status === "DROWSY" && !wasDrowsy) {
      setWarningCount((prev) => prev + 1);

      setWasDrowsy(true);
    }

    if (status === "AWAKE") {
      setWasDrowsy(false);
    }
  }, [status, wasDrowsy]);

  // =====================================
  // SYNC LOCAL STORAGE
  // =====================================
  // useEffect(() => {
  //   localStorage.setItem("drowsyCount", warningCount);

  //   localStorage.setItem("duration", totalDrowsyDuration);
  // }, [warningCount, totalDrowsyDuration]);

  // =====================================
  // REALTIME BACKEND SYNC
  // =====================================
  useEffect(() => {
    if (!isCameraOn) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) return;

    const interval = setInterval(async () => {
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/update-summary/${user.id}`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              user_id: user.id,

              duration: monitoringTime,

              drowsy_count: warningCount,

              drowsy_duration: totalDrowsyDuration,
            }),
          },
        );
      } catch (err) {
        console.error("Realtime sync error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isCameraOn, monitoringTime, warningCount, totalDrowsyDuration]);

  // =====================================
  // AUDIO
  // =====================================
  useEffect(() => {
    if (!alarmRef.current) return;

    // 🔇 MUTE = MATIKAN LANGSUNG
    if (isMuted) {
      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;

      return;
    }

    // 🔥 DROWSY = PLAY
    if (status === "DROWSY" && !isMuted) {
      if (alarmRef.current.paused) {
        alarmRef.current.loop = true;

        alarmRef.current.play().catch((err) => {
          console.log("ALARM ERROR:", err);
        });
      }
    }

    // 🙂 AWAKE = STOP
    else {
      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;
    }
  }, [status, isMuted]);

  // =====================================
  // STATUS
  // =====================================
  const isSevere = drowsinessLevel >= 50;

  return (
    <div className="min-h-screen bg-[#F5F7FB] overflow-x-hidden overflow-y-auto pb-6 md:pb-10">
      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 pt-24 md:pt-28">
        <CameraSection
          isCameraOn={isCameraOn}
          status={status}
          setStatus={setStatus}
          setConfidence={setConfidence}
          monitoringTime={monitoringTime}
          setMonitoringTime={setMonitoringTime}
        />

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-3 md:gap-6 mt-4 md:mt-6 items-start">
          {/* WARNING */}
          <WarningBox
            status={status}
            severe={isSevere}
            drowsinessLevel={drowsinessLevel}
          />

          {/* REALTIME */}
          <StatusGrid
            status={status}
            drowsinessLevel={drowsinessLevel}
            drowsyDuration={totalDrowsyDuration}
            warningCount={warningCount}
          />
        </div>
      </div>

      {/* AUDIO */}
      <audio ref={alarmRef} src="/alarm.mp3" />
    </div>
  );
}
