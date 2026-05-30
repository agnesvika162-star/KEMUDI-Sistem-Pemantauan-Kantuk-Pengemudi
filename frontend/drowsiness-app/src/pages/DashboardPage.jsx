
("use client");

import { useEffect, useState, useRef } from "react";
import ChartSection from "../components/ChartSection";

function DashboardPage({
  drowsinessLevel,
  monitoringTime,
  warningCount,
  totalDrowsyDuration,
}) {
  const user = JSON.parse(localStorage.getItem("user"));
  // 🔥 DATA HISTORY
  const [historyData, setHistoryData] = useState([]);

  // 🔥 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 7;

  // 🔥 SIMPAN NILAI SEBELUMNYA
  const prevDuration = useRef(0);
  const prevCount = useRef(0);

  // =====================================
  // UPDATE SUMMARY
  // =====================================
  useEffect(() => {

    const fetchData = async () => {

      const duration =
        Number(localStorage.getItem("duration") || 0);

      const count =
        Number(localStorage.getItem("drowsyCount") || 0);

      const deltaDuration =
        duration - prevDuration.current;

      const deltaCount =
        count - prevCount.current;

      prevDuration.current = duration;

      prevCount.current = count;

      if (deltaDuration <= 0 && deltaCount <= 0)
        return;

      try {

        await fetch(`${import.meta.env.VITE_API_URL}/update-summary/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            },

            body: JSON.stringify({

              duration: deltaDuration,

              drowsy_count: deltaCount,
            }),
            credentials: "include",
          }
        );
        localStorage.setItem("duration", 0)
        localStorage.setItem("drowsyCount", 0)

      } catch (err) {

        console.error(
          "Update data error:",
          err
        );

      }

    };

    fetchData();
  //  const interval = setInterval(() => {
  //     fetchData();
  //   }, 5000);

  //   return () => clearInterval(interval);

  }, []);

  // =====================================
  // GET HISTORY
  // =====================================
  useEffect(() => {
    // if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard-history`,
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (Array.isArray(data)) {
          setHistoryData(data);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // FETCH PERTAMA
    fetchHistory();

    // REALTIME REFRESH
    // const interval = setInterval(() => {
    //   fetchHistory();
    // }, 5000);

    // return () => clearInterval(interval);
  }, []);

  // =====================================
  // PAGINATION
  // =====================================
  const totalPages = Math.ceil(historyData.length / perPage);

  const startIndex = (currentPage - 1) * perPage;

  const visibleData = historyData.slice(startIndex, startIndex + perPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] pt-24">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* TITLE */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            Dashboard
          </h1>
        </div>

        {/* CHART */}
        <ChartSection />

        {/* TABLE */}
        <div className="bg-white rounded-xl md:rounded-2xl border p-3 md:p-6 shadow-sm mt-4 md:mt-6">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
            Riwayat Perjalanan
          </h1>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs md:text-base">
              <thead>
                <tr className="bg-[#F5F7FB] text-gray-700">
                  <th className="py-2 md:py-4 rounded-l-lg md:rounded-l-xl px-1 md:px-3">
                    Tanggal
                  </th>

                  <th className="px-1 md:px-3">Durasi Mengemudi</th>

                  <th className="px-1 md:px-3">Frekuensi Kantuk</th>

                  <th className="rounded-r-lg md:rounded-r-xl px-1 md:px-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-400">
                      Belum ada riwayat perjalanan
                    </td>
                  </tr>
                ) : (
                  visibleData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b text-center hover:bg-gray-50"
                    >
                      {/* TANGGAL */}
                      <td className="py-2 md:py-5 px-1 md:px-3">
                        {item.tanggal}
                      </td>
                      {/* DURASI */}
                      <td className="px-1 md:px-3">{item.monitoring_duration || item.durasi}</td>

                      {/* FREKUENSI */}
                      <td className="px-1 md:px-3">{item.frekuensi}x</td>

                      {/* STATUS */}
                      <td className="px-1 md:px-3">
                        <span
                          className={`px-2 md:px-4 py-[2px] md:py-1 rounded-full text-[9px] sm:text-[10px] md:text-sm font-semibold

                          ${
                            item.status === "DROWSY"
                              ? "bg-red-100 text-red-500"
                              : "bg-green-100 text-green-600"
                          }
                        `}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
            <p className="text-[10px] sm:text-xs md:text-base text-gray-500">
              Menampilkan {startIndex + 1}
              {" - "}
              {Math.min(startIndex + perPage, historyData.length)} dari{" "}
              {historyData.length} data
            </p>

            {/* PAGINATION */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={prevPage}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl border bg-white hover:bg-gray-50"
              >
                {"<"}
              </button>

              <button className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl bg-blue-500 text-white font-semibold">
                {currentPage}
              </button>

              <button
                onClick={nextPage}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl border bg-white hover:bg-gray-50"
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;