import { useState } from "react";
import Link from "next/link";
import { Progress } from "flowbite-react";

export default function FavoriteInspectionCard({ inspection }) {
  const [selectedStructureType, setSelectedStructureType] = useState(""); // Default value is 'All'

  const handleChange = (event) => {
    // Update state with the selected option's value
    setSelectedStructureType(event.target.value);
  };

  // Function to calculate the progress of inspection
  const getInspectionProgress = () => {
    if (
      !inspection ||
      !inspection.attributes ||
      !inspection.attributes.structures ||
      !inspection.attributes.structures.data
    ) {
      return 0; // Return 0 if the data is not available
    }

    const totalStructures = inspection.attributes.structures.data.length;
    const inspectedStructuresCount =
      inspection.attributes.structures.data.filter(
        (structure) => structure.attributes.status === "Inspected"
      ).length;

    if (totalStructures === 0) {
      return 0; // Avoid division by zero
    }

    const inspectedPercentage =
      (inspectedStructuresCount / totalStructures) * 100;
    return Math.round(inspectedPercentage); // Round to the nearest whole number
  };

  const getInspectionProgressColor = () => {
    const progressPercentage = getInspectionProgress();

    if (progressPercentage < 34) return "red";
    if (progressPercentage > 33 && progressPercentage <= 65) return "yellow";
    return "green";
  };

  const getInspectionProgressClasses = () => {
    const progressPercentage = getInspectionProgress();

    if (progressPercentage < 34) return "bg-red-100 text-red-800";
    if (progressPercentage > 33 && progressPercentage <= 65)
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="inline-block rounded-lg overflow-hidden transition-all duration-200 ease-in-out border border-gray-200">
      <div className="w-80 max-w-xs  bg-white p-6">
        <div className="flex justify-between gap-2">
          <h6 className="font-bold text-base text-dark-blue-700 hover:underline shorten-text capitalize">
            {inspection.attributes.name}
          </h6>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7.28997 21C7.08906 20.9994 6.89068 20.9532 6.70864 20.8645C6.52659 20.7758 6.36524 20.6469 6.23582 20.4866C6.10639 20.3263 6.01199 20.1385 5.95918 19.9363C5.90636 19.7341 5.89641 19.5223 5.93 19.3157L6.70674 14.5922L3.41619 11.2489C3.23191 11.0611 3.10163 10.8233 3.04005 10.5624C2.97847 10.3015 2.98806 10.0278 3.06772 9.77224C3.14738 9.5167 3.29395 9.28947 3.49087 9.11623C3.68779 8.94299 3.92722 8.83063 4.18212 8.79184L8.72823 8.10271L10.7614 3.80361C10.8754 3.56242 11.0518 3.35932 11.2706 3.21729C11.4895 3.07527 11.7421 3 11.9999 3C12.2576 3 12.5103 3.07527 12.7291 3.21729C12.948 3.35932 13.1244 3.56242 13.2383 3.80361L15.2715 8.10083L19.8176 8.78996C20.0726 8.82855 20.312 8.94076 20.509 9.1139C20.706 9.28704 20.8526 9.51421 20.9323 9.76972C21.012 10.0252 21.0215 10.2989 20.9599 10.5598C20.8983 10.8207 20.7679 11.0584 20.5836 11.2461L17.293 14.5922L18.0698 19.3147C18.1133 19.5796 18.085 19.8519 17.9879 20.1009C17.8908 20.3498 17.7289 20.5655 17.5204 20.7235C17.312 20.8814 17.0653 20.9754 16.8083 20.9947C16.5513 21.014 16.2943 20.958 16.0663 20.8329L11.9999 18.6031L7.9335 20.8329C7.7352 20.9423 7.51431 20.9997 7.28997 21ZM5.28197 10.5203L8.12071 13.4083C8.28119 13.5712 8.40121 13.7724 8.47037 13.9945C8.53953 14.2167 8.55575 14.4531 8.51762 14.6833L7.84799 18.7598L11.3582 16.8342C11.5563 16.7264 11.7764 16.6702 11.9999 16.6702C12.2233 16.6702 12.4435 16.7264 12.6416 16.8342L16.1518 18.7589L15.4812 14.6833C15.4434 14.4529 15.46 14.2165 15.5294 13.9943C15.5989 13.7722 15.7192 13.571 15.88 13.4083L18.7178 10.5212L14.7945 9.92693C14.5731 9.89331 14.3629 9.80416 14.1818 9.66712C14.0008 9.53008 13.8543 9.34925 13.755 9.14016L11.9999 5.42786L10.2457 9.1364C10.1465 9.3458 10.0001 9.52696 9.81907 9.66433C9.638 9.8017 9.42768 9.89117 9.20616 9.92506L5.28197 10.5203Z"
              fill="#312E8E"
            />
          </svg>
        </div>
        <div className="my-5">
          <Progress
            progress={getInspectionProgress()}
            color={getInspectionProgressColor()}
          />
        </div>
        <div className="flex items-center justify-between pt-6 mt-6 border-t">
          <span
            className={`${getInspectionProgressClasses()} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
          >
            {getInspectionProgress()}%
          </span>

          <Link
            href={`/inspections/${inspection.id}`}
            className="flex gap-2 items-center"
          >
            <p className="text-sm font-semibold text-gray-600">View Map</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 10 11"
              fill="none"
            >
              <path
                d="M3.89451 8.41665C3.78486 8.41662 3.67769 8.38244 3.58654 8.31842C3.49538 8.2544 3.42434 8.16341 3.38238 8.05697C3.34043 7.95053 3.32945 7.8334 3.35083 7.7204C3.37221 7.6074 3.425 7.5036 3.50252 7.42212L5.32829 5.50356L3.50252 3.585C3.44956 3.53126 3.40732 3.46697 3.37827 3.39589C3.34921 3.3248 3.33391 3.24835 3.33327 3.17099C3.33263 3.09363 3.34666 3.01691 3.37454 2.94531C3.40242 2.87371 3.44359 2.80866 3.49564 2.75396C3.5477 2.69925 3.60961 2.65599 3.67774 2.6267C3.74588 2.5974 3.81889 2.58266 3.89251 2.58333C3.96613 2.58401 4.03888 2.60008 4.10653 2.63061C4.17417 2.66115 4.23535 2.70553 4.28649 2.76118L6.50425 5.09165C6.60819 5.20091 6.66659 5.34907 6.66659 5.50356C6.66659 5.65805 6.60819 5.80621 6.50425 5.91547L4.28649 8.24594C4.18254 8.35521 4.04154 8.41661 3.89451 8.41665Z"
                fill="#4B5563"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
