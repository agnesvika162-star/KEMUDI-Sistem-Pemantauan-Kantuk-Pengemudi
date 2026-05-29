
"use client";

export default function StatusRealtime({
  status = "DROWSY",
  lastUpdate = "2 detik lalu",
}) {
  const isDrowsy = status === "DROWSY";

  return (
    <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div className="w-14 h-14 flex items-center justify-center border-2 border-blue-400 rounded-full text-2xl">
          😴
        </div>

        {/* TEXT */}
        <div>
          <h2 className="text-lg font-semibold">
            STATUS:{" "}
            <span className={isDrowsy ? "text-blue-600" : "text-green-600"}>
              {status}
            </span>
          </h2>

          <p className="text-gray-600 text-sm mt-1">
            {isDrowsy
              ? "Waspada! Anda terdeteksi mengantuk."
              : "Anda dalam kondisi aman."}
          </p>

          {isDrowsy && (
            <p className="text-gray-600 text-sm">
              Disarankan untuk beristirahat.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <span>Update: {lastUpdate}</span>
      </div>
    </div>
  );
}