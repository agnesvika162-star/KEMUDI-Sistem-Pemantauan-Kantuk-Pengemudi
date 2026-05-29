
function StatusGrid({ status, drowsyDuration, warningCount }) {

  const formatTime = (seconds) => {
    if (!seconds) return "00:00:00";

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor((seconds % 3600) / 60);

    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isDrowsy = status === "DROWSY";

  return (
    <div className="bg-white rounded-2xl border p-3 md:p-6">

      {/* STATUS */}
      <div className="mb-4 md:mb-8">
        <p className="text-xs md:text-sm text-gray-500 mb-2">
          STATUS
        </p>

        <div className="flex items-center gap-2">
          <h1
            className={`text-lg sm:text-2xl md:text-4xl font-bold
            ${
              isDrowsy
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {status}
          </h1>

          <span
            className={`text-lg md:text-xl
            ${
              isDrowsy
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            ●
          </span>
        </div>

        <div className="h-1 rounded-full bg-gray-200 mt-4">
          <div className="h-1 rounded-full w-full bg-blue-500" />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">

        {/* DURASI */}
        <div>
          <p className="text-xs md:text-sm text-gray-500">
            DURASI KANTUK
          </p>

          <h2 className="text-lg sm:text-lg sm:text-2xl md:text-4xl font-bold text-blue-500 mt-2">
            {formatTime(drowsyDuration)}
          </h2>

          <p className="text-xs md:text-sm text-gray-400 mt-1">
            menit
          </p>
        </div>

        {/* WARNING */}
        <div>
          <p className="text-xs md:text-sm text-gray-500">
            PERINGATAN AKTIF
          </p>

          <h2 className="text-2xl md:text-4xl font-bold text-red-500 mt-2">
            {warningCount}x
          </h2>

          <p className="text-xs md:text-sm text-gray-400 mt-1">
            dalam sesi ini
          </p>
        </div>

      </div>
    </div>
  );
}

export default StatusGrid;