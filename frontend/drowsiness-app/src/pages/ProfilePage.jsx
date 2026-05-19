import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  UserRound,
  CircleUserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function ProfilePage({ user, setUser }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  // =====================================
  // ACTIVITY STATE
  // =====================================
const [activity, setActivity] =
  useState({

    lastMonitoring: "",

    totalDrowsy: 0,

    totalDuration: ""
});

  // =====================================
  // LOAD ACTIVITY FROM BACKEND
  // =====================================
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/profile/activity-summary",
        );

        const data = await response.json();

        setActivity({
          lastMonitoring: data.lastMonitoring || "-",

          totalDrowsy: data.totalDrowsy || 0,

          totalDuration: data.averageDuration || "-",
        });
      } catch (error) {
        console.log("Gagal mengambil activity summary", error);
      }
    };

    fetchActivity();
  }, []);

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
localStorage.setItem(
  "user",
  JSON.stringify(updatedUser)
);

    setIsEditOpen(false);

    // =====================================
    // BACKEND READY
    // =====================================
    try {
      const formData = new FormData();

      formData.append("photo", file);

      await fetch("http://localhost:8000/upload-profile", {
        method: "POST",
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
localStorage.setItem(
  "user",
  JSON.stringify(updatedUser)
);

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

        await fetch("http://localhost:8000/upload-profile", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.log("Upload backend belum tersedia", error);
      }
    } catch (error) {
      console.log("Take photo error:", error);
    }
  };
useEffect(() => {

  const fetchProfile = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/profile"
      );

      const data =
        await response.json();

      console.log(
        "PROFILE:",
        data
      );

      setUser(data);

    } catch (error) {

      console.log(
        "PROFILE ERROR:",
        error
      );

    }

  };

  fetchProfile();

}, []);
useEffect(() => {

  const fetchActivity = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/profile/activity-summary"
      );

      const data =
        await response.json();

      console.log(
        "ACTIVITY:",
        data
      );

      setActivity({

        lastMonitoring:
          data.lastMonitoring,

        totalDrowsy:
          data.totalDrowsy,

        totalDuration:
          data.averageDuration,
      });

    } catch (error) {

      console.log(
        "ACTIVITY ERROR:",
        error
      );

    }

  };

  fetchActivity();

}, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="max-w-7xl mx-auto px-8 pt-36 pb-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#0F172A]">Profil Saya</h1>

          <p className="text-gray-500 mt-3 text-lg">
            Dashboard &gt; Profil Saya
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-sm border p-10 flex items-center gap-16">
          {/* PHOTO */}
          <div className="relative flex flex-col items-center">
            {/* FOTO */}
            {user?.photo ? (
              <img
                src={user.photo}
                alt="profile"
                className="w-44 h-44 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-44 h-44 rounded-full bg-gray-100 flex items-center justify-center">
                <CircleUserRound
                  size={120}
                  className="text-[#5B2C83]"
                  strokeWidth={1.5}
                />
              </div>
            )}

            {/* EDIT BUTTON */}
            <button
              onClick={() => setIsEditOpen((prev) => !prev)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-6 py-2 rounded-full bg-white border shadow-md hover:bg-gray-50 font-medium transition flex items-center gap-2"
            >
              📷 Edit
            </button>

            {/* POPUP */}
            {isEditOpen && (
              <div className="absolute top-[240px] left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl border overflow-hidden w-64 z-50">
                {/* CAMERA */}
                <button
                  type="button"
                  onClick={openCamera}
                  className="w-full text-left flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-lg"
                >
                  <>
                    <Camera size={22} />
                    Ambil Foto
                  </>
                </button>

                {/* FOLDER */}
                <label
                  htmlFor="photoUpload"
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer text-lg"
                >
                  <>
                    <ImagePlus size={22} />
                    Upload Foto
                  </>
                </label>
              </div>
            )}

            {/* INPUT FOLDER */}
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* USER INFO */}
          <div>
            <h2 className="text-5xl font-bold text-[#0F172A]">
              {user?.name || "Nama User"}
            </h2>

            <p className="text-2xl text-gray-500 mt-4">
              {user?.email || "email@gmail.com"}
            </p>
          </div>
        </div>

        {/* ACTIVITY CARD */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 mt-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">
              Aktivitas 30 Hari Terakhir
            </h2>

            <p className="text-gray-500 mt-2 text-lg">
              Ringkasan aktivitas Anda selama 30 hari terakhir.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {/* MONITORING */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
                  📅
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#0F172A]">
                    Monitoring Terakhir
                  </h3>

                  <p className="text-gray-500 text-lg mt-1">
                    Waktu terakhir sistem memantau aktivitas Anda.
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#0F172A]">
                {activity.lastMonitoring}
              </p>
            </div>

            {/* DROWSY */}
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#0F172A]">
                    Total Deteksi (30 Hari Terakhir)
                  </h3>

                  <p className="text-gray-500 text-lg mt-1">
                    Jumlah total deteksi kantuk dalam 30 hari terakhir.
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#0F172A]">
                {activity.totalDrowsy} kali
              </p>
            </div>

            {/* DURATION */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">
                  ⏱️
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-[#0F172A]">
                    Durasi Rata-Rata Perjalanan
                  </h3>

                  <p className="text-gray-500 text-lg mt-1">
                    Rata-rata durasi setiap perjalanan Anda.
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#0F172A]">
                {activity.totalDuration}
              </p>
            </div>
          </div>

          <div className="mt-10 bg-blue-50 rounded-2xl px-6 py-5 text-blue-600 text-lg">
            ⓘ Data dihitung dari aktivitas Anda selama 30 hari terakhir.
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-3xl p-6 w-[500px]">
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