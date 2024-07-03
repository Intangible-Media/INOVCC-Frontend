// components/LoadingScreen.js
import React from "react";
import { useLoading } from "../context/LoadingContext";
import { Spinner } from "flowbite-react";
import { CiCircleCheck } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdErrorOutline } from "react-icons/md"; // Import an error icon

const LoadingScreen = () => {
  const { loading, message, success, successMessage, error, errorMessage } =
    useLoading();

  if (!loading && !success && !error) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 ${
        error && "bg-red-50"
      } bg-opacity-80`}
    >
      <div className="flex flex-col gap-4 text-center">
        {loading && (
          <div className="flex flex-col gap-3 lg:gap-6 animate-bounce-in justify-center text-center">
            <AiOutlineLoading3Quarters
              color="white"
              className="animate-spin-infinite mx-auto w-10 h-10 lg:w-20 lg:h-20"
            />
            <p className="text-white text-lg lg:text-2xl leading-none font-light">
              {message}
            </p>
          </div>
        )}
        {success && (
          <div className="flex flex-col gap-3 lg:gap-6 animate-bounce-in justify-center text-center">
            <CiCircleCheck
              color="white"
              className="mx-auto w-10 h-10 lg:w-20 lg:h-20"
            />
            <p className="text-white text-lg lg:text-2xl leading-none font-light animate-fade-in">
              {successMessage}
            </p>
          </div>
        )}
        {error && (
          <div className="flex flex-col gap-3 lg:gap-6 animate-bounce-in justify-center text-center">
            <MdErrorOutline
              color="red"
              className="mx-auto w-10 h-10 lg:w-20 lg:h-20"
            />
            <p className="text-red-500 text-lg lg:text-2xl leading-none font-light animate-fade-in">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
