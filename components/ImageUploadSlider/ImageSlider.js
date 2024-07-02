import { useState } from "react";
import { Checkbox, Button, FileInput, Label } from "flowbite-react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineSaveAlt,
} from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import CameraComponent from "./CameraComponent";
import { useImageUpload } from "./useImageUpload";
import { useImageActions } from "./ImageActions";
import { useSession } from "next-auth/react";
import { ensureDomain, getUrls } from "../../utils/strings";

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
