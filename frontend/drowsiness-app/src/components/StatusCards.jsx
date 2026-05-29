
function StatusGrid({ status, drowsinessLevel, drowsyDuration, warningCount }) {
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* TINGKAT KANTUK */}
      <div className="bg-white p-4 rounded-xl border text-center">
        <p className="text-gray-500 text-sm">TINGKAT KANTUK</p>
        <p className="text-2xl font-bold text-blue-500">
          {Math.round(drowsinessLevel)}%
        </p>
      </div>

      {/* DURASI */}
      <div className="bg-white p-4 rounded-xl border text-center">
        <p className="text-gray-500 text-sm">DURASI KANTUK</p>
        <p className="text-2xl font-bold">{formatTime(drowsyDuration)}</p>
        <p className="text-xs text-gray-400">menit</p>
      </div>

      {/* STATUS */}
      <div className="bg-white p-4 rounded-xl border text-center">
        <p className="text-gray-500 text-sm">STATUS</p>
        <p
          className={`text-2xl font-bold ${
            status === "DROWSY" ? "text-red-500" : "text-green-500"
          }`}
        >
          {status}
        </p>
      </div>

      {/* WARNING */}
      <div className="bg-white p-4 rounded-xl border text-center">
        <p className="text-gray-500 text-sm">PERINGATAN AKTIF</p>
        <p className="text-2xl font-bold text-red-500">{warningCount}x</p>
        <p className="text-xs text-gray-400">dalam sesi ini</p>
      </div>
    </div>
  );
}

export default StatusGrid;