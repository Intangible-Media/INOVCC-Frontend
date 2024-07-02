import { useRef, useState, useEffect } from "react";

const Camera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      };

      getCameraStream();
    }
  }, [isCameraOpen]);

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_image.png", {
        type: "image/png",
      });
      onCapture(file);
    }, "image/png");
  };

  return (
    <div>
      <button onClick={() => setIsCameraOpen(!isCameraOpen)}>
        {isCameraOpen ? "Close Camera" : "Open Camera"}
      </button>
      {isCameraOpen && (
        <div>
          <video ref={videoRef} autoPlay style={{ width: "100%" }}></video>
          <button onClick={captureImage}>Capture Image</button>
        </div>
      )}
    </div>
  );
};

export default Camera;
