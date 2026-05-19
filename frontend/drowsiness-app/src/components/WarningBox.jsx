function WarningBox({ status }) {
  const isDrowsy = status === "DROWSY";

  return (
    <div
      className={`rounded-3xl border-[5px] p-6 transition-all duration-300 h-full
      ${
        isDrowsy ? "bg-red-50 border-red-600" : "bg-green-50 border-green-600"
      }`}
    >
      <div className="flex items-center gap-6 h-full">
        {/* ICON */}
        <div className="flex-shrink-0">
          <div
            className={`flex items-center justify-center
            ${isDrowsy ? "text-red-600" : "text-blue-700"}`}
          >
            <span className="text-[185px] leading-none -translate-y-4">
              {isDrowsy ? "⚠" : "☺"}
            </span>
          </div>
        </div>

        {/* LINE */}
        <div
          className={`w-[3px] self-stretch
          ${isDrowsy ? "bg-red-500" : "bg-green-600"}`}
        />

        {/* TEXT */}
        <div className="flex-1 overflow-hidden">
          {/* TITLE */}
          <h1
            className={`text-5xl font-black leading-none tracking-wide mb-4
            ${isDrowsy ? "text-red-600" : "text-black"}`}
          >
            {isDrowsy ? "DROWSY" : "AWAKE"}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-2xl font-bold text-gray-900 leading-snug">
            {isDrowsy ? (
              <>
                PERINGATAN!
                <br />
                Tanda Kantuk Terdeteksi
              </>
            ) : (
              <>
                Saat Ini Kamu dalam Kondisi Aman
                <br />
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WarningBox;