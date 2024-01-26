import React, { useState } from "react";

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const [activeImage, setActiveImage] = useState(null);

  if (
    !Array.isArray(images.data) ||
    images.data.length <= 0 ||
    images === null
  ) {
    return null;
  }

  const length = images.data.length;

  const nextSlide = () => {
    setCurrent((current) => (current === length - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrent((current) => (current === 0 ? length - 1 : current - 1));
  };

  // Calculate the offset for sliding effect
  const slideOffset = current * -(100 / 3); // Each slide is 100/3% of the width

  return (
    <>
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
            <a href="#">Remove</a>
          </div>
        </div>
      )}
      <section className="relative w-full h-full">
        <button
          onClick={prevSlide}
          className="absolute -left-4 top-10 z-20 cursor-pointer select-none bg-white rounded-full p-3 shadow rotate-180"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M7.7895 15.8334C7.57022 15.8334 7.35587 15.765 7.17356 15.637C6.99125 15.5089 6.84916 15.3269 6.76525 15.1141C6.68134 14.9012 6.65938 14.6669 6.70215 14.4409C6.74492 14.2149 6.85049 14.0073 7.00552 13.8444L10.6571 10.0072L7.00552 6.17012C6.89961 6.06263 6.81513 5.93406 6.75702 5.79189C6.6989 5.64973 6.66831 5.49683 6.66703 5.34211C6.66575 5.18739 6.69381 5.03395 6.74957 4.89075C6.80532 4.74755 6.88766 4.61744 6.99178 4.50804C7.09589 4.39863 7.2197 4.31211 7.35598 4.25352C7.49225 4.19493 7.63827 4.16545 7.78551 4.16679C7.93274 4.16814 8.07825 4.20028 8.21354 4.26135C8.34883 4.32242 8.47119 4.41119 8.57348 4.52248L13.009 9.18342C13.2169 9.40193 13.3337 9.69826 13.3337 10.0072C13.3337 10.3162 13.2169 10.6125 13.009 10.8311L8.57348 15.492C8.36557 15.7105 8.08357 15.8333 7.7895 15.8334Z"
              fill="#1F2A37"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute -right-4 top-10 z-20 cursor-pointer select-none bg-white rounded-full p-3 shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M7.7895 15.8334C7.57022 15.8334 7.35587 15.765 7.17356 15.637C6.99125 15.5089 6.84916 15.3269 6.76525 15.1141C6.68134 14.9012 6.65938 14.6669 6.70215 14.4409C6.74492 14.2149 6.85049 14.0073 7.00552 13.8444L10.6571 10.0072L7.00552 6.17012C6.89961 6.06263 6.81513 5.93406 6.75702 5.79189C6.6989 5.64973 6.66831 5.49683 6.66703 5.34211C6.66575 5.18739 6.69381 5.03395 6.74957 4.89075C6.80532 4.74755 6.88766 4.61744 6.99178 4.50804C7.09589 4.39863 7.2197 4.31211 7.35598 4.25352C7.49225 4.19493 7.63827 4.16545 7.78551 4.16679C7.93274 4.16814 8.07825 4.20028 8.21354 4.26135C8.34883 4.32242 8.47119 4.41119 8.57348 4.52248L13.009 9.18342C13.2169 9.40193 13.3337 9.69826 13.3337 10.0072C13.3337 10.3162 13.2169 10.6125 13.009 10.8311L8.57348 15.492C8.36557 15.7105 8.08357 15.8333 7.7895 15.8334Z"
              fill="#1F2A37"
            />
          </svg>
        </button>
        <div
          className="flex transition-transform overflow-hidden duration-300 ease-in-out gap-2"
          style={{ transform: `translateX(${slideOffset}%)` }}
        >
          {images.data.map((image, index) => {
            return (
              <div
                className="flex-shrink-0 w-full" // Use 100% of the container for each slide
                key={index}
                style={{ width: "calc(100% / 3)" }} // Each slide takes 1/3 of the width
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
