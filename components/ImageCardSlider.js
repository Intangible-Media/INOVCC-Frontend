import React, { useState, useEffect } from "react";
import { Checkbox, Button, FileInput, Label } from "flowbite-react";
import { deleteFile } from "../utils/api/media";
import { useSession } from "next-auth/react";
import { PlusIcon } from "../public/icons/intangible-icons";
import { ensureDomain } from "../utils/strings";
import { uploadFiles } from "../utils/api/structures";

const ImageSlider = ({
  images: propImages,
  structureId = null,
  limit = true,
  longitude = 0,
  latitude = 0,
  editable = true,
}) => {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageObj, setUploadedImageObj] = useState(null);
  const [addGeoTag, setAddGeoTag] = useState(false);
  const [images, setImages] = useState(propImages);

  const processImageForFinal = (file, setFinalImage) => {
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
          const fontSize = canvas.width * 0.1; // 10% of the width
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = "white";
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";

          const textLongitude = `Lon: ${longitude}`;
          const textLatitude = `Lat: ${latitude}`;
          const textX = 10; // Margin from the left edge
          const textY = canvas.height - 10; // Margin from the bottom edge

          // Draw geo-tag text at the bottom left for the final image
          ctx.fillText(textLongitude, textX, textY - fontSize); // Adjust Y for space between lines
          ctx.fillText(textLatitude, textX, textY);
        }

        // Use `setFinalImage` callback to update the state or handle the final image
        setFinalImage(canvas.toDataURL("image/png"));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = (file) => {
    console.log(file); // Debugging
    const url = ensureDomain(file.attributes?.url);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.attributes?.name || "downloaded-image.png";

    console.log(a); // Debugging

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // Store the file
    setUploadedImageObj(file);
    if (file) {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file);
      // Use this URL to display the image
      setUploadedImage(fileUrl);
    }
  };

  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");

    try {
      const response = await deleteFile({ id, jwt: session.accessToken });
      console.log(response); // Debugging
      const updatedImages = images.data.filter((image) => image.id !== id);
      setImages({ data: updatedImages });
      setActiveImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageSubmit = async () => {
    try {
      if (uploadedImage) {
        const files = [uploadedImageObj];
        const fileUrl = URL.createObjectURL(files[0]);

        const response = await uploadFiles(
          session.accessToken,
          files,
          structureId,
          "images"
        );

        setImages({
          data: [
            ...images.data,
            {
              ...uploadedImageObj,
              id: Date.now(),
              attributes: { url: fileUrl },
            },
          ],
        }); // Update the images state with the new image

        setUploadImage(false);
        setUploadedImage(null);
        setUploadedImageObj(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const exitModal = (event) => {
    if (event.target.id === "active-image-modal") {
      setActiveImage(null);
    }

    if (event.target.id === "upload-image-modal") {
      setUploadImage(false);
    }
  };

  return (
    <>
      {/* Your existing JSX with a modification to use local `images` state instead of the prop directly */}
      {activeImage && (
        <div
          id="active-image-modal"
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-10"
          onClick={exitModal}
        >
          <div
            className="aspect-square flex flex-col bg-white rounded-lg overflow-hidden relative"
            onClick={(e) => setActiveImage(activeImage)}
          >
            <div className="relative w-full h-full">
              {/* Ensure parent div covers the image size */}
              <img
                src={`${ensureDomain(activeImage.attributes.url)}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
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
                  console.log(activeImage);
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
              <div
                className="flex bg-red-500 p-0.5 px-2 rounded-full top-2 right-2 absolute z-50 cursor-pointer text-white"
                onClick={() => {
                  setUploadedImage(null);
                  setUploadedImageObj(null);
                }}
              >
                X
              </div>
            )}

            {!uploadedImage && (
              <Label
                htmlFor="dropzone-file-34343"
                className="flex justify-center bg-gray-100 w-full h-full items-center overflow-hiddenw-full cursor-pointer flex-col"
              >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <svg
                    className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
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
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">
                      Drag and drop or upload here
                    </span>
                  </p>
                </div>
                <FileInput
                  id="dropzone-file-34343"
                  className="hidden"
                  type="file"
                  onChange={(event) => handleImageUpload(event)} // Handle the file input change
                />
              </Label>
            )}

            {uploadedImage && (
              <div className="relative w-full h-full">
                {/* Ensure parent div covers the image size */}
                <img
                  src={uploadedImage}
                  className="w-full h-full object-cover object-center"
                />
                {addGeoTag && (
                  <div className="absolute right-3 bottom-20">
                    {/* Flexbox for centering */}
                    <div>
                      {/* Additional div for text grouping if needed */}
                      <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                        Longitude: {longitude}
                      </p>
                      <p className="text-white font-medium text-lg text-right drop-shadow-lg">
                        Latitude: {latitude}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                onClick={() => {
                  handleImageSubmit();
                }}
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
                  onClick={(e) => setActiveImage(image)}
                >
                  <img
                    src={`${ensureDomain(image.attributes.url)}`}
                    alt="travel image"
                    className="w-full h-full object-cover object-center aspect-square z-10 rounded-md"
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-3 flex justify-center items-center h-full">
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
