("use client");
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginInput({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLogin({ email, password });
      }}
      className="space-y-4 md:space-y-5"
    >
      <div>
        <p className="mb-1 text-sm md:text-base font-medium text-gray-700">
          Email
        </p>
        <input
          type="email"
          placeholder="Masukkan email Anda"
          className="w-full border rounded-xl p-3 md:p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-1 text-sm md:text-base font-medium text-gray-700">
          Password
        </p>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password Anda"
            className="w-full border rounded-xl p-3 md:p-4 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      </div>
      <button className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base">
        Login
      </button>
    </form>
  );
}