
("use client");

import toast from "react-hot-toast";
import { useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { removeAccessToken } from "../utils/auth";
import { CircleUserRound, LayoutDashboard, LogOut } from "lucide-react";
import Cookies from "js-cookie";

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
  const handleLogout = () => {
    removeAccessToken();
    Cookies.remove("access_token");
    setIsCameraOn?.(false);
    setIsMuted?.(true);
    setUser({
      name: "",
      email: "",
      photo: "",
    });
    toast.success("Logout berhasil");
    window.location.href = "/login";
  };

  return (
    <div className="w-full bg-white border-b fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-2 md:py-4 flex items-center">
        {/* LEFT */}
        <div className="flex-1 flex flex-col leading-tight">
          <h1 className="text-base sm:text-lg md:text-3xl font-bold text-blue-600">
            KEMUDI
          </h1>

          <p className="text-[7px] sm:text-[8px] md:text-xs text-gray-500 mt-[2px] leading-tight">
            Sistem Pemantauan Kantuk Pengemudi
          </p>
        </div>

        {/* CENTER */}
        {!isAuthPage && location.pathname !== "/profile" && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-10 lg:gap-16">
            {/* LIVE DETECTION */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-semibold pb-3 transition text-[9px] sm:text-xs md:text-base lg:text-lg relative
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
                    <div className="absolute left-0 bottom-0 w-full h-[3px] bg-blue-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>

            {/* DASHBOARD */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `font-semibold pb-3 transition text-[9px] sm:text-xs md:text-base lg:text-lg relative
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
                    <div className="absolute left-0 bottom-0 w-full h-[3px] bg-blue-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}

        {/* RIGHT */}
        {!isAuthPage && (
          <div className="flex-1 flex items-center justify-end gap-[2px] sm:gap-2 md:gap-4">
            {/* 🔥 LIVE PAGE ONLY */}
            {location.pathname === "/" && (
              <>
                {/* CAMERA */}
                <button
                  onClick={() => setIsCameraOn((prev) => !prev)}
                  className={`flex items-center gap-2 px-1.5 sm:px-2 md:px-5 py-1 md:py-2 rounded-full text-[8px] sm:text-[10px] md:text-sm font-medium transition

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
                    console.log("MUTE CLICKED");

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
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition"
                >
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUserRound size={28} className="text-[#5B2C83]" />
                  )}
                </button>

                {/* DROPDOWN */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 md:mt-4 w-44 md:w-52 bg-white rounded-2xl shadow-xl border overflow-hidden">
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