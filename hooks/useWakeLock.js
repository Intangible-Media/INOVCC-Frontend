// hooks/useWakeLock.js
import { useState, useEffect } from "react";

const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        const wakeLock = await navigator.wakeLock.request("screen");
        setWakeLock(wakeLock);
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          setWakeLock(null);
        });
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [wakeLock]);

  return wakeLock;
};

export default useWakeLock;
