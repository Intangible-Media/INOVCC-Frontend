import Link from "next/link";
import { Alert, Button } from "flowbite-react";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col max-w-md w-full">
        <Alert className="p-0">
          <h2 className="text-2xl font-bold text-red-700">404 - Not Found</h2>
          <p className="mt-2 text-gray-600 text-center">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
        </Alert>
        <div className="mt-6">
          <Link href="/inspections" passHref>
            <Button color="red" className="w-full">
              Return to Inspections
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
