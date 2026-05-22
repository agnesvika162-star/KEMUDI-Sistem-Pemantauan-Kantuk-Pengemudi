import { useState, useEffect, useRef } from "react";
import CameraSection from "../components/CameraSection";
import WarningBox from "../components/WarningBox";
import StatusGrid from "../components/StatusGrid";

export default function LiveDetectionPage({
  drowsinessLevel,
  setDrowsinessLevel,
  isCameraOn,
  setIsCameraOn,
  isMuted,
  setIsMuted,
}) {
  const [status, setStatus] = useState("AWAKE");

  const [confidence, setConfidence] = useState(0);

  const [warningCount, setWarningCount] = useState(0);

  const [totalDrowsyDuration, setTotalDrowsyDuration] = useState(0);

  const [wasDrowsy, setWasDrowsy] = useState(false);

  const alarmRef = useRef(null);

  // =====================================
  // DURASI KANTUK
  // =====================================
  useEffect(() => {
    let interval;

    if (status === "DROWSY") {
      interval = setInterval(() => {
        setTotalDrowsyDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status]);

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
// AUDIO
// =====================================
useEffect(() => {

  if (!alarmRef.current) return;

  // 🔥 DROWSY & SOUND ON
  if (
    drowsinessLevel >= 50 &&
    !isMuted
  ) {

    // PLAY SEKALI
    if (alarmRef.current.paused) {

      alarmRef.current.loop = true;

      alarmRef.current.play().catch(() => {});

    }

  }

  // 🔥 STOP AUDIO
  else {

    alarmRef.current.pause();

    alarmRef.current.currentTime = 0;

  }

}, [drowsinessLevel, isMuted]);

  // =====================================
  // STATUS
  // =====================================
  const isSevere = drowsinessLevel >= 50;

  return (
    <div className="min-h-screen bg-[#F5F7FB] overflow-x-hidden overflow-y-auto pb-6 md:pb-10">
      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 pt-24 md:pt-28">
        {/* CAMERA */}
        <div className="w-full overflow-hidden rounded-2xl">
          <CameraSection
            isCameraOn={isCameraOn}
            status={status}
            confidence={confidence}
            setStatus={setStatus}
            setConfidence={setConfidence}
            setDrowsinessLevel={setDrowsinessLevel}
            drowsinessLevel={drowsinessLevel}
          />
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
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