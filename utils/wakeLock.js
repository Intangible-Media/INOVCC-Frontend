// utils/wakeLock.js
let wakeLock = null;

export const requestWakeLock = async () => {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake lock is active");
    }
  } catch (err) {
    console.error(`Failed to acquire wake lock: ${err.message}`);
  }
};

export const releaseWakeLock = () => {
  if (wakeLock !== null) {
    wakeLock
      .release()
      .then(() => {
        wakeLock = null;
        console.log("Wake lock is released");
      })
      .catch((err) => {
        console.error(`Failed to release wake lock: ${err.message}`);
      });
  }
};
