// "use client";

// import {
//   useRef,
//   useEffect,
//   useState
// } from "react";

// function CameraSection({
//   isCameraOn,
//   status,
//   setStatus,
//   setConfidence,
//   isMuted,
// }) {

//   const videoRef = useRef(null);

//   const canvasRef = useRef(null);

//   const streamRef = useRef(null);

//   // 🔥 ALARM
//   const alarmRef = useRef(
//     new Audio("/alarm.mp3")
//   );

//   const [seconds, setSeconds] = useState(0);
// }
//   // =========================================
//   // 🔥 SET ALARM LOOP
//   // =========================================
//   useEffect(() => {

//     alarmRef.current.loop = true;

//   }, []);

// //   // =========================================
// //   // 🔥 PLAY / STOP ALARM
// //   // =========================================
// //   useEffect(() => {

// //     // mute aktif
// //     if (isMuted) {

// //       alarmRef.current.pause();

// //       alarmRef.current.currentTime = 0;

// //       return;
// //     }

// // if (
// //   status === "DROWSY" &&
// //   alarmRef.current.paused
// // ) {

// //   alarmRef.current
// //     .play()
// //     .catch((err) => {

// //       console.log(
// //         "Audio blocked:",
// //         err
// //       );
// //     });

// // } else {

// //   alarmRef.current.pause();

// //   alarmRef.current.currentTime = 0;
// // }
// // }, [status, isMuted]);
// // =========================================
// // 🔥 PLAY / STOP ALARM
// // =========================================
// useEffect(() => {

//   // mute aktif
//   if (isMuted) {

//     alarmRef.current.pause();

//     alarmRef.current.currentTime = 0;

//     return;
//   }

//   if (
//     status === "DROWSY" &&
//     alarmRef.current.paused
//   ) {

//     alarmRef.current
//       .play()
//       .catch((err) => {

//         console.log(
//           "Audio blocked:",
//           err
//         );
//       });

//   } else {

//     alarmRef.current.pause();

//     alarmRef.current.currentTime = 0;
//   }

// }, [status, isMuted]);

//   // =========================================
//   // 🎥 START CAMERA
//   // =========================================
//   useEffect(() => {
//     if (isCameraOn) {

//   // cek browser support
//   if (
//     !navigator.mediaDevices ||
//     !navigator.mediaDevices.getUserMedia
//   ) {

//     console.error(
//       "getUserMedia tidak didukung browser"
//     );

//     return;
//   }

//   navigator.mediaDevices
//     .getUserMedia({
//       video: true
//     })

//         .then((stream) => {

//           streamRef.current = stream;

//           if (videoRef.current) {

//             videoRef.current.srcObject = stream;

//             videoRef.current.onloadedmetadata = () => {

//               videoRef.current
//                 .play()
//                 .catch(() => {});
//             };
//           }
//         })

//         .catch((err) => {

//           console.error(
//             "Camera Error:",
//             err
//           );
//         });

//     } else {

//       // stop camera
//       streamRef.current
//         ?.getTracks()
//         .forEach((track) => track.stop());

//       if (videoRef.current) {

//         videoRef.current.srcObject = null;
//       }

//       // 🔥 stop alarm
//       alarmRef.current.pause();

//       alarmRef.current.currentTime = 0;
//     }

//   }, [isCameraOn]);

//   // =========================================
//   // 🔥 RESET LOCAL STORAGE
//   // =========================================
//   useEffect(() => {

//     if (isCameraOn) {

//       localStorage.setItem(
//         "duration",
//         0
//       );

//       localStorage.setItem(
//         "drowsyCount",
//         0
//       );

//       localStorage.setItem(
//         "status",
//         JSON.stringify("AWAKE")
//       );

//       setSeconds(0);
//     }

//   }, [isCameraOn]);

//   // =========================================
//   // ⏱️ TIMER
//   // =========================================
//   useEffect(() => {

//     if (!isCameraOn) return;

//     const interval = setInterval(() => {

//       setSeconds((prev) => {

//         const newValue = prev + 1;

//         localStorage.setItem(
//           "duration",
//           newValue
//         );

//         return newValue;
//       });

//     }, 1000);

//     return () => clearInterval(interval);

//   }, [isCameraOn]);

//   // =========================================
//   // 🕒 FORMAT TIME
//   // =========================================
//   const formatTime = () => {

//     const minutes = String(
//       Math.floor(seconds / 60)
//     ).padStart(2, "0");

//     const sec = String(
//       seconds % 60
//     ).padStart(2, "0");

//     return `${minutes}:${sec}`;
//   };

//   // =========================================
//   // 📸 CAPTURE FRAME
//   // =========================================
//   const captureFrame = () => {

//     const video = videoRef.current;

//     const canvas = canvasRef.current;

//     if (!video || !canvas) return null;

//     // video belum ready
//     if (video.readyState !== 4) return null;

//     // =========================================
//     // SMALL SIZE = FAST AI
//     // =========================================
//     // canvas.width = 64;

//     // canvas.height = 64;

//     canvas.width = 96;

//     canvas.height = 96;

//     const ctx = canvas.getContext("2d");

//     // ctx.drawImage(
//     //   video,
//     //   0,
//     //   0,
//     //   64,
//     //   64
//     // );
//     ctx.drawImage(
//     video,
//     0,
//     0,
//     96,
//     96
//   );

//     return new Promise((resolve) => {

//       canvas.toBlob(
//         resolve,
//         "image/jpeg",
//         0.5
//       );
//     });
//   };

//   // =========================================
//   // 🌐 SEND TO BACKEND
//   // =========================================
//   const sendToBackend = async () => {

//     if (!isCameraOn) return;

//     const blob = await captureFrame();

//     if (!blob) return;

//     const formData = new FormData();

//     formData.append(
//       "file",
//       blob,
//       "frame.jpg"
//     );

//     try {

//       // console.log(import.meta.env.VITE_API_URL);
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/predict`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );
// //  const text = await response.text();

// // console.log("RAW RESPONSE:", text);

// // if (!text) return;

// // const data = JSON.parse(text);

// const data = await response.json();

// console.log(
//   "API RESPONSE:",
//   data
// );

// if (!data || !data.status)
//   return;

//       console.log(
//         "API RESPONSE:",
//         data
//       );

//       // invalid response
//       if (!data.status) return;

//       // =========================================
//       // UPDATE UI
//       // =========================================
//       setStatus(data.status);

//       setConfidence(data.confidence);

//       // =========================================
//       // SAVE STATUS
//       // =========================================
//       const previousStatus = JSON.parse(
//         localStorage.getItem("status")
//       );

//       localStorage.setItem(
//         "status",
//         JSON.stringify(data.status)
//       );

//       // =========================================
//       // COUNT ONLY NEW DROWSY
//       // =========================================
//       if (
//         data.status === "DROWSY" &&
//         previousStatus !== "DROWSY"
//       ) {

//         let count = Number(
//           localStorage.getItem(
//             "drowsyCount"
//           ) || 0
//         );

//         count += 1;

//         localStorage.setItem(
//           "drowsyCount",
//           count
//         );
//       }

//     } catch (err) {

//       console.error(
//         "Backend Error:",
//         err
//       );
//     }
//   };

//   // =========================================
//   // 🔁 REALTIME LOOP
//   // =========================================
//   useEffect(() => {

//     if (!isCameraOn) return;

//     let isSending = false;

//     const interval = setInterval(async () => {

//       // prevent spam request
//       if (isSending) return;

//       isSending = true;

//       await sendToBackend();

//       isSending = false;

//     }, 300);

//     return () => clearInterval(interval);

//   }, [isCameraOn]);

//   // =========================================
//   // 🎨 UI
//   // =========================================
//   return (

//     <div className="bg-white rounded-2xl border p-4 shadow">

//       <div className="relative h-[420px] overflow-hidden rounded-xl">

//         {/* VIDEO */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="absolute w-full h-full object-cover"
//         />

//         {/* HIDDEN CANVAS */}
//         <canvas
//           ref={canvasRef}
//           className="hidden"
//         />

//         {/* STATUS */}
//         <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow flex gap-3">

//           <span className="font-medium">
//             STATUS:
//           </span>

//           <span
//             className={`font-bold ${
//               status === "DROWSY"
//                 ? "text-red-500"
//                 : "text-green-500"
//             }`}
//           >

//             {status}

//           </span>

//         </div>

//         {/* TIMER */}
//         <div className="absolute bottom-3 left-3 text-white bg-black/50 px-3 py-1 rounded-lg text-sm">

//           {formatTime()} • Monitoring

//         </div>

//       </div>

//     </div>
//   );

// export default CameraSection;



"use client";

import {
  useRef,
  useEffect,
  useState
} from "react";

function CameraSection({
  isCameraOn,
  status,
  setStatus,
  setConfidence,
  isMuted,
  monitoringTime,
  setMonitoringTime,
}) {

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const streamRef = useRef(null);

  // 🔥 ALARM
  // const alarmRef = useRef(
  //   new Audio("/alarm.mp3")
  // );

  const [seconds, setSeconds] =
    useState(0);

  // =========================================
  // 🔥 SET ALARM LOOP
  // =========================================
  // useEffect(() => {

  //   alarmRef.current.loop = true;

  // }, []);

  // =========================================
  // 🔥 PLAY / STOP ALARM
  // =========================================
  // useEffect(() => {

  //   // mute aktif
  //   if (isMuted) {

  //     alarmRef.current.pause();

  //     alarmRef.current.currentTime = 0;

  //     return;
  //   }

  //   // status drowsy
  //   if (
  //     status === "DROWSY" &&
  //     alarmRef.current.paused
  //   ) {

  //     alarmRef.current
  //       .play()
  //       .catch((err) => {

  //         console.log(
  //           "Audio blocked:",
  //           err
  //         );
  //       });

  //   } else if (
  //     status === "AWAKE"
  //   ) {

  //     alarmRef.current.pause();

  //     alarmRef.current.currentTime = 0;
  //   }

  // }, [status, isMuted]);

  // =========================================
  // 🎥 START CAMERA
  // =========================================
  useEffect(() => {

    if (isCameraOn) {

      // cek browser support
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        console.error(
          "getUserMedia tidak didukung browser"
        );

        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: true
        })

        .then((stream) => {

          streamRef.current =
            stream;

          if (
            videoRef.current
          ) {

            videoRef.current.srcObject =
              stream;

            videoRef.current.onloadedmetadata =
              () => {

                videoRef.current
                  .play()
                  .catch(() => {});
              };
          }
        })

        .catch((err) => {

          console.error(
            "Camera Error:",
            err
          );
        });

    } else {

      // stop camera
      streamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );

      if (
        videoRef.current
      ) {

        videoRef.current.srcObject =
          null;
      }

      // stop alarm
      // alarmRef.current.pause();

      // alarmRef.current.currentTime = 0;
    }

  }, [isCameraOn]);

  // =========================================
  // 🔥 RESET LOCAL STORAGE
  // =========================================
  // useEffect(() => {

  //   if (isCameraOn) {

  //     localStorage.setItem(
  //       "duration",
  //       0
  //     );

  //     localStorage.setItem(
  //       "drowsyCount",
  //       0
  //     );

  //     localStorage.setItem(
  //       "status",
  //       JSON.stringify(
  //         "AWAKE"
  //       )
  //     );

  //     setSeconds(0);
  //   }

  // }, [isCameraOn]);

  // =========================================
  // ⏱️ TIMER
  // =========================================
  useEffect(() => {

    if (!isCameraOn)
      return;

    const interval =
      setInterval(() => {

        setMonitoringTime((prev) => {

          const newValue =
            prev + 1;

          localStorage.setItem(
            "duration",
            newValue
          );

          return newValue;
        });

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [isCameraOn]);

  // =========================================
  // 🕒 FORMAT TIME
  // =========================================
  const formatTime = () => {

    const minutes = String(
      Math.floor(
        seconds / 60
      )
    ).padStart(2, "0");

    const sec = String(
      monitoringTime % 60
    ).padStart(2, "0");

    return `${minutes}:${sec}`;
  };

  // =========================================
  // 📸 CAPTURE FRAME
  // =========================================
  const captureFrame =
    () => {

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      )
        return null;

      // video belum ready
      if (
        video.readyState !== 4
      )
        return null;

      // =========================================
      // MODEL INPUT 96x96
      // =========================================
      canvas.width = 96;

      canvas.height = 96;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        video,
        0,
        0,
        96,
        96
      );

      return new Promise(
        (resolve) => {

          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.5
          );
        }
      );
    };

  // =========================================
  // 🌐 SEND TO BACKEND
  // =========================================
  const sendToBackend =
    async () => {

      if (!isCameraOn)
        return;

      const blob =
        await captureFrame();

      if (!blob)
        return;
      const formData =
  new FormData();

        const user = JSON.parse(
  localStorage.getItem("user")
);

        formData.append(
  "user_id",
  user.id
);

        formData.append(
  "file",
  blob,
  "frame.jpg"
);
      try {

        const response =
          await fetch(
            `${import.meta.env.VITE_API_URL}/predict`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        console.log(
          "API RESPONSE:",
          data
        );

        // invalid response
        if (
          !data ||
          !data.status
        )
          return;

        // =========================================
        // UPDATE UI
        // =========================================
        setStatus(
          data.status
        );

        setConfidence(
          data.confidence
        );

        // =========================================
        // SAVE STATUS
        // =========================================
        const previousStatus =
          JSON.parse(
            localStorage.getItem(
              "status"
            )
          );

        localStorage.setItem(
          "status",
          JSON.stringify(
            data.status
          )
        );

        // =========================================
        // COUNT ONLY NEW DROWSY
        // =========================================
        if (
          data.status ===
            "DROWSY" &&
          previousStatus !==
            "DROWSY"
        ) {

          let count =
            Number(
              localStorage.getItem(
                "drowsyCount"
              ) || 0
            );

          count += 1;

          localStorage.setItem(
            "drowsyCount",
            count
          );
        }

      } catch (err) {

        console.error(
          "Backend Error:",
          err
        );
      }
    };

  // =========================================
  // 🔁 REALTIME LOOP
  // =========================================
  useEffect(() => {

    if (!isCameraOn)
      return;

    let isSending =
      false;

    const interval =
      setInterval(
        async () => {

          // prevent spam request
          if (isSending)
            return;

          isSending =
            true;

          await sendToBackend();

          isSending =
            false;

        },
        300
      );

    return () =>
      clearInterval(interval);

  }, [isCameraOn]);

  // =========================================
  // 🎨 UI
  // =========================================
  return (

    <div className="bg-white rounded-2xl border p-3 md:p-4 shadow">

      <div className="relative h-[260px] sm:h-[340px] md:h-[420px] overflow-hidden rounded-xl">

        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute w-full h-full object-cover scale-x-[-1]"
        />

        {/* HIDDEN CANVAS */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* STATUS */}
        <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl shadow flex items-center gap-2 md:gap-3">

          <span className="text-sm md:text-base font-medium">
            STATUS:
          </span>

          <span
            className={`text-sm md:text-base font-bold ${
              status === "DROWSY"
                ? "text-red-500"
                : "text-green-500"
            }`}
          >

            {status}

          </span>

        </div>

        {/* TIMER */}
        <div className="absolute bottom-3 left-3 text-white bg-black/50 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">

          {formatTime()} • Monitoring

        </div>

      </div>

    </div>
  );
}

export default CameraSection;