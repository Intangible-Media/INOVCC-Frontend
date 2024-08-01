"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import qs from "qs";
import DirectionsComponent from "../../../components/DirectionsComponent";
import AvatarImage from "../../../components/AvatarImage";
import { CheckMark } from "../../../public/icons/intangible-icons";
import { getAllStructure } from "../../../utils/api/structures";
import { Button, Datepicker } from "flowbite-react";
import { getTeam } from "../../../utils/api/teams";
import { useRouter } from "next/navigation";
import { HiArrowNarrowRight, HiCalendar } from "react-icons/hi";
import Timeline from "../../../components/Timeline";
import { useLoading } from "../../../context/LoadingContext";
import MapPanelalt from "../../../components/Panel/MapPanelalt";

import {
  downloadFilesAsZip,
  downloadFilesAsZipWithSubfolders,
  convertInspectionsToZipArgs,
  sortStructuresByStatus,
  isImage,
  ensureDomain,
} from "../../../utils/strings";
import { DownloadOutlineIcon } from "../../../public/icons/intangible-icons";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: false,
});

export default function Page({ params }) {
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const { data: session } = useSession();
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [structures, setStructures] = useState([]);
  const [groupedStructures, setGroupedStructures] = useState([]);
  const [zoom, setZoom] = useState(20);
  const [myTasks, setMyTasks] = useState([]);
  const [activeCoordinate, setActiveCoordinate] = useState([78.0421, 27.1751]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [team, setTeam] = useState(null);
  const [date, setDate] = useState(
    new Date(convertToLongDateFormat(new Date()))
  );

  const coordinates = structures.map((structure) => [
    structure.attributes.longitude,
    structure.attributes.latitude,
  ]);

  const iconMap = {
    red: "/location-red.png",
    yellow: "/location-yellow.png",
    drkgreen: "/location-dark.png",
    green: "/location-green.png",
  };

  const notInspectedStructuresCount = structures.filter(
    (structure) => structure.attributes.status === "Not Inspected"
  ).length;

  const inspectedStructuresCount = structures.filter(
    (structure) => structure.attributes.status === "Inspected"
  ).length;

  const cannotInspectStructuresCount = structures.filter(
    (structure) => structure.attributes.status === "Uninspectable"
  ).length;

  const inspectedStructures = structures.filter((structure) => {
    const statuses = ["Inspected", "Uploaded", "Uninspectable"];
    return statuses.includes(structure.attributes.status);
  });

  const loadIcon = (color) => iconMap[color] || "/location-red.png";

  const unSelectStructure = () => {
    setSelectedStructure(null);
  };

  const getColorBasedOnStatus = (status) => {
    switch (status.toLowerCase()) {
      case "uploaded":
        return "drkgreen";
      case "inspected":
        return "green";
      case "not inspected":
        return "yellow";
      default:
        return "red";
    }
  };

  const getInspectionColor = (status) => {
    switch (status.toLowerCase()) {
      case "uploaded":
        return "text-white bg-green-800";
      case "inspected":
        return "text-green-800 bg-green-100";
      case "not inspected":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-red-800 bg-red-100";
    }
  };

  function convertToLongDateFormat(dateString) {
    // Create a Date object from the input date string
    const dateObject = new Date(dateString);

    // Format the date object to "Month Day, Year" format
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      dateObject
    );

    return formattedDate;
  }

  const downloadStructureFromSchedule = async () => {
    // showLoading(
    //   `Downloading all documents for ${structures.length} structures`
    // );
    console.log("structures");
    console.log(structures);
    const formattedStructures = convertInspectionsToZipArgs(structures);

    try {
      const response = await downloadFilesAsZipWithSubfolders(
        formattedStructures
      );
    } catch (error) {
      console.error(error);
    }
  };

  const formattedDate = convertToLongDateFormat(date);

  const downloadForUpload = () => {
    console.log("you are inside the function");
    const zipArgs = convertInspectionsToZipArgs(structures);
    downloadFilesAsZipWithSubfolders(zipArgs, `${new Date()}-inspections.zip`);
  };

  useEffect(() => {
    if (!session) return;

    const structureQuery = qs.stringify(
      {
        filters: {
          $and: [
            {
              team: {
                id: {
                  $eq: params.id,
                },
              },
            },
            {
              scheduleStart: {
                $lte: date, // scheduleStart should be on or before today
              },
            },
            {
              scheduleEnd: {
                $gte: date, // scheduleEnd should be on or after today
              },
            },
          ],
        },
        populate: {
          team: {
            fields: ["name"],
          },
          inspection: {
            fields: ["name"],
          },
          images: {
            populate: "*",
          },
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    const fetchStructure = async () => {
      // console.log("session", session);
      const response = await getAllStructure({
        jwt: session?.accessToken,
        query: structureQuery,
      });

      setStructures(response.data.data);

      const groupedByInspectionId = response.data.data.reduce(
        (acc, structure) => {
          const inspectionId = structure.attributes.inspection.data.id;
          const mapName = structure.attributes.inspection.data.attributes.name;
          if (!acc[inspectionId]) {
            acc[inspectionId] = { mapName, structures: [] };
          }
          acc[inspectionId].structures.push(structure);
          return acc;
        },
        {}
      );

      const groupedArray = Object.keys(groupedByInspectionId).map((key) => ({
        inspectionId: key,
        mapName: groupedByInspectionId[key].mapName,
        structures: sortStructuresByStatus(
          groupedByInspectionId[key].structures
        ),
      }));

      setGroupedStructures(groupedArray);

      if (response.data.data.length > 0) {
        setActiveCoordinate([
          response.data.data[0].attributes.longitude,
          response.data.data[0].attributes.latitude,
        ]);
      }
    };

    const fetchTeam = async () => {
      const apiParams = {
        jwt: session.accessToken,
        id: params.id,
        query: "",
      };
      const response = await getTeam(apiParams);
      setTeam(response.data.data);
    };

    fetchTeam();
    fetchStructure();
  }, [session, date]);

  const TeamCard = () => (
    <div className="flex w-full justify-between bg-white p-6 rounded-md align-middle shadow">
      <div className="flex gap-4">
        <AvatarImage />
        <div className="flex flex-col align-middle justify-center gap-2">
          <p className="leading-none text-sm font-medium text-gray-900">
            {params.id}
          </p>
        </div>
      </div>
    </div>
  );

  const MapStructuresTabs = ({ groupedStructures }) => {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const router = useRouter();

    const toggleGroup = (index) => {
      setExpandedGroup(expandedGroup === index ? null : index);
    };

    return (
      <div className="flex flex-col gap-2 overflow-scroll">
        {groupedStructures.map((structureGroup, index) => (
          <div className="flex flex-col gap-2" key={`structure-group-${index}`}>
            <div
              className="border border-gray-300 p-3 rounded-md sticky"
              onClick={() => toggleGroup(index)}
            >
              <h3 className="text-base text-gray-700 font-medium cursor-pointer">
                {structureGroup.mapName}
              </h3>
            </div>
            {expandedGroup === index && (
              <div className="im-snapping overflow-scroll w-full h-full mb-4">
                {structureGroup.structures.map((structure) => (
                  <div
                    key={`${structure.id}-${index}`}
                    className="flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 w-full"
                    onClick={() => {
                      setSelectedStructure(structure);
                    }}
                  >
                    <div className="flex">
                      <img
                        src={loadIcon(
                          getColorBasedOnStatus(structure.attributes.status)
                        )}
                        style={{ height: 27 }}
                      />
                      <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal">
                        <h5 className="flex flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                          {structure.attributes.mapSection}
                          <span className="flex items-center font-light ml-1">
                            {` / ${structure.attributes.type}`}
                          </span>
                        </h5>
                        <DirectionsComponent />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <p className="flex text-sm text-gray-700 dark:text-gray-400">
                        <span
                          className={`${getInspectionColor(
                            structure.attributes.status
                          )} flex align-middle text-xs font-medium me-2 px-2.5 py-0.5 gap-2 rounded-full`}
                        >
                          {structure.attributes.status}
                          {structure.attributes.status === "Uploaded" && (
                            <CheckMark />
                          )}
                        </span>
                      </p>

                      {/* <EditIcon /> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <div className="flex justify-between">
        <h1 className="leading-tight text-2xl font-medium">
          {team?.attributes.name || "Team Name"}
        </h1>
        <div className="relative flex gap-4 w-[400px]">
          <Datepicker
            title="Flowbite Datepicker"
            className="w-full bg-white"
            onSelectedDateChanged={(date) => setDate(date)}
          />
          <Button
            className="bg-dark-blue-700 text-white"
            onClick={async (e) => {
              showLoading(
                `Downloading all documents for ${structures.length} structures`
              );
              const formattedStructures =
                convertInspectionsToZipArgs(structures);

              try {
                const response = await downloadFilesAsZipWithSubfolders(
                  formattedStructures
                );

                showSuccess("Download finished successfully!");
              } catch (error) {
                console.error(error);
                hideLoading();
              }
            }}
          >
            <DownloadOutlineIcon />
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-5 p-0 bg-white rounded-md gap-0 mx-h-[800px] md:h-[650px] shadow-sm overflow-scroll ">
        {selectedStructure ? (
          <div className=" col-span-2 h-full overflow-scroll">
            <MapPanelalt
              structureId={selectedStructure.id}
              setSelectedStructure={setSelectedStructure}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-between p-3 md:p-6 gap-3 col-span-2 h-[650px]">
            <div className="flex-col bg-white p-0 rounded-lg gap-3 hidden">
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="flex bg-yellow-50 gap-4 rounded-lg p-4">
                  <div className="bg-yellow-100 p-2.5 rounded-full">
                    <p className="text-xl text-yellow-800">
                      {notInspectedStructuresCount}
                    </p>
                  </div>
                  <p className="self-center text-sm text-left text-yellow-800 font-semibold mt-2">
                    Not Inspected
                  </p>
                </div>
                <div className="flex bg-red-50 gap-4 rounded-lg p-4">
                  <div className="bg-red-100 p-2.5 rounded-full">
                    <p className="text-xl text-red-800">
                      {cannotInspectStructuresCount}
                    </p>
                  </div>
                  <p className="self-center text-sm text-center text-red-800 font-semibold mt-2">
                    Uninspectable
                  </p>
                </div>
                <div className="flex bg-green-50 gap-4 rounded-lg p-4">
                  <div className="bg-green-100 p-2.5 rounded-full">
                    <p className="text-xl text-green-600">
                      {inspectedStructuresCount}
                    </p>
                  </div>
                  <p className="self-center text-sm text-center text-green-600 font-semibold mt-2">
                    Inspected
                  </p>
                </div>
              </div>
            </div>

            <MapStructuresTabs groupedStructures={groupedStructures} />
          </div>
        )}

        <div className="relative border-white border-2 dark:border-gray-600 bg-white rounded-lg h-[350px] md:h-full col-span-3">
          <MapboxMap
            lng={
              selectedStructure?.attributes.longitude ||
              activeCoordinate[0] ||
              78.0421
            }
            lat={
              selectedStructure?.attributes.latitude ||
              activeCoordinate[1] ||
              27.1751
            }
            zoom={16}
            style="mapbox://styles/mapbox/standard-beta"
            coordinates={structures}
          />
        </div>
      </section>
      <section className="p-6 bg-white rounded-md shadow-sm">
        <h3 className="text-xl font-bold dark:text-white mb-6">
          Inspections Timeline
        </h3>
        <Timeline structures={inspectedStructures} />
      </section>
    </div>
  );
}
