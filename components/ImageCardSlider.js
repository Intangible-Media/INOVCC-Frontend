import { Checkbox, Button, FileInput, Label, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { deleteFile } from "../utils/api/media";
import { uploadFiles } from "../utils/api/structures";
import { ensureDomain } from "../utils/strings";
import { useInspection } from "../context/InspectionContext";

export const useImageUpload = (
  session,
  structureId,
  addGeoTag,
  longitude,
  latitude
) => {
  const { inspection, refreshInspection } = useInspection();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageObj, setUploadedImageObj] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setUploadedImageObj(file);
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
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
            ctx.textAlign = "right"; // Align text to the right
            ctx.textBaseline = "top"; // Align text to the top
            ctx.shadowColor = "black"; // Color of the shadow
            ctx.shadowOffsetX = 2; // Horizontal distance of the shadow
            ctx.shadowOffsetY = 2; // Vertical distance of the shadow
            ctx.shadowBlur = 4; // Blurriness of the shadow

            const padding = 10; // Padding from the edge

            // Draw text at the top right corner
            ctx.fillText(
              `Longitude: ${longitude}`,
              canvas.width - padding,
              padding
            );
            ctx.fillText(
              `Latitude: ${latitude}`,
              canvas.width - padding,
              padding + fontSize + 5 // Additional spacing between lines
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

  const handleImageSubmit = async (setImages, images) => {
    if (!uploadedImage) return;
    try {
      setLoadingImage(true);
      processImageForFinal(uploadedImageObj, async (finalFile) => {
        const response = await uploadFiles(
          session.accessToken,
          [finalFile],
          structureId,
          "images"
        );
        const newImage = {
          id: Date.now(),
          attributes: { url: URL.createObjectURL(finalFile) },
        };
        console.log("images", images);
        console.log("data below", {
          data: [...images.data, newImage],
        });
        setImages({ data: [...images.data, newImage] });
        setUploadedImage(null);
        setUploadedImageObj(null);
        setLoadingImage(false);
        refreshInspection();
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    uploadedImage,
    loadingImage,
    handleImageUpload,
    handleImageSubmit,
  };
};

export const useImageActions = (session, images, setImages, setActiveImage) => {
  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");
    try {
      await deleteFile({ id, jwt: session.accessToken });
      setImages({ data: images.data.filter((image) => image.id !== id) });
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

const ImageSlider = ({
  images: propImages = [],
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
  const [images, setImages] = useState({ data: propImages.data || [] });

  const { uploadedImage, loadingImage, handleImageUpload, handleImageSubmit } =
    useImageUpload(session, structureId, addGeoTag, longitude, latitude);

  const { handleDelete, downloadImage } = useImageActions(
    session,
    images,
    setImages,
    setActiveImage
  );

  const exitModal = (event) => {
    if (event.target.id === "active-image-modal") setActiveImage(null);
    if (event.target.id === "upload-image-modal") setUploadImage(false);
  };

  return (
    <>
      {activeImage && (
        <div
          id="active-image-modal"
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-10"
          onClick={exitModal}
        >
          <div className="aspect-square flex flex-col bg-white rounded-lg overflow-hidden relative">
            <img
              src={ensureDomain(activeImage.attributes.url)}
              className="w-full h-full object-cover object-center"
            />
            <div className="flex justify-between bg-white p-4 absolute bottom-0 left-0 right-0">
              <Button
                className="bg-dark-blue-700 hover:bg-dark-blue-800 w-36"
                onClick={() => downloadImage(activeImage)}
              >
                Download
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(activeImage.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploadImage && (
        <div
          id="upload-image-modal"
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-10"
          onClick={exitModal}
        >
          <div className="aspect-square flex bg-white rounded-lg overflow-hidden relative">
            {uploadedImage && (
              <>
                <div
                  className="flex bg-red-500 p-0.5 px-2 rounded-full top-2 right-2 absolute z-50 cursor-pointer text-white"
                  onClick={() => {
                    setUploadedImage(null);
                  }}
                >
                  X
                </div>
                <div className="relative w-full h-full">
                  <img
                    src={uploadedImage}
                    className="w-full h-full object-cover object-center"
                  />
                  {addGeoTag && (
                    <div className="absolute right-3 bottom-20">
                      <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                        Longitude: {longitude}
                      </p>
                      <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                        Latitude: {latitude}
                      </p>
                    </div>
                  )}
                  {loadingImage && (
                    <div className="flex absolute right-0 bottom-0 left-0 top-0 bg-white bg-opacity-95 z-40 gap-3 text-center justify-center">
                      <div className="flex flex-col m-auto gap-3">
                        <Spinner />
                        <p>Loading Your Image</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!uploadedImage && (
              <Label
                htmlFor="dropzone-file-34343"
                className="flex justify-center bg-gray-100 w-full h-full items-center overflow-hidden cursor-pointer flex-col"
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
                    <span className="">
                      Recomend images larger than 800 x 800
                    </span>
                  </p>
                </div>
                <FileInput
                  id="dropzone-file-34343"
                  className="hidden"
                  type="file"
                  onChange={handleImageUpload}
                />
              </Label>
            )}

            <div className="bg-white flex justify-between p-4 absolute bottom-0 left-0 right-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="agree"
                  color="darkBlue"
                  checked={addGeoTag}
                  onChange={() => setAddGeoTag(!addGeoTag)}
                />
                <Label htmlFor="agree" className="flex">
                  Add Geotag
                </Label>
              </div>
              <Button
                className="bg-dark-blue-700 hover:bg-dark-blue-800 w-36"
                onClick={() => handleImageSubmit(setImages, images)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="relative w-full h-full">
        <div className="grid grid-cols-3 gap-2">
          {images.data && images.data.length > 0 ? (
            images.data.map((image, index) => {
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
              return (
                <div
                  className="flex-shrink-0 w-full"
                  key={index}
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={ensureDomain(image.attributes.url)}
                    alt="travel image"
                    className="w-full h-full object-cover object-center aspect-square z-10 rounded-md"
                  />
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
            <a className="text-sm leading-none font-medium" href="#">
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
