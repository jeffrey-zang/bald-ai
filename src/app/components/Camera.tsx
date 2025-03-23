"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string>();
  const [error, setError] = useState<string>();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string>();

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError(undefined);
      setResult(undefined);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera access in your browser settings and try again."
          );
        } else {
          setError(
            "Error accessing camera. Please make sure you have a camera connected."
          );
        }
      }
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg");
    setPhoto(photoUrl);

    const tracks = video.srcObject as MediaStream;
    tracks?.getTracks().forEach((track) => track.stop());

    try {
      setAnalyzing(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photoUrl })
      });

      if (!response.ok) throw new Error("Failed to analyze image");

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError("Failed to analyze image. Please try again. Error: " + err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="text-red-500 mb-4 text-center max-w-md">{error}</div>
      )}
      {!photo ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-[640px] h-[480px] bg-gray-100 rounded-lg"
          />
          <div className="flex gap-4">
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Start Camera
            </button>
            <button
              onClick={takePhoto}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Take Photo
            </button>
          </div>
        </>
      ) : (
        <>
          <img
            src={photo}
            alt="Captured"
            className="w-[640px] h-[480px] object-cover rounded-lg"
          />
          {analyzing ? (
            <div className="text-blue-500">
              Analyzing your baldness level...
            </div>
          ) : result ? (
            <div className="text-xl font-bold text-center max-w-md mt-4">
              {result}
            </div>
          ) : null}
          <button
            onClick={() => {
              setPhoto(undefined);
              setResult(undefined);
              startCamera();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retake
          </button>
        </>
      )}
    </div>
  );
}
