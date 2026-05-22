import LoginInput from "../components/LoginInput";

import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

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
        alert(data.detail || "Login gagal");

        return;
      }

      // =====================================
      // SAVE USER
      // =====================================
      localStorage.setItem("user", JSON.stringify(data.user));

      // =====================================
      // SAVE LOGIN TOKEN
      // =====================================
      localStorage.setItem("accessToken", "login-success");

      console.log("USER SAVED:", data.user);

      // =====================================
      // SUCCESS
      // =====================================
      alert("Login berhasil");

      // =====================================
      // REFRESH APP
      // =====================================
      window.location.href = "/";
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      alert("Terjadi kesalahan koneksi");
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
    </div>
  );
}