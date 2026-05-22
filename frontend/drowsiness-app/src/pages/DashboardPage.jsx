"use client";

import { useEffect, useRef, useState } from "react";

import ChartSection from "../components/ChartSection";

function DashboardPage() {

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

    const interval = setInterval(async () => {

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

        await fetch(`${import.meta.env.VITE_API_URL}/update-summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            },

            body: JSON.stringify({
              duration: deltaDuration,

              drowsy_count: deltaCount,
            }),
          }
        );

      } catch (err) {

        console.error(
          "Update data error:",
          err
        );

      }

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // =====================================
  // GET HISTORY
  // =====================================
  useEffect(() => {

    fetch(`${import.meta.env.VITE_API_URL}/dashboard-history`)

      .then((res) => res.json())

      .then((data) => {

        if (Array.isArray(data)) {

          setHistoryData(data);

        } else {

          setHistoryData([]);

        }

      })

      .catch((err) => console.error(err));

  }, []);

  // =====================================
  // PAGINATION
  // =====================================
  const totalPages = Math.ceil(
    historyData.length / perPage
  );

  const startIndex =
    (currentPage - 1) * perPage;

  const visibleData = historyData.slice(
    startIndex,
    startIndex + perPage
  );

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
        <div className="bg-white rounded-2xl border p-4 md:p-6 shadow-sm mt-6">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">

            Riwayat Perjalanan

          </h1>

          <div className="overflow-x-auto">

            <table className="w-full text-sm md:text-base">

              <thead>

                <tr className="bg-[#F5F7FB] text-gray-700">

                  <th className="py-3 md:py-4 rounded-l-xl">

                    Tanggal

                  </th>

                  <th>

                    Durasi Mengemudi

                  </th>

                  <th>

                    Frekuensi Kantuk

                  </th>

                  <th className="rounded-r-xl">

                    Status

                  </th>

                </tr>

              </thead>

              <tbody>

                {visibleData.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center py-10 text-gray-400"
                    >

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
                      <td className="py-3 md:py-5">

                        {item.tanggal}

                      </td>
                      {/* DURASI */}
                      <td>

                        {item.durasi}

                      </td>

                      {/* FREKUENSI */}
                      <td>

                        {item.frekuensi}x

                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={`px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold

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

            <p className="text-sm md:text-base text-gray-500">

              Menampilkan {startIndex + 1}

              {" - "}

              {Math.min(
                startIndex + perPage,
                historyData.length
              )}{" "}

              dari {historyData.length} data

            </p>

            {/* PAGINATION */}
            <div className="flex items-center gap-3">

              <button
                onClick={prevPage}
                className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-50"
              >

                {"<"}

              </button>

              <button
                className="w-10 h-10 rounded-xl bg-blue-500 text-white font-semibold"
              >

                {currentPage}

              </button>

              <button
                onClick={nextPage}
                className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-50"
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