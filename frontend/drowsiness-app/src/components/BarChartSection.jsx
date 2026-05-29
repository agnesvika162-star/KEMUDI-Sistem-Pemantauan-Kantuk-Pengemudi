Bar 

("use client");

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BarChartSection({ status }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status === "DROWSY") {
      setCount((prev) => prev + 1);
    }
  }, [status]);

  const data = [{ name: "Hari Ini", value: count }];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Frekuensi Kantuk</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}