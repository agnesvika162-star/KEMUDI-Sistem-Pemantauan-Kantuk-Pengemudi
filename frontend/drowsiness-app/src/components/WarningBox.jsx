function WarningBox({ status }) {
  const isDrowsy = status === "DROWSY";

  return (
    <div
      className={`rounded-2xl md:rounded-3xl border-[2px] md:border-[5px] p-3 md:p-6 transition-all duration-300 h-full
      ${
        isDrowsy ? "bg-red-50 border-red-600" : "bg-green-50 border-green-600"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 h-full text-center md:text-left">
        {/* ICON */}
        <div className="flex-shrink-0">
          <div
            className={`flex items-center justify-center
            ${isDrowsy ? "text-red-600" : "text-blue-700"}`}
          >
            <span className="text-[60px] sm:text-[75px] md:text-[185px] leading-none md:-translate-y-4">
              {isDrowsy ? "⚠" : "☺"}
            </span>
          </div>
        </div>

        {/* LINE */}
        <div
          className={`hidden md:block w-[3px] self-stretch
          ${isDrowsy ? "bg-red-500" : "bg-green-600"}`}
        />

        {/* TEXT */}
        <div className="flex-1 overflow-hidden">
          {/* TITLE */}
          <h1
            className={`text-xl sm:text-2xl md:text-5xl font-black leading-none tracking-wide mb-4
            ${isDrowsy ? "text-red-600" : "text-black"}`}
          >
            {isDrowsy ? "DROWSY" : "AWAKE"}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-xs sm:text-sm md:text-2xl font-bold text-gray-900 leading-snug">
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