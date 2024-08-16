// app/error.js

"use client"; // This is necessary because this file is a client component

import { useEffect } from "react";
import { Alert, Button } from "flowbite-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="max-w-md w-full mx-auto">
        <Alert color="failure" withBorderAccent={true} className="mb-6">
          <h3 className="text-lg font-medium">Oops! Something went wrong.</h3>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        </Alert>
        <Button
          onClick={() => reset()}
          color="red"
          size="lg"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
