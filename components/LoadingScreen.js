// components/LoadingScreen.js
import React from "react";
import { useLoading } from "../context/LoadingContext";
import { Spinner } from "flowbite-react";
import { CiCircleCheck } from "react-icons/ci";
import { ImSpinner8 } from "react-icons/im";

const LoadingScreen = () => {
  const { loading, message, success, successMessage } = useLoading();

  if (!loading && !success) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
      <div className="flex flex-col gap-4 text-center">
        {loading && (
          <div className="flex flex-col gap-6 animate-bounce-in justify-center text-center">
            <ImSpinner8
              size={100}
              color="white"
              className="animate-spin-infinite mx-auto"
            />
            <p className="text-white text-2xl leading-none font-light">
              {message}
            </p>
          </div>
        )}
        {success && (
          <div className="flex flex-col gap-6 animate-bounce-in justify-center text-center">
            <CiCircleCheck
              size={100}
              color="white"
              className="animate-spin mx-auto"
            />
            <p className="text-white text-2xl leading-none font-light animate-fade-in">
              {successMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
