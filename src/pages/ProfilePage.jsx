import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, UserRound, CircleUserRound } from "lucide-react";
// import Navbar from "../components/Navbar";
import { getAccessToken } from "../utils/auth";

export default function ProfilePage({ user, setUser }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  // =====================================
  // ACTIVITY STATE
  // =====================================
  const [activity, setActivity] = useState({
    lastMonitoring: "",
    totalDrowsy: 0,
    totalDuration: "",
  });
  // =====================================
  // LOAD ACTIVITY FROM DASHBOARD HISTORY
  // =====================================
  useEffect(() => {
    const fetchDashboardHistory = async () => {
      try {
        const token = getAccessToken();

        const userData = JSON.parse(localStorage.getItem("user"));

        if (!userData?.id) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard-history/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!Array.isArray(data)) return;

        // =====================================
        // TOTAL PERINGATAN KANTUK
        // =====================================
        const totalDrowsy = data.reduce((sum, item) => {
          return sum + Number(item.frekuensi || 0);
        }, 0);

        // =====================================
        // TOTAL MONITORING
        // =====================================
        const totalMonitoringSeconds = data.reduce((sum, item) => {
          if (!item.monitoring_duration) return sum;

          const parts = item.monitoring_duration.split(":");

          const seconds =
            Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);

          return sum + seconds;
        }, 0);

        // =====================================
        // RATA RATA MONITORING
        // =====================================
        const averageSeconds =
          data.length > 0
            ? Math.floor(totalMonitoringSeconds / data.length)
            : 0;

        // =====================================
        // FORMAT HH:MM:SS
        // =====================================
        const formatTime = (seconds) => {
          const h = String(Math.floor(seconds / 3600)).padStart(2, "0");

          const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");

          const s = String(seconds % 60).padStart(2, "0");

          return `${h}:${m}:${s}`;
        };

        // =====================================
        // MONITORING TERAKHIR
        // =====================================
        const latestMonitoring = data.length > 0 ? data[0].tanggal : "-";

        // =====================================
        // SET ACTIVITY
        // =====================================
        setActivity({
          lastMonitoring: latestMonitoring,

          totalDrowsy,

          totalDuration: formatTime(averageSeconds),
        });
      } catch (error) {
        console.log("PROFILE ACTIVITY ERROR:", error);
      }
    };

    // FETCH PERTAMA
    fetchDashboardHistory();

    // REFRESH TIAP 5 DETIK
    const interval = setInterval(() => {
      fetchDashboardHistory();
    }, 5000);

    // HAPUS INTERVAL SAAT PINDAH HALAMAN
    return () => clearInterval(interval);
  }, []);
  // =====================================
  // LOAD ACTIVITY FROM BACKEND
  // =====================================
  // useEffect(() => {
  //   const fetchActivity = async () => {
  //     try {
  //       const token = getAccessToken();

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/profile/activity-summary`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await response.json();

  //       setActivity({
  //         lastMonitoring: data.lastMonitoring || "-",

  //         totalDrowsy: data.totalDrowsy || 0,

  //         totalDuration: data.averageDuration || "-",
  //       });
  //     } catch (error) {
  //       console.log("Gagal mengambil activity summary", error);
  //     }
  //   };

  //   fetchActivity();
  // }, []);

  // =====================================
  // HANDLE PHOTO UPLOAD
  // =====================================
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // =====================================
    // TEMP PREVIEW FRONTEND
    // =====================================
    const previewUrl = URL.createObjectURL(file);

    // =====================================
    // UPDATE GLOBAL USER STATE
    // =====================================
    const updatedUser = {
      ...user,
      photo: previewUrl,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditOpen(false);

    // =====================================
    // BACKEND READY
    // =====================================
    try {
      const formData = new FormData();

      formData.append("photo", file);

      const token = getAccessToken();

      await fetch(`${import.meta.env.VITE_API_URL}/upload-profile`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });
    } catch (error) {
      console.log("Upload backend belum tersedia", error);
    }
  };

  // =====================================
  // OPEN CAMERA
  // =====================================
  const openCamera = async () => {
    try {
      setIsEditOpen(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);

      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;

          videoRef.current.play();
        }
      }, 300);
    } catch (error) {
      console.log("Camera Error:", error);

      alert(
        "Kamera tidak dapat diakses. Pastikan browser sudah diberi izin kamera.",
      );
    }
  };

  // =====================================
  // CLOSE CAMERA
  // =====================================
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setIsCameraOpen(false);
  };

  // =====================================
  // TAKE PHOTO
  // =====================================
  const takePhoto = async () => {
    try {
      const video = videoRef.current;

      const canvas = canvasRef.current;

      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;

      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/png");

      // =====================================
      // UPDATE GLOBAL USER STATE
      // =====================================
      const updatedUser = {
        ...user,
        photo: imageData,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      closeCamera();

      // =====================================
      // BACKEND READY
      // =====================================
      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );

        const formData = new FormData();

        formData.append("photo", blob, "camera-photo.png");

        const token = getAccessToken();

        await fetch(`${import.meta.env.VITE_API_URL}/upload-profile`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        });
      } catch (error) {
        console.log("Upload backend belum tersedia", error);
      }
    } catch (error) {
      console.log("Take photo error:", error);
    }
  };
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const token = getAccessToken();

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/profile`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await response.json();

  //       console.log("PROFILE:", data);

  //       setUser(data);
  //     } catch (error) {
  //       console.log("PROFILE ERROR:", error);
  //     }
  //   };

  //   fetchProfile();
  // }, []);
  // useEffect(() => {
  //   const fetchActivity = async () => {
  //     try {
  //       const token = getAccessToken();

  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/profile/activity-summary`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );
  //       const data = await response.json();

  //       // console.log("ACTIVITY:", data);

  //       // setActivity({
  //       //   lastMonitoring: data.lastMonitoring,

  //       //   totalDrowsy: data.totalDrowsy,

  //       //   totalDuration: data.averageDuration,
  //       // });
  //     } catch (error) {
  //       console.log("ACTIVITY ERROR:", error);
  //     }
  //   };

  //   fetchActivity();
  // }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-5 md:px-8 pt-20 md:pt-28 pb-6">
        {/* HEADER */}
        <div className="mb-7">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Profil Saya
          </h1>

          <p className="mt-2 text-sm md:text-base">
            <span className="text-[#2563EB]">Dashboard &gt;</span>{" "}
            <span className="text-[#2563EB] font-bold">Profil Saya</span>
          </p>
        </div>

        {/* PROFILE CARD */}
        {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-5 sm:px-8 md:px-10 py-6 md:py-8 flex items-center gap-5 md:gap-8 transition">
          {/* PHOTO */}
        {/* <div className="relative flex flex-col items-center"> */}
        {/* FOTO */}
        {/* {user?.photo ? (
              <img
                src={user.photo}
                alt="profile"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg bg-[#F3F0FF]"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#F3F0FF] flex items-center justify-center shadow-lg">
                <CircleUserRound
                  size={42}
                  className="text-[#5B2C83]"
                  strokeWidth={1.5}
                />
              </div>
            )} */}

        {/* EDIT BUTTON */}
        {/* <button
              onClick={() => setIsEditOpen((prev) => !prev)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 text-xs rounded-full bg-white shadow-xl border border-gray-100 hover:bg-gray-50 font-semibold transition flex items-center gap-2"
            >
              📷 Edit
            </button> */}

        {/* POPUP */}
        {/* {isEditOpen && (
              <div className="absolute top-[240px] left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl border overflow-hidden w-64 z-50"> */}
        {/* CAMERA */}
        {/* <button
                  type="button"
                  onClick={openCamera}
                  className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-lg"
                >
                  <>
                    <Camera size={22} />
                    Ambil Foto
                  </>
                </button> */}

        {/* FOLDER */}
        {/* <label
                  htmlFor="photoUpload"
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer text-lg"
                >
                  <>
                    <ImagePlus size={22} />
                    Upload Foto
                  </>
                </label>
              </div> */}

        {/* INPUT FOLDER */}
        {/* <input
              id="photoUpload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div> */}

        {/* USER INFO */}
        {/* <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[#0F172A] text-center md:text-left leading-tight">
              {user?.name || "Nama User"}
            </h2>

            <p className="text-sm sm:text-base md:text-xl text-gray-500 mt-2 text-center md:text-left break-all">
              {user?.email || "email@gmail.com"}
            </p>
          </div>
        </div> */}
        {/* PROFILE CARD */}
        <div className="bg-white rounded-[32px] border border-[#DDE7FF] shadow-sm overflow-visible">
          {/* TOP HEADER */}
          <div className="h-20 bg-[#D9E8FF] rounded-t-[32px]" />

          {/* CONTENT */}
          <div className="relative px-6 md:px-10 pb-10 pt-4">
            {/* AVATAR */}
            <div className="-mt-10 flex items-end gap-5">
              {/* LEFT */}
              <div className="flex items-end gap-5">
                {/* PHOTO */}
                <div className="relative">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="profile"
                      className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#F3F7FF] border-4 border-white shadow-lg flex items-center justify-center">
                      <CircleUserRound
                        size={52}
                        className="text-blue-600"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  {/* ICON EDIT */}
                  <button
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
                  >
                    ✎
                  </button>

                  {/* POPUP */}
                  {isEditOpen && (
                    <div className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl border overflow-hidden w-64 z-50">
                      <button
                        type="button"
                        onClick={openCamera}
                        className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-lg"
                      >
                        <Camera size={22} />
                        Ambil Foto
                      </button>

                      <label
                        htmlFor="photoUpload"
                        className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer text-lg"
                      >
                        <ImagePlus size={22} />
                        Upload Foto
                      </label>
                    </div>
                  )}

                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                {/* USER INFO */}
                <div className="pb-2 flex flex-col gap-1">
                  <h2 className="text-2xl md:text-4xl font-bold text-[#0F172A] leading-tight">
                    {user?.name || "Nama User"}
                  </h2>

                  <p className="text-gray-500 text-base md:text-xl break-all">
                    {user?.email || "email@gmail.com"}
                  </p>

                  {/* BADGE */}
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF4FF] text-[#4F7CFF] text-sm font-semibold">
                    ✓ Pengemudi Aktif
                  </div>
                </div>
              </div>

              {/* BUTTON RIGHT */}
              {/* <div className="md:pb-2">
                <button
                  onClick={() => setIsEditOpen((prev) => !prev)}
                  className="px-5 py-3 rounded-2xl border border-[#D9E8FF] bg-[#F8FBFF] hover:bg-[#EEF4FF] text-[#4F7CFF] font-semibold transition shadow-sm"
                >
                  ✏️ Edit Profil
                </button>
              </div> */}
            </div>
          </div>
        </div>
        {/* ACTIVITY CARD */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 md:p-7 mt-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-[#2563EB] border-b pb-5 tracking-tight">
              Riwayat Aktivitas
            </h2>

            <p className="text-[#94A3B8] mt-2 text-sm md:text-base">
              Ringkasan aktivitas monitoring Anda
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {/* MONITORING */}
            <div className="flex items-start justify-between gap-3 sm:gap-6 border-b pb-4 md:pb-6">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-blue-50 flex items-center justify-center text-sm sm:text-xl md:text-3xl">
                  📅
                </div>

                <div>
                  <h3 className="text-sm sm:text-base md:text-xl font-semibold text-[#0F172A]">
                    Monitoring Terakhir
                  </h3>

                  <p className="text-[11px] sm:text-xs md:text-lg text-gray-500 mt-1">
                    Waktu terakhir sistem memantau aktivitas Anda.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm md:text-xl font-semibold text-[#0F172A] text-right min-w-[85px] md:min-w-[140px] leading-tight">
                {activity.lastMonitoring}
              </p>
            </div>

            {/* DROWSY */}
            <div className="flex items-start justify-between gap-3 sm:gap-6 border-b pb-4 md:pb-6">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-red-50 flex items-center justify-center text-sm sm:text-xl md:text-3xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="text-sm md:text-2xl font-semibold text-[#0F172A]">
                    Total Peringatan Kantuk
                  </h3>

                  <p className="text-[11px] sm:text-xs md:text-lg text-gray-500 mt-1">
                    Total peringatan kantuk yang terdeteksi sistem
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm md:text-xl font-semibold text-[#0F172A] text-right min-w-[85px] md:min-w-[140px] leading-tight">
                {activity.totalDrowsy} kali
              </p>
            </div>

            {/* DURATION */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-green-50 flex items-center justify-center text-sm sm:text-xl md:text-3xl">
                  ⏱️
                </div>

                <div>
                  <h3 className="text-sm sm:text-base md:text-2xl font-semibold text-[#0F172A]">
                    Rata-Rata Waktu Monitoring
                  </h3>

                  <p className="text-[11px] sm:text-xs md:text-lg text-gray-500 mt-1">
                    Rata-rata waktu monitoring selama penggunaan sistem.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm md:text-xl font-semibold text-[#0F172A] text-right min-w-[85px] md:min-w-[140px] leading-tight">
                {activity.totalDuration}
              </p>
            </div>
          </div>

          <div className="mt-10 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl px-4 md:px-6 py-4 md:py-5 text-blue-600 text-sm md:text-lg">
            ⓘ Data dihitung berdasarkan aktivitas monitoring pengguna
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 w-[500px]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-2xl bg-black"
            />

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-4 mt-5">
              <button
                onClick={takePhoto}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                Ambil Foto
              </button>

              <button
                onClick={closeCamera}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
