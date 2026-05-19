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

      const res = await fetch("http://localhost:8000/register", {
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
          <h1 className="text-2xl font-bold text-blue-600">
            KEMUDI
          </h1>
          <p className="text-sm text-gray-500">
            Sistem Pemantauan Kantuk Pengemudi
          </p>
        </div>
      </div>

      {/* 🔥 CONTENT (SUDAH DIPERBESAR) */}
      <div className="min-h-screen bg-[#F5F7FB] px-8 py-20">

        <div className="w-full max-w-5xl mx-auto bg-white p-12 rounded-2xl shadow-md">

          {/* TITLE */}
          <h2 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
            Isi form untuk mendaftar akun.
          </h2>

          {/* FORM */}
          <RegisterInput onRegister={handleRegister} loading={loading} />

          {/* FOOTER */}
          <p className="mt-8 text-sm text-gray-600 text-center">
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