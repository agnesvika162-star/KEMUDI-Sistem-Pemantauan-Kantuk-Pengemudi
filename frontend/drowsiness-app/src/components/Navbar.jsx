

("use client");

import { useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { removeAccessToken } from "../utils/auth";
import {
  CircleUserRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

function Navbar({
  user,
  setUser,
  isCameraOn = false,
  setIsCameraOn = () => {},
  isMuted = false,
  setIsMuted = () => {},
  isDashboard,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  // 🔥 AUTH PAGE
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // 🔥 LOGOUT
  const handleLogout = () => {
    removeAccessToken();

    localStorage.removeItem("user");

    // RESET USER
    setUser({
      name: "",
      email: "",
      photo: "",
    });

    window.location.href = "/login";
  };

  return (
    <div className="w-full bg-white border-b fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex flex-col leading-tight">
          <h1 className="text-4xl font-bold text-blue-600">KEMUDI</h1>

          <p className="text-sm text-gray-500 mt-1">
            Sistem Pemantauan Kantuk Pengemudi
          </p>
        </div>

        {/* CENTER */}
        {!isAuthPage && location.pathname !== "/profile" && (
          <div className="flex items-center gap-14">
            {/* LIVE DETECTION */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-semibold pb-3 transition text-lg relative
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Live Detection
                  {isActive && (
                    <div className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>

            {/* DASHBOARD */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `font-semibold pb-3 transition text-lg relative
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Dashboard
                  {isActive && (
                    <div className="absolute left-0 bottom-0 w-full h-1 bg-blue-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}

        {/* RIGHT */}
        {!isAuthPage && (
          <div className="flex items-center gap-5">
            {/* 🔥 LIVE PAGE ONLY */}
            {location.pathname === "/" && (
              <>
                {/* CAMERA */}
                <button
                  onClick={() => setIsCameraOn((prev) => !prev)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition

                  ${
                    isCameraOn
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  📷 {isCameraOn ? "ON" : "OFF"}
                </button>

                {/* SOUND */}
              <button
              onClick={() => {

    console.log(
      "MUTE CLICKED"
    );

    setIsMuted((prev) => !prev);

  }}
>
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </>
            )}

            {/* PROFILE */}
            {location.pathname !== "/" && (
              <div className="relative">
                {/* ICON */}
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition"
                >
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUserRound
                      size={28}
                      className="text-[#5B2C83]"
                />
                  )}
                </button>

                {/* DROPDOWN */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-52 bg-white rounded-2xl shadow-xl border overflow-hidden">
                    {/* DASHBOARD / PROFILE */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);

                        if (location.pathname === "/profile") {
                          navigate("/dashboard");
                        } else {
                          navigate("/profile");
                        }
                      }}
                      className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center gap-3 text-lg"
                    >
                      {location.pathname === "/profile" ? (
                        <>
                          <LayoutDashboard size={22} />
                          Dashboard
                      </>
                    ) : (
                      <>
                        <CircleUserRound size={22} />
                        Profile
                      </>
                    )}
                    </button>

                    {/* LOGOUT */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);

                        handleLogout();
                      }}
                      className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center gap-3 text-lg text-red-500"
                    >
                      <>
                        <LogOut size={22} />
                      Logout
                    </>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;