import { useState, useRef, useEffect, useCallback } from "react";
import { Checkbox, Button, FileInput, Label, Spinner } from "flowbite-react";
import { deleteFile } from "../utils/api/media";
import { ensureDomain, getUrls, downloadFilesAsZip } from "../utils/strings";
import { useInspection } from "../context/InspectionContext";
import { useLoading } from "../context/LoadingContext";
import { uploadFiles } from "../utils/api/structures";
import { FaRegCircle } from "react-icons/fa";
import { MdFlipCameraAndroid } from "react-icons/md";
import { IoCloseCircleOutline } from "react-icons/io5";

import { FaRegTrashCan } from "react-icons/fa6";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineSaveAlt,
} from "react-icons/md";
import { useSession } from "next-auth/react";

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
  const { showLoading, showSuccess, showError, resetLoading } = useLoading();

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
              if (file.type.startsWith("image/") && addGeoTag) {
                processImageForFinal(file, resolve);
              } else {
                resolve(file); // Return non-image files as they are
              }
            })
        )
      );

      const response = await uploadFiles(
        session.accessToken,
        processedFiles,
        structureId,
        "images"
      );

      console.log(response.type);
      console.log(response.message);

      if (response.type === "Success") {
        showSuccess(response.message);
      }
      if (response.type === "Mixed") {
        showSuccess(response.message);
      }
      if (response.type === "Error") {
        showError(response.message);
      }

      setUploadedImages([]);
      setUploadedImageObjs([]);
      setCapturedImages([]);

      await refreshInspection();
    } catch (error) {
      console.error(error);
      showError(`Failed to upload images: ${error || "Unknown error"}`);
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

export const useImageActions = (session, images, setActiveImage) => {
  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");
    try {
      await deleteFile({ id, jwt: session.accessToken });
      setActiveImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadImage = async (file) => {
    const url = ensureDomain(file.attributes?.url);

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectURL;
      a.download = file.attributes?.name || "downloaded-image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectURL); // Clean up the object URL
    } catch (error) {
      console.error("Error downloading the image", error);
    }
  };

  return { handleDelete, downloadImage };
};

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

const ImageSlider = ({
  images,
  structureId = null,
  limit = true,
  longitude = 0,
  latitude = 0,
  editable = true,
}) => {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(false);
  const [addGeoTag, setAddGeoTag] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useCamera, setUseCamera] = useState(null);
  const { showLoading, showSuccess, showError, resetLoading } = useLoading();

  const {
    uploadedImages,
    setUploadedImages,
    capturedImages,
    setCapturedImages,
    loadingImage,
    handleImageUpload,
    handleImageSubmit,
  } = useImageUpload(session, structureId, addGeoTag, longitude, latitude);

  const { handleDelete, downloadImage } = useImageActions(
    session,
    images,
    setActiveImage
  );

  const exitModal = (event) => {
    if (event.target.id === "active-image-modal") setActiveImage(null);
    if (event.target.id === "upload-image-modal") setUploadImage(false);
  };

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % uploadedImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? uploadedImages.length - 1 : prevIndex - 1
    );
  };

  const handleCapture = (file) => {
    setCapturedImages([...capturedImages, file]);
  };

  const handleCaptureDone = (capturedImages) => {
    setUploadedImages((prevImages) => [
      ...prevImages,
      ...capturedImages.map((file) => ({
        type: file.type,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  return (
    <>
      {activeImage && (
        <div
          id="active-image-modal"
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-4 md:p-10"
          onClick={exitModal}
        >
          <div className="aspect-square flex flex-col bg-white rounded-lg overflow-hidden relative">
            {activeImage.attributes.mime.startsWith("image/") ? (
              <img
                src={ensureDomain(activeImage.attributes.url)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="flex flex-col gap-4 items-center justify-center w-full h-full bg-white text-gray-800">
                <div className="flex flex-col justify-center border border-gray-300 rounded-md aspect-[1/1.294] p-14">
                  <h6 className=" text-xl text-gray-400 font-medium">
                    {activeImage.attributes.ext}
                  </h6>
                </div>
                <h6 className="text-sm font-medium">
                  {activeImage.attributes.name}
                </h6>
              </div>
            )}

            <div className="flex justify-between p-4 absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-[#000000] bg-opacity-50">
              <div className="flex justify-between w-full">
                <button
                  className="bg-tranparent p-0 hover:p-0 hover:bg-transparent cursor-pointer"
                  onClick={() => handleDelete(activeImage.id)}
                >
                  <FaRegTrashCan
                    className="p-0"
                    color="white"
                    size={19}
                    style={{ padding: 0 }}
                  />
                </button>
                <button
                  className="bg-tranparent p-0 hover:p-0 hover:bg-transparent cursor-pointer"
                  onClick={() => downloadImage(activeImage)}
                >
                  <MdOutlineSaveAlt
                    className="p-0"
                    color="white"
                    size={25}
                    style={{ padding: 0 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadImage && (
        <div
          id="upload-image-modal"
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-4 md:p-10"
          onClick={exitModal}
        >
          <div className="aspect-square flex bg-red-500 rounded-lg overflow-hidden relative">
            {uploadedImages.length > 0 ? (
              <div className="relative w-full h-full">
                <div
                  className="flex justify-center align-middle bg-red-700 hover:bg-red-800 w-7 h-7 rounded-full top-2 right-2 absolute z-50 cursor-pointer text-white text-xxs"
                  onClick={() => {
                    setUploadedImages((prevImages) =>
                      prevImages.filter((_, i) => i !== currentIndex)
                    );
                  }}
                >
                  <div className="m-auto">X</div>
                </div>

                {uploadedImages[currentIndex].type.startsWith("image/") ? (
                  <img
                    src={uploadedImages[currentIndex].url}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col gap-2 items-center justify-center w-full h-full bg-white text-gray-800">
                    <div className="flex flex-col justify-center border border-gray-300 rounded-md aspect-[1/1.294] p-10">
                      <h6 className=" text-base text-gray-400 font-medium">
                        {uploadedImages[currentIndex].type.split("/")[1]}
                      </h6>
                    </div>
                    <h6 className="text-sm font-medium">
                      {uploadedImages[currentIndex].name}
                    </h6>
                  </div>
                )}

                {addGeoTag && (
                  <div className="absolute right-3 top-16">
                    <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                      Longitude: {longitude}
                    </p>
                    <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                      Latitude: {latitude}
                    </p>
                  </div>
                )}

                {uploadedImages[currentIndex].type.startsWith("image/") && (
                  <div className="absolute top-0 left-0 right-0 flex justify-between p-4 bg-gradient-to-t from-transparent to-[#000000] bg-opacity-50 ">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="agree"
                        color="darkBlue"
                        checked={addGeoTag}
                        onChange={() => setAddGeoTag(!addGeoTag)}
                      />
                      <Label htmlFor="agree" className="flex text-white">
                        Add Geotag
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center w-full h-full bg-gray-100 justify-center overflow-hidden cursor-pointer">
                <div className="flex flex-col w-full px-6 gap-2">
                  <h3 className="font-medium text-lg text-gray-700 text-center mb-4">
                    Please Select How You Will Upload
                  </h3>
                  <Button
                    onClick={() => setUseCamera("upload")}
                    className="p-2 bg-dark-blue-700 text-white w-full h-24"
                  >
                    Use Upload
                  </Button>
                  <Button
                    onClick={() => setUseCamera("camera")}
                    className="p-2 bg-dark-blue-700 text-white w-full h-24"
                  >
                    Use Camera
                  </Button>
                </div>

                {useCamera === "camera" && (
                  <CameraComponent
                    onCapture={handleCapture}
                    onCaptureDone={handleCaptureDone}
                  />
                )}

                {useCamera === "upload" && (
                  <Label
                    htmlFor="dropzone-file-34343"
                    className="flex justify-center items-center flex-col"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg
                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Drag and drop or upload here
                        </span>
                      </p>
                      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Recommend images larger than 800 x 800</span>
                      </p>
                    </div>
                    <FileInput
                      id="dropzone-file-34343"
                      className="hidden"
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </Label>
                )}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="flex justify-between p-4 absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-[#000000] bg-opacity-50">
                {uploadedImages.length > 1 && (
                  <div className="flex gap-3">
                    <button
                      className="bg-tranparent p-0 hover:p-0 hover:bg-transparent"
                      onClick={prevImage}
                    >
                      <MdOutlineKeyboardArrowLeft
                        className="p-0"
                        color="white"
                        size={25}
                        style={{ padding: 0 }}
                      />
                    </button>
                    <button
                      className="bg-tranparent p-0 hover:p-0 hover:bg-transparent"
                      onClick={nextImage}
                    >
                      <MdOutlineKeyboardArrowRight
                        className="p-0"
                        color="white"
                        size={25}
                        style={{ padding: 0 }}
                      />
                    </button>
                  </div>
                )}

                <div className="flex">
                  <button
                    className="flex gap-1 text-white"
                    onClick={handleImageSubmit}
                  >
                    <p className="m-auto">Save All</p>
                    <MdOutlineSaveAlt
                      size={15}
                      color={"white"}
                      style={{ margin: "auto" }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="relative w-full h-full">
        <div className="grid grid-cols-3 gap-2">
          {images.data && images.data.length > 0 ? (
            images.data.map((image, index) => {
              const smallestImageResolution = getUrls(image, "smallest")[0];
              const rawImageResolution = getUrls(image, "raw")[0];

              if (limit && index >= 6) return null;
              if (limit && index === 5)
                return (
                  <div className="flex-shrink-0 w-full" key={index}>
                    <div className="flex justify-center w-full h-full bg-gray-800 object-cover object-center aspect-square z-10 rounded-md bg-opacity-80">
                      <p className="text-white text-xl m-auto">
                        +{images.data.length - 5}
                      </p>
                    </div>
                  </div>
                );

              if (image.attributes.mime.startsWith("image/")) {
                return (
                  <div
                    className="flex-shrink-0 w-full cursor-pointer"
                    key={index}
                    onClick={() => setActiveImage(image)}
                  >
                    <img
                      src={ensureDomain(smallestImageResolution)}
                      alt="travel image"
                      className="w-full h-full object-cover object-center aspect-square z-10 rounded-md"
                    />
                  </div>
                );
              }
              return (
                <div
                  className="group flex flex-col aspect-square gap-2 items-center justify-center w-full h-full bg-white text-gray-800 border border-gray-300 rounded-md p-4 relative overflow-hidden cursor-pointer"
                  onClick={() => setActiveImage(image)}
                  key={index}
                >
                  <div className="flex flex-col justify-center ">
                    <h6 className=" text-lg text-gray-400 font-medium">
                      {image.attributes.ext}
                    </h6>
                  </div>
                  <h6 className="text-xxs font-medium text-gray-500 shorten-text absolute -bottom-3 left-3 right-3 group-hover:bottom-3 transition-all duration-200">
                    {image.attributes.name}
                  </h6>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 flex justify-center items-center h-full mb-6">
              <p className="text-gray-500">No images available.</p>
            </div>
          )}
        </div>

        {editable && (
          <div className="flex justify-between mt-4">
            <a
              className="text-sm leading-none font-medium"
              href="#"
              onClick={async () => {
                showLoading(
                  `Downloading all documents for ${images.data.length} structures`
                );

                const formattedImageObjects = images.data.map(
                  (image, index) => {
                    return {
                      url: ensureDomain(image.attributes.url),
                      name: image.attributes.name || "something",
                    };
                  }
                );
                console.log(formattedImageObjects);

                try {
                  const response = await downloadFilesAsZip(
                    formattedImageObjects,
                    "structures"
                  );

                  showSuccess("Download finished successfully!");
                } catch (error) {
                  console.error(error);
                  resetLoading();
                }
              }}
            >
              Download All
            </a>
            <a
              href="#"
              className="text-dark-blue-700 text-xs leading-none font-medium"
              onClick={(e) => {
                e.preventDefault();
                setUploadImage(true);
              }}
            >
              Add Asset
            </a>
          </div>
        )}
      </section>
    </>
  );
};

export default ImageSlider;
