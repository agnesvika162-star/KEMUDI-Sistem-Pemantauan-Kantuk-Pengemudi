"use client";
import { useRef, useEffect, useState } from "react";

function CameraSection({
  backgroundMode = false,
  isCameraOn,
  status,
  setStatus,
  setConfidence,
  isMuted,
  monitoringTime,
  setMonitoringTime,
}) {
  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const [cameraAlert, setCameraAlert] = useState("");

  // 🔥 ALARM
  // const alarmRef = useRef(
  //   new Audio("/alarm.mp3")
  // );

  // const [seconds, setSeconds] =
  //   useState(0);

  // =========================================
  // 🔥 SET ALARM LOOP
  // =========================================
  // useEffect(() => {

  //   alarmRef.current.loop = true;

  // }, []);

  // =========================================
  // 🔥 PLAY / STOP ALARM
  // =========================================
  // useEffect(() => {

  //   // mute aktif
  //   if (isMuted) {

  //     alarmRef.current.pause();

  //     alarmRef.current.currentTime = 0;

  //     return;
  //   }

  //   // status drowsy
  //   if (
  //     status === "DROWSY" &&
  //     alarmRef.current.paused
  //   ) {

  //     alarmRef.current
  //       .play()
  //       .catch((err) => {

  //         console.log(
  //           "Audio blocked:",
  //           err
  //         );
  //       });

  //   } else if (
  //     status === "AWAKE"
  //   ) {

  //     alarmRef.current.pause();

  //     alarmRef.current.currentTime = 0;
  //   }

  // }, [status, isMuted]);

  // =========================================
  // 🎥 START CAMERA
  // =========================================
  useEffect(() => {
    if (isCameraOn) {
      // cek browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia tidak didukung browser");

        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })

        .then((stream) => {
          setCameraAlert("");
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(() => {});
            };
          }
        })

        .catch((err) => {
          console.error("Camera Error:", err);

          // ❌ izin ditolak
          if (err.name === "NotAllowedError") {
            setCameraAlert("Akses kamera belum diizinkan");
          }

          // ❌ kamera error
          else {
            setCameraAlert("Kamera mengalami gangguan");
          }
        });
    } else {
      setCameraAlert("Kamera dinonaktifkan");

      // stop camera
      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // stop alarm
      // alarmRef.current.pause();

      // alarmRef.current.currentTime = 0;
    }
  }, [isCameraOn]);

  // =========================================
  // 🔥 RESET LOCAL STORAGE
  // =========================================
  // useEffect(() => {

  //   if (isCameraOn) {

  //     localStorage.setItem(
  //       "duration",
  //       0
  //     );

  //     localStorage.setItem(
  //       "drowsyCount",
  //       0
  //     );

  //     localStorage.setItem(
  //       "status",
  //       JSON.stringify(
  //         "AWAKE"
  //       )
  //     );

  //     setSeconds(0);
  //   }

  // }, [isCameraOn]);

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
  // 📸 CAPTURE FRAME
  // =========================================
  const captureFrame = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    // video belum ready
    if (video.readyState !== 4) return null;

    // =========================================
    // MODEL INPUT 96x96
    // =========================================
    canvas.width = 96;

    canvas.height = 96;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, 96, 96);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.5);
    });
  };

  // =========================================
  // 🌐 SEND TO BACKEND
  // =========================================
  const sendToBackend = async () => {
    if (!isCameraOn) return;

    const blob = await captureFrame();

    if (!blob) return;
    const formData = new FormData();

        const user = JSON.parse(
  localStorage.getItem("user")
);

        formData.append(
  "user_id",
  user.id
);

        formData.append(
  "file",
  blob,
  "frame.jpg"
);
      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/predict`,
            {
              method: "POST",
              body: formData,
            }
          );

      const data = await response.json();

      console.log("API RESPONSE:", data);

      // invalid response
      if (!data || !data.status) return;

      // =========================================
      // UPDATE UI
      // =========================================
      setStatus(data.status);

      setConfidence(data.confidence);

      // =========================================
      // SAVE STATUS
      // =========================================
      const previousStatus = JSON.parse(localStorage.getItem("status"));

      localStorage.setItem("status", JSON.stringify(data.status));

      // =========================================
      // COUNT ONLY NEW DROWSY
      // =========================================
      if (data.status === "DROWSY" && previousStatus !== "DROWSY") {
        let count = Number(localStorage.getItem("drowsyCount") || 0);

        count += 1;

        // localStorage.setItem("drowsyCount", count);
      }
    } catch (err) {
      console.error("Backend Error:", err);
    }
  };

  // =========================================
  // 🔁 REALTIME LOOP
  // =========================================
  useEffect(() => {
    if (!isCameraOn) return;

    let isSending = false;

    const interval = setInterval(async () => {
      // prevent spam request
      if (isSending) return;

      isSending = true;

      await sendToBackend();

      isSending = false;
    }, 300);

    return () => clearInterval(interval);
  }, [isCameraOn]);

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