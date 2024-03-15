import React, { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import { deleteFile } from "../utils/api/media";
import { useSession } from "next-auth/react";

const ImageSlider = ({ images: propImages, limit = true }) => {
  const { data: session } = useSession();
  const [activeImage, setActiveImage] = useState(null);
  // Simulating a local state for images to manage UI updates upon deletion
  const [images, setImages] = useState(propImages);

  // Effect to sync local images state with propImages
  useEffect(() => {
    setImages(propImages);
  }, [propImages]);

  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");

    try {
      await deleteFile({ id, jwt: session.accessToken });
      // Remove the deleted image from local state to update UI
      const updatedImages = images.data.filter((image) => image.id !== id);
      setImages({ ...images, data: updatedImages });
      setActiveImage(null); // Optionally reset activeImage
      console.log("Deleted");
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
          >
            Add Asset
          </a>
        </div>
      </section>
    </>
  );
};

export default ImageSlider;
