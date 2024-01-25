import React, { useState } from "react";

const ImageSlider = ({ images }) => {
  const [current, setCurrent] = useState(0);

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
    <section className="relative overflow-hidden w-full h-full">
      <button
        onClick={prevSlide}
        className="absolute left-0 z-50 h-10 w-10 cursor-pointer select-none"
      >
        Click
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 z-50 h-10 w-10 cursor-pointer select-none"
      >
        Click
      </button>
      <div
        className="flex transition-transform duration-300 ease-in-out gap-2"
        style={{ transform: `translateX(${slideOffset}%)` }}
      >
        {images.data.map((image, index) => {
          return (
            <div
              className="flex-shrink-0 w-full" // Use 100% of the container for each slide
              key={index}
              style={{ width: "calc(100% / 3)" }} // Each slide takes 1/3 of the width
            >
              <img
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.url}`}
                alt="travel image"
                className="w-full h-full object-cover object-center"
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
  );
};

export default ImageSlider;
