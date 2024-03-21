import React, { useState, useEffect } from "react";
import { Checkbox, Button, FileInput, Label } from "flowbite-react";
import { deleteFile } from "../utils/api/media";
import { useSession } from "next-auth/react";
import { PlusIcon } from "../public/icons/intangible-icons";

const ImageSlider = ({
  images: propImages,
  limit = true,
  longitude = 0,
  latitude = 0,
}) => {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [file, setFile] = useState(null); // Store the uploaded file
  const [addGeoTag, setAddGeoTag] = useState(false);
  const [images, setImages] = useState(propImages);

  useEffect(() => {
    setImages(propImages);
  }, [propImages]);

  useEffect(() => {
    if (!file) return; // Don't proceed if there's no file selected
    processImage(file);
  }, [file, addGeoTag]); // React to file or addGeoTag changes

  const processImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scaleFactor = 0.5; // Adjust this to control the preview size
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the scaled image

        if (addGeoTag) {
          ctx.font = "100px Arial"; // Adjusted font size for scaled image
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Set shadow properties
          ctx.shadowOffsetX = 6; // Horizontal distance of the shadow, in relation to the text
          ctx.shadowOffsetY = 6; // Vertical distance of the shadow, in relation to the text
          ctx.shadowBlur = 10; // How much the shadow should be blurred
          ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; // Shadow color

          const textLongitude = `Longitude: ${longitude}`; // Ensure latitude and longitude are defined
          const textLatitude = `Latitude: ${latitude}`; // Ensure latitude and longitude are defined
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          ctx.fillText(textLongitude, centerX, centerY);
          ctx.fillText(textLatitude, centerX, centerY - 120);

          // Reset shadow properties if you're going to draw more things on the canvas
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
        }

        setUploadedImage(canvas.toDataURL("image/png"));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event) => {
    setFile(event.target.files[0]); // Store the file
  };

  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");

    try {
      await deleteFile({ id, jwt: session.accessToken });
      const updatedImages = images.data.filter((image) => image.id !== id);
      setImages({ ...images, data: updatedImages });
      setActiveImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Your existing JSX with a modification to use local `images` state instead of the prop directly */}
      {activeImage && (
        <div
          className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-10"
          onClick={(e) => setActiveImage(null)}
        >
          <div
            className="aspect-square overflow-auto"
            onClick={(e) => setActiveImage(activeImage)}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${activeImage.attributes.url}`}
              className="min-h-full"
              alt=""
            />
          </div>
          <div className="flex justify-between bg-white p-4">
            <a href="#">Download</a>
            <a
              onClick={(e) => {
                e.preventDefault();
                console.log(activeImage);
                handleDelete(activeImage.id);
              }}
            >
              Delete
            </a>
          </div>
        </div>
      )}

      {uploadImage && (
        <div className="image-modal flex flex-col align-middle justify-center absolute top-0 bottom-0 left-0 right-0 w-full z-50 p-10">
          <div className="aspect-square flex bg-white rounded-lg overflow-hidden relative">
            <div
              className="flex bg-red-500 p-1 rounded-xl top-2 right-2 absolute z-50 cursor-pointer"
              onClick={() => setUploadImage(false)}
            >
              <PlusIcon className="text-white m-auto" />
            </div>
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
              <img
                src={uploadedImage}
                className="w-full h-full object-cover object-center"
              />
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

              <Button className="bg-dark-blue-700 hover:bg-dark-blue-800 w-36">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="relative w-full h-full">
        <div className="grid grid-cols-3 gap-2">
          {images.data?.map((image, index) => {
            if (limit && index > 5) return null;

            if (limit && index === 5)
              return (
                <div
                  className="flex-shrink-0 w-full" // Use 100% of the container for each slide
                  key={index}
                >
                  <div
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.url}`}
                    alt="travel image"
                    className="flex justify-center w-full h-full bg-gray-800 object-cover object-center aspect-square z-10 rounded-md bg-opacity-80"
                  >
                    <p className=" text-white text-xl m-auto">
                      +{images.data.length - 5}
                    </p>
                  </div>
                </div>
              );

            return (
              <div
                className="flex-shrink-0 w-full" // Use 100% of the container for each slide
                key={index}
                onClick={(e) => setActiveImage(image)}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.url}`}
                  alt="travel image"
                  className="w-full h-full object-cover object-center aspect-square z-10 rounded-md"
                />
              </div>
            );
          })}
        </div>
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
      </section>
    </>
  );
};

export default ImageSlider;
