import { useState, useCallback } from "react";
import { openDB } from "idb";
import { useInspection } from "../../context/InspectionContext";
import { useLoading } from "../../context/LoadingContext";
import { uploadFiles } from "../../utils/api/structures";

export const useImageUpload = (
  session,
  structureId,
  addGeoTag,
  longitude,
  latitude
) => {
  const { refreshInspection } = useInspection();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedImageObjs, setUploadedImageObjs] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);
  const [loadingImage, setLoadingImage] = useState(false);
  const { showSuccess, showLoading, showError } = useLoading();

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length) {
      setUploadedImageObjs(files);
      setUploadedImages(
        files.map((file) => ({
          type: file.type,
          name: file.name,
          url: URL.createObjectURL(file),
        }))
      );
    }
  };

  const processImageForFinal = useCallback(
    (file, callback) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (addGeoTag) {
            const fontSize = 100;
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = "white";
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.shadowColor = "black";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;

            const padding = 10;
            ctx.fillText(
              `Longitude: ${longitude}`,
              canvas.width - padding,
              padding
            );
            ctx.fillText(
              `Latitude: ${latitude}`,
              canvas.width - padding,
              padding + fontSize + 5
            );
          }

          canvas.toBlob((blob) => {
            const finalFile = new File([blob], file.name, {
              type: "image/png",
            });
            callback(finalFile);
          }, "image/png");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    [addGeoTag, longitude, latitude]
  );

  const handleImageSubmit = async () => {
    if (!uploadedImageObjs.length && !capturedImages.length) {
      showError("No images selected for upload.");
      return;
    }

    showLoading("Uploading your images...");

    try {
      const allImages = [...uploadedImageObjs, ...capturedImages];

      const processedFiles = await Promise.all(
        allImages.map(
          (file) =>
            new Promise((resolve, reject) => {
              if (file.type.startsWith("image/")) {
                if (addGeoTag) {
                  processImageForFinal(file, resolve);
                } else {
                  resolve(file);
                }
              } else {
                resolve(file); // Return non-image files as they are
              }
            })
        )
      );

      if (navigator.onLine) {
        const response = await uploadFiles(
          session.accessToken,
          processedFiles,
          structureId,
          "images"
        );
        handleUploadResponse(response);
      } else {
        // Save files to IndexedDB for later upload
        const db = await openDB("image-store", 1, {
          upgrade(db) {
            db.createObjectStore("images", {
              keyPath: "id",
              autoIncrement: true,
            });
          },
        });

        const tx = db.transaction("images", "readwrite");
        const store = tx.objectStore("images");
        for (const file of processedFiles) {
          await store.add({ file, structureId });
        }

        showSuccess("Images will be uploaded once the connection is restored.");
      }

      setUploadedImages([]);
      setUploadedImageObjs([]);
      setCapturedImages([]);

      await refreshInspection();
    } catch (error) {
      console.error(error);
      showError(`Failed to upload images: ${error.message || "Unknown error"}`);
    }
  };

  const handleUploadResponse = (response) => {
    if (response.type === "Success" || response.type === "Mixed") {
      showSuccess(response.message);
    } else if (response.type === "Error") {
      showError(response.message);
    }
  };

  return {
    uploadedImages,
    setUploadedImages,
    capturedImages,
    setCapturedImages,
    loadingImage,
    handleImageUpload,
    handleImageSubmit,
  };
};
