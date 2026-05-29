("use client");
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterInput({ onRegister, loading = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const showErrorModal = (message) => {
    setErrorMessage(message);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    // =====================================
    // VALIDASI KOSONG
    // =====================================
    if (!name || !email || !password || !confirm) {
      showErrorModal("Semua field harus diisi!");

      return;
    }

    // =====================================
    // VALIDASI NAMA
    // =====================================
    if (name.trim().length < 3) {
      showErrorModal("Nama minimal 3 huruf!");

      return;
    }

    // =====================================
    // VALIDASI EMAIL
    // =====================================
    const emailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;

    if (!emailRegex.test(email)) {
      showErrorModal(
        "Email harus @gmail.com, tanpa huruf besar dan tanpa spasi!",
      );
      return;
    }

    // =====================================
    // VALIDASI PASSWORD
    // =====================================
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      showErrorModal(
        "Password minimal 8 karakter serta wajib memiliki huruf, angka, dan simbol!",
      );

      return;
    }

    // =====================================
    // VALIDASI KONFIRMASI PASSWORD
    // =====================================
    if (password !== confirm) {
      showErrorModal("Password tidak sama!");

      return;
    }

    // =====================================
    // REGISTER
    // =====================================
    onRegister({
      name,
      email,
      password,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* NAMA */}
        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full border rounded-xl p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border rounded-xl p-3 md:p-4 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        {/* KONFIRMASI */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi Password"
            className="w-full border rounded-xl p-3 md:p-4 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Daftar"}
        </button>
      </form>
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