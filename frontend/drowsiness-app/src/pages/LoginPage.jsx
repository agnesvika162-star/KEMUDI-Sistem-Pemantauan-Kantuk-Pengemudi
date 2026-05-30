
import toast from "react-hot-toast";
import LoginInput from "../components/LoginInput";

import { useNavigate } from "react-router-dom";
import { putAccessToken } from "../utils/auth";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  const showErrorModal = (message) => {
    setErrorMessage(message);
  };

  // =====================================
  // HANDLE LOGIN
  // =====================================
  const handleLogin = async ({ email, password }) => {
    try {
      // =====================================
      // REQUEST LOGIN
      // =====================================
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
        credentials: 'include'
      });

      // =====================================
      // RESPONSE
      // =====================================
      const data = await res.json();

      console.log("LOGIN RESULT:", data);

      // =====================================
      // LOGIN FAILED
      // =====================================
      if (!res.ok) {
        showErrorModal("Informasi login tidak valid");

        return;
      }

      // =====================================
      // SAVE USER
      // =====================================
      localStorage.setItem("user", JSON.stringify(data.user));

      // =====================================
      // SAVE LOGIN TOKEN
      // =====================================
      putAccessToken(data.access_token);

      console.log("USER SAVED:", data.user);

      // =====================================
      // SUCCESS
      // =====================================
      toast.success("Login berhasil");

      navigate("/");

      // =====================================
      // REFRESH APP
      // =====================================
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1500);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      showErrorModal("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      {/* =====================================
          HEADER
      ===================================== */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">
            KEMUDI
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Sistem Pemantauan Kantuk Pengemudi
          </p>
        </div>
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}
      <div className="px-4 md:px-8 py-10 md:py-20">
        <div className="w-full max-w-5xl mx-auto bg-white p-5 md:p-12 rounded-2xl shadow-md">
          <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-800 text-center">
            Keselamatan berkendara dimulai dari sini
          </h2>

          {/* LOGIN FORM */}
          <LoginInput onLogin={handleLogin} />

          {/* REGISTER */}
          <p className="mt-8 text-sm text-gray-600 text-center">
            Belum punya akun?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Daftar di sini
            </span>
          </p>
        </div>
      </div>
      {/* ERROR MODAL */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Login Gagal
            </h2>

            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>

            <button
              onClick={() => setErrorMessage("")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}