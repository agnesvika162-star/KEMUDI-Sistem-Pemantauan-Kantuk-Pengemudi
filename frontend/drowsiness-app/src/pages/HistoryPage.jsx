
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 7;
  const user = JSON.parse(localStorage.getItem("user"));
  // FETCH DATA
  // useEffect(() => {

  //   fetch(`${import.meta.env.VITE_API_URL}/dashboard-history/${user.id}`)

  //     .then((res) => res.json())

  //     .then((data) => {

  //       setHistoryData(data);

  //     })

  //     .catch((err) => console.log(err));

  // }, []);
  useEffect(() => {
    const fetchHistory = () => {
      fetch(`${import.meta.env.VITE_API_URL}/dashboard-history/${user.id}`)
        .then((res) => res.json())

        .then((data) => {
          if (Array.isArray(data)) {
            setHistoryData(data);
          } else {
            setHistoryData([]);
          }
        })

        .catch((err) => console.error(err));
    };

    // pertama kali load
    fetchHistory();

    // realtime refresh
    const interval = setInterval(fetchHistory, 3000);

    return () => clearInterval(interval);
  }, []);
  // // PAGINATION
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
    <div className="bg-white rounded-2xl border p-6 shadow-sm mt-6">
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Riwayat Perjalanan
      </h1>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F7FB] text-gray-700">
              <th className="py-4 rounded-l-xl">Tanggal</th>

              <th>Durasi Mengemudi</th>

              <th>Frekuensi Kantuk</th>

              <th className="rounded-r-xl">Status</th>
            </tr>
          </thead>

          <tbody>
            {visibleData.map((item, index) => (
              <tr key={index} className="border-b text-center">
                {/* TANGGAL */}
                <td className="py-5">{item.tanggal}</td>

                {/* DURASI */}
                <td>{item.durasi}</td>

                {/* FREKUENSI */}
                <td>{item.frekuensi}x</td>

                {/* STATUS */}
                <td>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold
                    ${
                      item.status === "DROWSY"
                        ? "bg-red-100 text-red-500"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-6">
        {/* INFO */}
        <p className="text-gray-500">
          Menampilkan {startIndex + 1}
          {" - "}
          {Math.min(startIndex + perPage, historyData.length)} dari{" "}
          {historyData.length} data
        </p>

        {/* PAGINATION */}
        <div className="flex items-center gap-3">
          {/* PREV */}
          <button
            onClick={prevPage}
            className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-50"
          >
            {"<"}
          </button>

          {/* PAGE */}
          <button className="w-10 h-10 rounded-xl bg-blue-500 text-white font-semibold">
            {currentPage}
          </button>

          {/* NEXT */}
          <button
            onClick={nextPage}
            className="w-10 h-10 rounded-xl border bg-white hover:bg-gray-50"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}