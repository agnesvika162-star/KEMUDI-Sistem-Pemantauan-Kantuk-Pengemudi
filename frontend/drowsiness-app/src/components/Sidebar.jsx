
import { Link, useLocation, useNavigate } from "react-router-dom";
import { removeAccessToken } from "../utils/auth";

export default function Sidebar({ isOpen = true, setIsOpen = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuClass = (path) =>
    `p-2 rounded transition ${
      location.pathname === path
        ? "bg-blue-100 text-blue-600 pointer-events-none"
        : "hover:bg-gray-100"
    }`;

  // 🔥 LOGOUT FUNCTION (PINDAH KE SINI)
  const handleLogout = () => {
    removeAccessToken();
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4">
          {/* LOGO */}
          <div className="mb-6">
            <h1 className="font-bold text-lg">KEMUDI</h1>
            <p className="text-sm text-gray-500">
              Sistem Pemantauan Kantuk Pengemudi
            </p>
          </div>

          {/* MENU */}
          <div className="flex flex-col gap-3">
            <Link to="/" className={menuClass("/")}>
              🎥 Live Detection
            </Link>

            <Link to="/dashboard" className={menuClass("/dashboard")}>
              📊 Dashboard
            </Link>

            <Link to="/history" className={menuClass("/history")}>
              🕒 History
            </Link>
          </div>
        </div>

        {/* 🔥 LOGOUT DI BAWAH */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-500 hover:bg-red-100 p-2 rounded flex items-center gap-2"
          >
            🚪 Keluar
          </button>
        </div>
      </div>
    </>
  );
}