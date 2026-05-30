
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";


import LiveDetectionPage from "./pages/LiveDetectionPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

import Navbar from "./components/Navbar";

import CameraSection from "./components/CameraSection";

import { getAccessToken } from "./utils/auth";

function App() {
  const location = useLocation(); 

  const [drowsinessLevel, setDrowsinessLevel] = useState(20);

  const [isCameraOn, setIsCameraOn] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [monitoringTime, setMonitoringTime] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [totalDrowsyDuration, setTotalDrowsyDuration] = useState(0);
  const [wasDrowsy, setWasDrowsy] = useState(false);
  const [status, setStatus] = useState("AWAKE");
  const [confidence, setConfidence] = useState(0);
  // =====================================
  // USER STATE (GLOBAL)
  // =====================================
  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    photo: "",
  });

  // 🔥 LOGIN STATE
  const [isLogin, setIsLogin] = useState(false);

  // 🔥 CHECK TOKEN
useEffect(() => {
  const token = Cookies.get("access_token");
  // console.log(token);

  setIsLogin(!!token);

}, [location.pathname]);

  // =====================================
  // LOAD USER
  // =====================================
  useEffect(() => {
  const fetchProfile = async () => {

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (data) {

        setUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
        const data = await response.json();

        if (data) {
          setUser(data);

          localStorage.setItem("user", JSON.stringify(data));
        }
      };
    } catch (error) {
      console.log("PROFILE LOAD ERROR:", error);
    }
      
    fetchProfile();
  }}, []);

  // ⏳ LOADING
  // if (isLogin===) return null;

  let videoRef = useRef(null);

  let canvasRef = useRef(null);

  let streamRef = useRef(null);

  let alarmRef = useRef(null);

  

  // =========================================
  // 🎥 START CAMERA
  // =========================================
  useEffect(() => {
    if(!isLogin){
      return;
    }

    if (isCameraOn) {

      // cek browser support
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        console.error(
          "getUserMedia tidak didukung browser"
        );

        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: true
        })

        .then((stream) => {

          streamRef.current =
            stream;

          if (
            videoRef.current
          ) {

            videoRef.current.srcObject =
              stream;

            videoRef.current.onloadedmetadata =
              () => {

                videoRef.current
                  .play()
                  .catch(() => {});
              };
          }
        })

        .catch((err) => {

          console.error(
            "Camera Error:",
            err
          );
        });

    } else {

      // stop camera
      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );

      if (
        videoRef.current
      ) {

        videoRef.current.srcObject =
          null;
      }

      // stop alarm
      // alarmRef.current.pause();

      // alarmRef.current.currentTime = 0;
    }

  }, [isCameraOn, location.pathname]);

  // =========================================
  // ⏱️ TIMER
  // =========================================
  useEffect(() => {
    if(!isLogin){
      return;
    }

    if (!isCameraOn)
      return;

    const interval =
      setInterval(() => {

        setMonitoringTime((prev) => {

          const newValue =
            prev + 1;

          localStorage.setItem(
            "duration",
            newValue
          );

          return newValue;
        });

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [isCameraOn, location.pathname]);


  // =========================================
  // 📸 CAPTURE FRAME
  // =========================================
  const captureFrame =
    () => {
      if(!isLogin){
        return;
      }

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      )
        return null;

      // video belum ready
      if (
        video.readyState !== 4
      )
        return null;

      // =========================================
      // MODEL INPUT 96x96
      // =========================================
      canvas.width = 96;

      canvas.height = 96;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        video,
        0,
        0,
        96,
        96
      );

      return new Promise(
        (resolve) => {

          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.5
          );
        }
      );
    };

  // =========================================
  // 🌐 SEND TO BACKEND
  // =========================================
  const sendToBackend =
    async () => {
      if(!isLogin){
        return;
      }

      if (!isCameraOn)
        return;

      const blob =
        await captureFrame();

      if (!blob)
        return;
      const formData =
  new FormData();


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
              credentials: "include",
            }
          );

        const data =
          await response.json();

        // console.log(
        //   "API RESPONSE:",
        //   data
        // );

        // invalid response
        if (
          !data ||
          !data.status
        )
          return;

        // =========================================
        // UPDATE UI
        // =========================================
        setStatus(
          data.status
        );

        setConfidence(
          data.confidence
        );

        // =========================================
        // SAVE STATUS
        // =========================================
        const previousStatus =
          JSON.parse(
            localStorage.getItem(
              "status"
            )
          );

        localStorage.setItem(
          "status",
          JSON.stringify(
            data.status
          )
        );

        // =========================================
        // COUNT ONLY NEW DROWSY
        // =========================================
        if (
          data.status ===
            "DROWSY" &&
          previousStatus !==
            "DROWSY"
        ) {

          let count =
            Number(
              localStorage.getItem(
                "drowsyCount"
              ) || 0
            );

          count += 1;

          localStorage.setItem(
            "drowsyCount",
            count
          );
        }

      } catch (err) {

        console.error(
          "Backend Error:",
          err
        );
      }
    };

  // =========================================
  // 🔁 REALTIME LOOP
  // =========================================
  useEffect(() => {
    if(!isLogin){
      return;
    }

    if (!isCameraOn)
      return;

    let isSending =
      false;

    const interval =
      setInterval(
        async () => {

          // prevent spam request
          if (isSending)
            return;

          isSending =
            true;

          await sendToBackend();

          isSending =
            false;

        },
        500
      );

    return () =>
      clearInterval(interval);

  }, [isCameraOn, location.pathname]);



  //  const [status, setStatus] = useState("AWAKE");

  // const [confidence, setConfidence] = useState(0);

  // =====================================
  // DURASI KANTUK
  // =====================================
  useEffect(() => {
    if(!isLogin){
      return;
    }
    let interval;

    if (status === "DROWSY" && isCameraOn) {
      interval = setInterval(() => {
        setTotalDrowsyDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status, location.pathname]);

  // =====================================
  // WARNING COUNT
  // =====================================
  useEffect(() => {
    if(!isLogin){
      return;
    }
    if (status === "DROWSY" && !wasDrowsy) {
      setWarningCount((prev) => prev + 1);

      setWasDrowsy(true);
    }

    if (status === "AWAKE") {
      setWasDrowsy(false);
    }
  }, [status, wasDrowsy, location.pathname]);

// =====================================
// SYNC LOCAL STORAGE
// =====================================
useEffect(() => {
  if(!isLogin){
      return;
    }

  localStorage.setItem(
    "drowsyCount",
    warningCount
  );

  localStorage.setItem(
    "duration",
    totalDrowsyDuration
  );

}, [warningCount, totalDrowsyDuration, location.pathname]);

// =====================================
// AUDIO
// =====================================
useEffect(() => {
  if(!isLogin){
      return;
    }

  if (!alarmRef.current) return;

  // 🔇 MUTE = MATIKAN LANGSUNG
  if (isMuted) {

    alarmRef.current.pause();

    alarmRef.current.currentTime = 0;

    return;
  }

  console.log(status === "DROWSY" && !isMuted && isCameraOn)

  // 🔥 DROWSY = PLAY
  if (status === "DROWSY" && !isMuted && isCameraOn) {

    if (alarmRef.current.paused) {

      alarmRef.current.loop = true;

      alarmRef.current
        .play()
        .catch((err) => {

          console.log(
            "ALARM ERROR:",
            err
          );

        });
    }

  }

  // 🙂 AWAKE = STOP
  else {

    alarmRef.current.pause();

    alarmRef.current.currentTime = 0;

  }

}, [status, isMuted, location.pathname, isCameraOn]);

  

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#F5F7FB]">
      {/* 🔥 NAVBAR */}
      {isLogin && (
        <Navbar
          user={user}
          setUser={setUser}
          isCameraOn={isCameraOn}
          setIsCameraOn={setIsCameraOn}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      )}

      {/* CONTENT */}
      <main className="flex-1 p-2 md:p-4">
        <CameraSection
          backgroundMode={true}
          isCameraOn={isCameraOn}
          status={status}
          setStatus={setStatus}
          setConfidence={setConfidence}
          monitoringTime={monitoringTime}
          setMonitoringTime={setMonitoringTime}
          isMuted={isMuted}
        />
        {/* <div className="hidden">
          <CameraSection
            isCameraOn={isCameraOn}
            status={status}
            setStatus={setStatus}
            setConfidence={setConfidence}
            monitoringTime={monitoringTime}
            setMonitoringTime={setMonitoringTime}
          />
        </div> */}
        {/* <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
          <CameraSection
            isCameraOn={isCameraOn}
            status={status}
            setStatus={setStatus}
            setConfidence={setConfidence}
            monitoringTime={monitoringTime}
            setMonitoringTime={setMonitoringTime}
            isMuted={isMuted}
          />
        </div> */}

        <Routes>
          {/* 🔐 BELUM LOGIN */}
          {!isLogin ? (
            <>
              <Route path="/login" element={<LoginPage />} />

              <Route path="/register" element={<RegisterPage />} />

              {/* DEFAULT */}
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              {/* LIVE DETECTION */}
              <Route
                path="/"
                element={
                  <LiveDetectionPage
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    status={status}
                    alarmRef={alarmRef}
                    drowsinessLevel={drowsinessLevel}
                    setDrowsinessLevel={setDrowsinessLevel}
                    isCameraOn={isCameraOn}
                    setIsCameraOn={setIsCameraOn}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                    monitoringTime={monitoringTime}
                    setMonitoringTime={setMonitoringTime}
                    warningCount={warningCount}
                    setWarningCount={setWarningCount}
                    totalDrowsyDuration={totalDrowsyDuration}
                    setTotalDrowsyDuration={setTotalDrowsyDuration}
                    wasDrowsy={wasDrowsy}
                    setWasDrowsy={setWasDrowsy}
                    status={status}
                    confidence={confidence}
                    setStatus={setStatus}
                    setConfidence={setConfidence}
                  />
                }
              />

              {/* DASHBOARD */}
              <Route
                path="/dashboard"
                element={
                  <DashboardPage
                    drowsinessLevel={drowsinessLevel}
                    monitoringTime={monitoringTime}
                    warningCount={warningCount}
                    totalDrowsyDuration={totalDrowsyDuration}
                  />
                }
              />

              {/* PROFILE */}
              <Route
                path="/profile"
                element={<ProfilePage user={user} setUser={setUser} />}
              />

              {/* DEFAULT */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#111",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
          },
        }}
      />
    </div>
  );
}

export default App;