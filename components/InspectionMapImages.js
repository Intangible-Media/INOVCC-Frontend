"use client";

import qs from "qs";
import { Badge } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getInspection } from "../utils/api/inspections";
import ImageCardSliderAlt from "./ImageCardSliderAlt";
import DownloadFilesAsSubFolderZipButton from "./DownloadFilesAsSubFolderZipButton";

// Function to extract images from structures
function extractImagesFromStructures(data) {
  const allImages = [];

  if (data && data.structures && Array.isArray(data.structures.data)) {
    data.structures.data.forEach((structure) => {
      if (
        structure.attributes &&
        structure.attributes.images &&
        Array.isArray(structure.attributes.images.data)
      ) {
        structure.attributes.images.data.forEach((image) => {
          allImages.push(image);
        });
      }
    });
  }

  return allImages;
}

export default function InspectionMapImages({ inspectionId, inspectionName }) {
  const { data: session } = useSession();
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!session) return;

    const imagesQuery = qs.stringify(
      {
        filters: {
          id: {
            $eq: inspectionId,
          },
        },
        fields: ["name"],
        populate: {
          structures: {
            fields: ["mapSection"], // Exclude unnecessary structure fields
            populate: {
              images: {
                populate: "*",
              },
            },
          },
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    const fetchData = async () => {
      const fetchedInspection = await getInspection({
        jwt: session.accessToken,
        id: inspectionId,
        query: imagesQuery,
      });

      console.log("fetchedInspection", fetchedInspection);

      try {
        const allImages = extractImagesFromStructures(
          fetchedInspection.data.data.attributes
        );

        console.log(allImages);
        setImages(allImages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [session]);

  return (
    <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
      <div className="flex justify-between">
        <div className="flex flex-col gap-0.5">
          <h6 className="text-lg font-semibold">
            All Structure Documents{" "}
            <Badge color="gray" className="rounded-full inline-block">
              {images.length}
            </Badge>
          </h6>

          <p className="text-base text-gray-500">{inspectionName || ""}</p>
        </div>
      </div>
      <div className="overflow-auto">
        <ImageCardSliderAlt
          images={{ data: images }}
          limit={false}
          editable={false}
        />
      </div>
      <div className="flex justify-between pt-5 border-t mt-auto">
        {/* <DownloadFilesAsSubFolderZipButton structures={structures} /> */}
      </div>
    </div>
  );
}
