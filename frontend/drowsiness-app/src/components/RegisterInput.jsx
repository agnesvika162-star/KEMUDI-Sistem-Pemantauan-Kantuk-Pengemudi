"use client";
import { useState } from "react";

export default function RegisterInput({ onRegister, loading = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // validasi kosong
    if (!name || !email || !password || !confirm) {
      alert("Semua field harus diisi!");
      return;
    }

    // validasi password
    if (password !== confirm) {
      alert("Password tidak sama!");
      return;
    }

    // kirim ke parent
    onRegister({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* NAMA */}
      <input
        type="text"
        placeholder="Nama Lengkap"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* KONFIRMASI */}
      <input
        type="password"
        placeholder="Konfirmasi Password"
        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Loading..." : "Daftar"}
      </button>
    </form>
  );
}