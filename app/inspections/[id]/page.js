// import React, { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import ImageCardSliderAlt from "../../../components/ImageCardSliderAlt";
import { Button, Badge } from "flowbite-react";
import { getServerSession } from "next-auth";
import qs from "qs";
import { authOptions } from "../../../app/api/auth/[...nextauth]/auth";
import MapPanelContainer from "../../../components/MapPanelContainer";
import InspectionDrawer from "../../../components/Drawers/InspectionDrawer";
import { fetchAllStructures } from "../../../utils/api/structures";
import { fetchInspection } from "../../../utils/api/inspections";
import ImageCardGrid from "../../../components/ImageCardGrid";
import ActivityLog from "../../../components/ActivityLog";
//import InspectionMapImages from "../../../components/InspectionMapImages";
import ProtectedContent from "../../../components/ProtectedContent";
import StructureSearchList from "../../../components/StructuresSearchList";
import DownloadFilesAsSubFolderZipButton from "../../../components/DownloadFilesAsSubFolderZipButton";
import DownloadFilesAsZipButton from "../../../components/DownloadFilesAsZipButton";
import { FaRegStar } from "react-icons/fa";
import AvatarImage from "../../../components/AvatarImage";
import StructureStatusCircleChart from "../../../components/Charts/StructureStatusCircleChart";
import { PlusIcon } from "../../../public/icons/intangible-icons";
import { ensureDomain } from "../../../utils/strings";
//import { useInspection } from "../../../context/InspectionContext";
const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: true, // or ssr: false, depending on your needs
  loading: () => <Loading />, // Provide the loading component here
});

const InspectionMapImages = dynamic(
  () => import("../../../components/InspectionMapImages"),
  {
    ssr: false, // or ssr: false, depending on your needs
    loading: () => <LoadingInspectionMapImages />, // Provide the loading component here
  }
);

const Loading = () => (
  <div className="flex justify-center items-center h-full">
    <div className="loader">Loading Map...</div>
  </div>
);

const LoadingInspectionMapImages = () => (
  <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg animate-pulse">
    <h6 className="text-lg font-semibold">All Structure Documents</h6>

    <div className="grid grid-cols-3 gap-2">
      {[0, 0, 0, 0, 0, 0, 0, 0, 0].map((image, key) => (
        <div
          key={`image-${key}`}
          className="relative w-full h-full aspect-square z-10 rounded-md bg-slate-200"
        ></div>
      ))}
    </div>
  </div>
);

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) return <p>You must be logged in to view this page.</p>;

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
    },
    {
      encodeValuesOnly: true, // This option is necessary to prevent qs from encoding the comma in the fields array
    }
  );

  const inspection = await fetchInspection({
    jwt: session.accessToken,
    id: params.id,
    query: inspectionQuery,
  });

  const structures = await fetchAllStructures({
    jwt: session.accessToken,
    query: structuresQuery,
  });

  const inspectionData = inspection.data;
  const inspectionClient = inspectionData.attributes.client;
  const inspectionDocuments = inspectionData.attributes.documents;
  const inspectionName = inspectionData.attributes.name;
  const projectId = inspectionData.attributes.projectId;

  const getAllStructureTypes = () => {
    const types = structures.map((structure) => structure.attributes.type);
    const uniqueTypes = [...new Set(types)]; // Removes duplicates
    return uniqueTypes;
  };

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between pt-6 pb-6 md:pb-1">
        <div className="flex flex-col gap-0.5 md:gap-2 mb-4">
          {/* <Camera /> */}
          <h5 className="leading-tight text-sm text-gray-500 font-medium">
            {projectId}
          </h5>
          <h1 className="leading-tight text-2xl font-medium">
            {inspectionName}
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

        <div className="flex gap-3 align-middle my-auto">
          <ProtectedContent requiredRoles={["Admin"]}>
            {inspection && (
              <InspectionDrawer
                inspection={inspectionData}
                structures={structures}
                btnText={"Edit Map"}
                showIcon={true}
              />
            )}
          </ProtectedContent>
          <Button className="bg-dark-blue-700 text-white shrink-0 self-start flex gap-3">
            <p className="mr-4">Add to Favorites</p>{" "}
            <FaRegStar size={17} color="white" />
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-9 p-0 bg-white border border-white rounded-md gap-0 max-h-[800px] md:h-[550px] shadow-md shadow-gray-200 mb-4">
        <div className=" flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white w-full rounded-lg overflow-auto relative col-span-3 max-h-[525px] order-2 md:order-1">
          <StructureSearchList structures={structures} />

          <MapPanelContainer />
        </div>
        <div className="relative border-white border-2 dark:border-gray-600 bg-gray-200 rounded-lg h-[275px] md:h-full col-span-6 order-1 md:order-2">
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
                {inspection?.data.attributes.documents.data?.length || 0}
              </Badge>
            </h6>
            <p className="text-base text-gray-500">
              {inspection?.data.name || ""}
            </p>
          </div>
          <div className="overflow-auto">
            <ImageCardSliderAlt
              images={{ data: inspectionDocuments.data }}
              limit={false}
              editable={false}
            />
          </div>
          <div className="flex justify-between pt-5 border-t mt-auto">
            <DownloadFilesAsZipButton
              images={inspection?.data.attributes.documents.data}
            />
          </div>
        </div>

        {inspection && (
          <InspectionMapImages
            inspectionId={inspection.data.id}
            inspectionName={inspectionName}
          />
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">Activity Log</h6>

          {inspection && (
            <ActivityLog
              id={inspection?.data.id}
              collection="inspections"
              defaultExpanded={true}
            />
          )}
        </div>

        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <h6 className="text-lg font-semibold">
            {inspectionClient.data.attributes.name}
          </h6>

          <div className="h-full">
            {inspection?.data.attributes.client.data.attributes.contacts?.data.map(
              (clientContact, index) => (
                <div
                  key={index}
                  className="alternate-bg flex gap-4 align-middle py-2"
                >
                  <AvatarImage
                    customImage={
                      clientContact.attributes.picture.data?.attributes.url
                    }
                    customName={clientContact.attributes.firstName}
                  />
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
    </>
  );
}
