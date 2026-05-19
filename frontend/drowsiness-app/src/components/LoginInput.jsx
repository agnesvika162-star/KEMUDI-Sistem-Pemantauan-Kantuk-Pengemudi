"use client";
import { useState } from "react";

export default function LoginInput({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLogin({ email, password });
      }}
      className="space-y-4"
    >
      <div>
        <p className="mb-1">Email</p>
        <input
          type="email"
          placeholder="Masukkan email Anda"
          className="w-full border rounded-lg p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-1">Password</p>
        <input
          type="password"
          placeholder="Masukkan password Anda"
          className="w-full border rounded-lg p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
        Login
      </button>
    </form>
  );
}