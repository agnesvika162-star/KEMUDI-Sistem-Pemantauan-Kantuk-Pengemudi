
import toast from "react-hot-toast";
import RegisterInput from "../components/RegisterInput";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const showErrorModal = (message) => {
    setErrorMessage(message);
  };

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
        toast.success("Register berhasil");

        navigate("/");
      } else {
        const err = await res.json();

        console.log("REGISTER ERROR:", err);

        showErrorModal(
          err.detail.includes("Email already registered")
            ? "Email sudah terdaftar. Silakan login menggunakan akun tersebut."
            : err.detail || err.message || "Registrasi gagal",
        );
      }
    } catch (error) {
      console.error(error);
      showErrorModal("Terjadi kesalahan koneksi");
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

      {/* 🔥 CONTENT */}
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

      {/* ERROR MODAL */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Registrasi Gagal
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
    </>
  );
}