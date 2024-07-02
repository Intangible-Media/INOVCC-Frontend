import { useState, useRef, useEffect } from "react";
import { FaRegCircle } from "react-icons/fa";
import { MdFlipCameraAndroid } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";

const CameraComponent = ({ onCapture, onCaptureDone }) => {
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [capturedImages, setCapturedImages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error accessing devices:", error);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    if (isCameraOpen && currentDeviceId) {
      const getCameraStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: currentDeviceId,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
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
  }, [isCameraOpen, currentDeviceId]);

  const captureImage = () => {
    if (capturedImages.length >= 5) return; // Max 5 images

    // Trigger device vibration
    if (navigator.vibrate) {
      navigator.vibrate(200); // Vibrate for 200 milliseconds
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File(
        [blob],
        `captured_image_${capturedImages.length + 1}.png`,
        {
          type: "image/png",
        }
      );
      // Log captured image resolution
      console.log(
        `Captured image resolution: ${canvas.width}x${canvas.height}`
      );
      setCapturedImages((prev) => [...prev, file]);
      onCapture(file);
    }, "image/png");
  };

  const closeCamera = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200); // Vibrate for 200 milliseconds
    }

    setIsCameraOpen(false);
    onCaptureDone(capturedImages);
    setCapturedImages([]);
  };

  const switchCamera = () => {
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === currentDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
  };

  return (
    <div>
      {isCameraOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center z-[999999999999999999999]">
          <video
            ref={videoRef}
            autoPlay
            className="w-full h-auto relative"
          ></video>
          <div className="grid grid-cols-5 gap-3 absolute bottom-32 left-6 right-6">
            {capturedImages.map((image) => (
              <div
                key={image.name}
                className="aspect-square rounded-lg border border-gray-300 bg-white"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt="Captured"
                  className="w-full h-full object-cover object-center aspect-square z-10 rounded-md"
                />
              </div>
            ))}
          </div>
          <div className="absolute flex gap-4 left-1/2 transform -translate-x-1/2 bottom-10">
            {devices.length > 1 && (
              <button onClick={switchCamera} className="">
                <MdFlipCameraAndroid className="text-white w-10 h-10" />
              </button>
            )}
            <button onClick={captureImage} className="">
              <FaRegCircle className="text-white w-12 h-12" />
            </button>
            <button onClick={closeCamera} className="">
              <IoCloseCircleOutline className="text-white w-10 h-10" />
            </button>
          </div>
          <div className="absolute top-4 right-4 text-white">
            {capturedImages.length}/5 images captured
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
