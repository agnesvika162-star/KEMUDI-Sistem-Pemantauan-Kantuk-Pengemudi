summary 

("use client");

import { useState, useEffect } from "react";

export default function SummaryCards() {
  const [duration, setDuration] = useState(0);
  const [count, setCount] = useState(0);

  // 🔁 ambil data realtime dari localStorage
  useEffect(() => {
    const update = () => {
      const dur = localStorage.getItem("duration");
      const cnt = localStorage.getItem("drowsyCount");

      setDuration(dur ? Number(dur) : 0);
      setCount(cnt ? Number(cnt) : 0);
    };

    // initial load
    update();

    // polling cepat (realtime ringan)
    const interval = setInterval(update, 500);

    // jika storage berubah (cross-tab)
    window.addEventListener("storage", update);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", update);
    };
  }, []);

  // ⏱️ format detik → HH:MM:SS
  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 🔵 TOTAL */}
      <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-xl text-blue-500 text-xl">
          👥
        </div>

        <div>
          <p className="text-sm text-gray-500">TOTAL</p>
          <h2 className="text-2xl font-bold">{count}</h2>
          <p className="text-sm text-gray-500">Kali Terdeteksi</p>
        </div>
      </div>

      {/* 🟢 DURASI */}
      <div className="bg-white rounded-xl p-6 shadow flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-xl text-blue-500 text-xl">
          ⏱️
        </div>

        <div>
          <p className="text-sm text-gray-500">DURASI</p>
          <h2 className="text-2xl font-bold">{formatTime(duration)}</h2>
          <p className="text-sm text-gray-500">Jam : Menit : Detik</p>
        </div>
      </div>
    </div>
  );
}