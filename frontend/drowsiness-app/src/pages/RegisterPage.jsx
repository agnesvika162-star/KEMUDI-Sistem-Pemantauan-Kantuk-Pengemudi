import RegisterInput from "../components/RegisterInput";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data) => {
    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Berhasil daftar, silakan login");
        navigate("/login"); // 🔥 biar konsisten ke /login
      } else {
        const err = await res.json();
        alert(err.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔥 HEADER */}
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

      {/* 🔥 CONTENT (SUDAH DIPERBESAR) */}
      <div className="min-h-screen bg-[#F5F7FB] px-4 md:px-8 py-10 md:py-20">
        <div className="w-full max-w-5xl mx-auto bg-white p-5 md:p-12 rounded-2xl shadow-md">
          {/* TITLE */}
          <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-800 text-center">
            Daftar ke KEMUDI
          </h2>

          {/* FORM */}
          <RegisterInput onRegister={handleRegister} loading={loading} />

          {/* FOOTER */}
          <p className="mt-8 text-xs md:text-sm text-gray-600 text-center">
            Sudah punya akun?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Login di sini
            </span>
          </p>
        </div>
      </div>
    </>
  );
}