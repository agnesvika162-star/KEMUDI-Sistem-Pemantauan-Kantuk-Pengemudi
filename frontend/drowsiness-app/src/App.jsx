import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import LiveDetectionPage from "./pages/LiveDetectionPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

import Navbar from "./components/Navbar";

import { getAccessToken } from "./utils/auth";

function App() {
  const [drowsinessLevel, setDrowsinessLevel] = useState(20);

  const [isCameraOn, setIsCameraOn] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [monitoringTime, setMonitoringTime] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [totalDrowsyDuration, setTotalDrowsyDuration] = useState(0);
  const [wasDrowsy, setWasDrowsy] = useState(false);
  // =====================================
  // USER STATE (GLOBAL)
  // =====================================
  const [user, setUser] = useState({
    name: "",
    email: "",
    photo: "",
  });

  // 🔥 LOGIN STATE
  const [isLogin, setIsLogin] = useState(null);

  // 🔥 CHECK TOKEN
useEffect(() => {

  const token =
    localStorage.getItem("accessToken");

  setIsLogin(!!token);

}, []);

  // =====================================
  // LOAD USER
  // =====================================
useEffect(() => {

  const fetchProfile = async () => {

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`
      );

      const data =
        await response.json();

      if (data) {

        setUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
      }

    } catch (error) {

      console.log(
        "PROFILE LOAD ERROR:",
        error
      );

    }

  };

  fetchProfile();

}, []);

  // ⏳ LOADING
  if (isLogin === null) return null;

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