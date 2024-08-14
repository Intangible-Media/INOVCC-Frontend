"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import ImageCardSliderAlt from "../../../components/ImageCardSliderAlt";
import { Button, Badge } from "flowbite-react";
import qs from "qs";
import MapPanelalt from "../../../components/Panel/MapPanelalt";
import InspectionDrawer from "../../../components/Drawers/InspectionDrawer";
import { getAllStructure } from "../../../utils/api/structures";
import ImageCardGrid from "../../../components/ImageCardGrid";
import ActivityLog from "../../../components/ActivityLog";
import ProtectedContent from "../../../components/ProtectedContent";
import StructureSearchList from "../../../components/StructuresSearchList";
import DownloadFilesAsSubFolderZipButton from "../../../components/DownloadFilesAsSubFolderZipButton";
import DownloadFilesAsZipButton from "../../../components/DownloadFilesAsZipButton";
import { FaRegStar } from "react-icons/fa";
import { useSelectedStructure } from "../../../context/SelectedStructureContext";
import AvatarImage from "../../../components/AvatarImage";
import StructureStatusCircleChart from "../../../components/Charts/StructureStatusCircleChart";
import { PlusIcon } from "../../../public/icons/intangible-icons";
import { ensureDomain } from "../../../utils/strings";
import { useInspection } from "../../../context/InspectionContext";
const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: false, // or ssr: false, depending on your needs
  loading: () => <Loading />, // Provide the loading component here
});

const Loading = () => (
  <div className="flex justify-center items-center h-full">
    <div className="loader">Loading Map...</div>
  </div>
);

export default async function Page({ params }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { inspection, setInspection } = useInspection();
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();
  const [structures, setStructures] = useState([]);

  const inspectionQuery = qs.stringify(
    {
      populate: {
        client: {
          populate: {
            contacts: {
              populate: {
                picture: "*", // Populate the 'picture' relation
              },
              fields: [
                // Specify fields you want from 'contacts'
                "firstName",
                "lastName",
                "email",
                "phone",
                "jobTitle",
                "picture", // Include 'picture' in the fields if you want its ID
              ],
            },
          },
        },
        documents: {
          populate: "*",
        },
      },
    },
    {
      encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
    }
  );

  const structuresQuery = qs.stringify(
    {
      filters: {
        inspection: {
          id: {
            $eq: params.id,
          },
        },
      },
      populate: {
        inspectors: {
          populate: "*",
        },
        images: {
          populate: "*",
        },
      },
    },
    {
      encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
    }
  );

  // const structures = await getAllStructure({
  //   jwt: session.accessToken,
  //   query: structuresQuery,
  // });

  const getAllStructureTypes = () => {
    const types = structures.map((structure) => structure.attributes.type);
    const uniqueTypes = [...new Set(types)]; // Removes duplicates
    return uniqueTypes;
  };

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        // Ensure getInspection is imported or defined in your component/module

        const structuresResponse = await getAllStructure({
          jwt: session.accessToken,
          query: structuresQuery,
        });

        console.log("structuresResponse", structuresResponse);
        console.log("structuresResponse Length", structuresResponse.length);

        structuresResponse.forEach((structure) => console.log(structure.id));

        setStructures(structuresResponse);
      } catch (error) {
        console.error("Error fetching data", error.response || error);
      }
    };

    fetchData();
  }, [session]);

  /**
   * Returns a list of unique inspectors based on their email.
   *
   * @param {Array} structures - The list of structures to extract inspectors from.
   * @returns {Array} The list of unique inspectors.
   */
  const getUniqueInspectors = (structures) => {
    if (!Array.isArray(structures)) {
      console.error("Expected an array of structures");
      return [];
    }

    const seenEmails = new Set();

    return structures.reduce((uniqueInspectors, structure) => {
      if (!structure?.attributes?.inspectors?.data) {
        // Optionally log a warning or handle this case as needed
        return uniqueInspectors;
      }

      const newInspectors = structure?.attributes?.inspectors?.data?.filter(
        (inspector) => {
          const email = inspector?.attributes?.email;
          if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            return true;
          }
          return false;
        }
      );

      return [...uniqueInspectors, ...newInspectors];
    }, []);
  };

  /**
   * Retrieves unique inspectors from the provided structures and
   * concatenates their emails into a single string, separated by commas.
   *
   * @param {Array} structures - The list of structures to extract inspectors from.
   * @returns {string} The concatenated string of unique inspector emails.
   */
  const uniqueInspectors = getUniqueInspectors(structures);
  const inspectorsEmails = uniqueInspectors
    .map((inspector) => inspector.attributes.email)
    .join(", ");

  const allStructuresImages =
    structures
      .map((structure) => structure.attributes.images?.data)
      .flat()
      .filter(Boolean) || [];

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between pt-6 pb-6 md:pb-1">
        <div className="flex flex-col gap-0.5 md:gap-2 mb-4">
          {/* <Camera /> */}
          <h5 className="leading-tight text-sm text-gray-500 font-medium">
            Project ID:{" "}
            {inspection?.projectId ? inspection.projectId : "Project ID"}
          </h5>
          <h1 className="leading-tight text-2xl font-medium">
            {inspection?.name ? inspection.name : "Map Name Here"}
          </h1>
          <div className="flex gap-3 text-base text-gray-500">
            {getAllStructureTypes().map((type, index) => (
              <div key={index} className="flex gap-2">
                <p className=" my-auto text-sm">{type}</p>
                <Badge className="rounded-full bg-gray-300 inline-block mt-1 text-xxs font-semibold">
                  {
                    structures.filter(
                      (structure) => structure.attributes.type === type
                    ).length
                  }
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 align-middle">
          <ProtectedContent requiredRoles={["Admin"]}>
            <InspectionDrawer
              inspection={inspection}
              structures={structures}
              setInspection={setInspection}
              btnText={"Edit Map"}
              showIcon={true}
            />
          </ProtectedContent>
          <Button className="bg-dark-blue-700 text-white shrink-0 self-start flex gap-3">
            <p className="mr-4">Add to Favorites</p>{" "}
            <FaRegStar size={17} color="white" />
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-9 p-0 bg-white border border-white rounded-md gap-0 mx-h-[800px] md:h-[550px] shadow-md shadow-gray-200 mb-4">
        <div className="map-structure-panel flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white w-full rounded-lg overflow-auto relative col-span-3">
          <StructureSearchList
            structures={structures}
            selectedStructure={selectedStructure}
            setSelectedStructure={setSelectedStructure}
          />

          {selectedStructure && (
            <MapPanelalt
              key={selectedStructure.id}
              structureId={selectedStructure.id}
              setSelectedStructure={setSelectedStructure}
            />
          )}
        </div>
        <div className="relative border-white border-2 dark:border-gray-600 bg-gray-200 rounded-lg h-[275px] md:h-full col-span-6">
          <MapboxMap coordinates={structures} />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4 mb-4">
        <StructureStatusCircleChart structures={structures} />

        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <div className="flex flex-col gap-0.5">
            <h6 className="text-lg font-semibold">
              Map Documents{" "}
              <Badge color="gray" className="rounded-full inline-block">
                {inspection?.documents.data?.length || 0}
              </Badge>
            </h6>
            <p className="text-base text-gray-500">{inspection?.name || ""}</p>
          </div>
          <div className="overflow-auto">
            {inspection && (
              <ImageCardGrid
                files={inspection?.documents.data}
                background={"bg-white"}
                editMode={false}
                columns={2}
                padded={false}
              />
            )}
          </div>
          <div className="flex justify-between pt-5 border-t mt-auto">
            <DownloadFilesAsZipButton images={inspection?.documents.data} />
          </div>
        </div>

        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <div className="flex justify-between">
            <div className="flex flex-col gap-0.5">
              <h6 className="text-lg font-semibold">
                All Structure Documents{" "}
                <Badge color="gray" className="rounded-full inline-block">
                  {allStructuresImages.length}
                </Badge>
              </h6>

              <p className="text-base text-gray-500">
                {inspection?.name || ""}
              </p>
            </div>
          </div>
          <div className="overflow-auto">
            {/* <ImageCardGrid
              files={allStructuresImages}
              background={"bg-white"}
              editMode={false}
              columns={2}
              padded={false}
            /> */}

            <ImageCardSliderAlt
              images={{ data: allStructuresImages }}
              limit={false}
              editable={false}
            />
          </div>
          <div className="flex justify-between pt-5 border-t mt-auto">
            <DownloadFilesAsSubFolderZipButton structures={structures} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">Inspectors</h6>

          <div className="flex flex-col overflow-auto">
            {uniqueInspectors.map((inspector, index) => (
              <div
                key={`${inspector.id}-${index}`}
                className="alternate-bg flex gap-4 align-middle border-t py-1"
              >
                <AvatarImage
                  customImage={
                    inspector.attributes?.picture?.data?.attributes.formats
                      .thumbnail.url
                  }
                  customName={
                    inspector.firstName || inspector.attributes?.firstName
                  }
                />
                <div className="flex flex-col gap-1 align-middle justify-center">
                  <p className="leading-none text-sm font-medium">
                    {`${inspector.attributes.firstName} ${inspector.attributes.lastName}`}
                  </p>
                  <p className="leading-none text-xs">
                    <a
                      href={`mailto:${inspector.attributes.email}`}
                      target="_blank"
                    >
                      {inspector.attributes.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-5 border-t mt-auto">
            {/* <button className="text-sm text-gray-500 font-medium">Edit</button> */}
            <a
              target="_blank"
              href={`mailto:${inspectorsEmails}?subject=Inspection | ${inspection?.name}&body=${process.env.NEXT_PUBLIC_STRAPI_URL}${pathname}, this is a message from the site!`}
              className="flex align-middle text-sm font-semibold"
            >
              Email Team <PlusIcon />
            </a>
          </div>
        </div>

        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">
            {inspection?.client.data.attributes.name}
          </h6>

          <div className="h-full">
            {inspection?.client.data.attributes.contacts?.data.map(
              (clientContact, index) => (
                <div
                  key={index}
                  className="alternate-bg flex gap-4 align-middle py-2"
                >
                  {clientContact.attributes.picture.data && (
                    <img
                      className="border-2 border-white rounded-full dark:border-gray-800 h-12 w-12 object-cover" // Use className for styles except width and height
                      src={`${ensureDomain(
                        clientContact.attributes.picture.data.attributes.formats
                          .thumbnail.url
                      )}`}
                      alt="fdsfdsfds"
                    />
                  )}
                  <div className="flex flex-col gap-1 align-middle justify-center">
                    <p className="leading-none text-sm font-medium">
                      {`${clientContact.attributes.firstName} ${clientContact.attributes.lastName}`}
                    </p>
                    <p className="leading-none text-xs mb-3">
                      {clientContact.attributes.jobTitle}
                    </p>
                    <p className="leading-none text-xs">
                      <a href={`mailto:${clientContact.attributes.email}`}>
                        E: {clientContact.attributes.email}
                      </a>
                    </p>
                    <p className="leading-none text-xs">
                      <a href={`tel:${clientContact.attributes.phone}`}>
                        P: +{clientContact.attributes.phone}
                      </a>
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex justify-end pt-5 border-t mt-auto">
            {/* <button className="text-sm text-gray-500 font-medium">Edit</button> */}
            <button className="flex align-middle text-sm font-semibold">
              Email Client <PlusIcon />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
        {inspection && (
          <ActivityLog id={inspection?.id} collection="inspections" />
        )}
      </section>
    </>
  );
}
