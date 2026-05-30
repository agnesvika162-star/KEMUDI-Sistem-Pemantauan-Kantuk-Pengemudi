
import { useState, useEffect, useRef } from "react";
import CameraSection from "../components/CameraSection";
import WarningBox from "../components/WarningBox";
import StatusGrid from "../components/StatusGrid";

export default function LiveDetectionPage({
  videoRef,
  canvasRef,
  status,
  alarmRef,
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
})

{
 
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
            videoRef={videoRef}
            canvasRef={canvasRef}
            status={status}
            monitoringTime={monitoringTime}
          />
        </div>

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