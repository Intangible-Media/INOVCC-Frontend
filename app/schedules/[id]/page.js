"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import qs from "qs";
import DirectionsComponent from "../../../components/DirectionsComponent";
import AvatarImage from "../../../components/AvatarImage";
import { CheckMark } from "../../../public/icons/intangible-icons";
import { getAllStructure } from "../../../utils/api/structures";
import { Button, Datepicker, Badge } from "flowbite-react";
import { statusColors } from "../../../utils/collectionListAttributes";
import { getTeam } from "../../../utils/api/teams";
import { useRouter } from "next/navigation";
import { FaRegStar } from "react-icons/fa6";
import Timeline from "../../../components/Timeline";
import { useLoading } from "../../../context/LoadingContext";
import MapPanelalt from "../../../components/Panel/MapPanelalt";
import StructureGroupProgress from "../../../components/Charts/StructuresGroupProgress";

import {
  downloadFilesAsZipWithSubfolders,
  convertInspectionsToZipArgs,
  sortStructuresByStatus,
} from "../../../utils/strings";
import { DownloadOutlineIcon } from "../../../public/icons/intangible-icons";

const MapboxMap = dynamic(() => import("../../../components/MapBox"), {
  ssr: false,
});

export default function Page({ params }) {
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const { data: session } = useSession();
  const [structures, setStructures] = useState([]);
  const [groupedStructures, setGroupedStructures] = useState([]);
  const [activeCoordinate, setActiveCoordinate] = useState([78.0421, 27.1751]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [team, setTeam] = useState(null);
  const [date, setDate] = useState(
    new Date(convertToLongDateFormat(new Date()))
  );

  const getGeoLocationForStructure = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setActiveCoordinate([longitude, latitude]);
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const iconMap = {
    red: "/location-red.png",
    yellow: "/location-yellow.png",
    drkgreen: "/location-dark.png",
    green: "/location-green.png",
  };

  const inspectedStructures = structures.filter((structure) => {
    const statuses = ["Inspected", "Uploaded", "Uninspectable"];
    return statuses.includes(structure.attributes.status);
  });

  const loadIcon = (color) => iconMap[color] || "/location-red.png";

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

  const fetchStructure = useCallback(async () => {
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
                $lte: date,
              },
            },
            {
              scheduleEnd: {
                $gte: date,
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

    try {
      const response = await getAllStructure({
        jwt: session.accessToken,
        query: structureQuery,
      });

      setStructures(response);

      const groupedByInspectionId = response.reduce((acc, structure) => {
        const inspectionId = structure.attributes.inspection.data.id;
        const mapName = structure.attributes.inspection.data.attributes.name;
        if (!acc[inspectionId]) {
          acc[inspectionId] = { mapName, structures: [] };
        }
        acc[inspectionId].structures.push(structure);
        return acc;
      }, {});

      const groupedArray = Object.keys(groupedByInspectionId).map((key) => ({
        inspectionId: key,
        mapName: groupedByInspectionId[key].mapName,
        structures: sortStructuresByStatus(
          groupedByInspectionId[key].structures
        ),
      }));

      setGroupedStructures(groupedArray);
    } catch (error) {
      console.error("Error fetching structures:", error);
    }
  }, [session, params.id, date]);

  const fetchTeam = useCallback(async () => {
    if (!session) return;

    try {
      const apiParams = {
        jwt: session.accessToken,
        id: params.id,
        query: "",
      };
      const response = await getTeam(apiParams);
      setTeam(response.data.data);
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  }, [session, params.id]);

  useEffect(() => {
    fetchTeam();
    fetchStructure();
  }, [fetchTeam, fetchStructure]);

  useEffect(() => {
    getGeoLocationForStructure();
  }, []);

  useEffect(() => {
    if (!selectedStructure) return;

    const longitude = selectedStructure?.attributes.longitude;
    const latitude = selectedStructure?.attributes.latitude;

    if ((longitude, latitude)) {
      console.log("There is something ehre");
      setActiveCoordinate([
        selectedStructure.attributes.longitude,
        selectedStructure.attributes.latitude,
      ]);
    }
  }, [selectedStructure]);

  const structuresRescheduled = structures.filter(
    (structure) => structure.attributes.status === "Reschedule"
  );

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
    const [expandRescheduled, setExpandRescheduled] = useState(false);

    const toggleGroup = (index) => {
      setExpandedGroup(expandedGroup === index ? null : index);
    };

    return (
      <div className="flex flex-col gap-2 overflow-scroll">
        <div className="flex flex-col border border-gray-300 rounded-md">
          <div
            className="flex justify-between p-3 cursor-pointer"
            onClick={() => setExpandRescheduled(!expandRescheduled)}
          >
            <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
              Rescheduled
              <Badge href="#" className="mt-0.5">
                {structuresRescheduled.length}
              </Badge>
            </h3>
            <StructureGroupProgress structures={structuresRescheduled} />
          </div>
          <div
            className={`overflow-hidden transition-max-height duration-200 ease-in-out ${
              expandRescheduled ? "max-h-[350px]" : "max-h-0"
            }`}
          >
            {expandRescheduled && (
              <div className="overflow-auto w-full h-full mb-4">
                {structuresRescheduled.map((structure, index) => (
                  <div
                    key={`${structure.id}-${index}-rescheduled`}
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
                        <h5 className="flex flex-col md:flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                          <span className="flex shorten-text">
                            {structure.attributes.mapSection}
                            {structure.attributes.favorited && (
                              <FaRegStar className="text-dark-blue-700 w-5 ml-1 mt-0.5" />
                            )}
                          </span>
                          <span className="flex items-center font-light ml-1">
                            {`${structure.attributes.type}`}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {groupedStructures.map((structureGroup, index) => (
          <div
            className="flex flex-col border border-gray-300 rounded-md"
            key={`structure-group-${index}`}
          >
            <div
              className="flex justify-between p-3 cursor-pointer"
              onClick={() => toggleGroup(index)}
            >
              <h3 className="text-base text-gray-700 font-medium flex gap-2 align-middle">
                {structureGroup.mapName}
                <Badge href="#" className="mt-0.5">
                  {structureGroup.structures.length}
                </Badge>
              </h3>
              <StructureGroupProgress structures={structureGroup.structures} />
            </div>
            <div
              className={`overflow-hidden transition-max-height duration-200 ease-in-out ${
                expandedGroup === index ? "max-h-[350px]" : "max-h-0"
              }`}
            >
              {expandedGroup === index && (
                <div className="overflow-auto w-full h-full mb-4">
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
                          <h5 className="flex flex-col md:flex-row flex-shrink-0 mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                            <span className="flex shorten-text">
                              {structure.attributes.mapSection}
                              {structure.attributes.favorited && (
                                <FaRegStar className="text-dark-blue-700 w-5 ml-1 mt-0.5" />
                              )}
                            </span>
                            <span className="flex items-center font-light ml-1">
                              {`${structure.attributes.type}`}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  function groupStructuresByType(structures) {
    return structures.reduce((acc, structure) => {
      const status = structure.attributes.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(structure);
      return acc;
    }, {});
  }

  const groupedStructuresByType = groupStructuresByType(structures);

  const allStructureTypes = Object.keys(groupedStructuresByType).map((type) => {
    return {
      name: type,
      count: groupedStructuresByType[type].length,
    };
  });

  return (
    <div className="flex gap-4 flex-col justify-between py-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <h1 className="leading-tight text-2xl font-medium">
          {team?.attributes.name || "Team Name"}
        </h1>
        <div className="relative flex gap-4 w-full md:w-[400px]">
          <Datepicker
            title="Flowbite Datepicker"
            className="w-full bg-white"
            onSelectedDateChanged={(date) => setDate(date)}
          />
          <Button
            className="bg-dark-blue-700 text-white"
            onClick={async (e) => {
              const today = new Date(); // Get today's date

              const inspectedStructures = structures.filter((structure) => {
                const { status, inspectionDate } = structure.attributes;

                if (status === "Inspected" && inspectionDate) {
                  const inspectionDateObj = new Date(inspectionDate);

                  // Check if inspectionDate is today
                  return (
                    inspectionDateObj.getFullYear() === today.getFullYear() &&
                    inspectionDateObj.getMonth() === today.getMonth() &&
                    inspectionDateObj.getDate() === today.getDate()
                  );
                }

                return false;
              });

              showLoading(
                `Downloading all documents for ${inspectedStructures.length} structures`
              );

              const formattedStructures =
                convertInspectionsToZipArgs(inspectedStructures);

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
          <div className=" col-span-2 h-full overflow-scroll order-2 md:order-1">
            <MapPanelalt
              structureId={selectedStructure.id}
              setSelectedStructure={setSelectedStructure}
            />
          </div>
        ) : (
          <div className="flex flex-col p-3 md:p-6 gap-3 col-span-2 h-[475px] md:h-[650px] order-2 md:order-1">
            <div className="flex gap-4 overflow-x-scroll max-h-[250px] md:max-h-[400px]">
              <div
                className={`flex flex-col rounded-lg p-7  bg-white hover:bg-gray-50 border border-gray-300 aspect-square flex-shrink-0 flex-grow-0 w-[150px]`}
              >
                <div className="flex w-14 h-14 rounded-full m-auto text-center bg-dark-blue-700">
                  <p className={`text-xl text-white m-auto text-center`}>
                    {structures.length}
                  </p>
                </div>
                <p className="text-xs text-center font-semibold mt-2 text-dark-blue-700">
                  Total
                </p>
              </div>

              {allStructureTypes.map((type, index) => {
                const backgroundColor = statusColors[type.name];

                return (
                  <div
                    className={`flex flex-col rounded-lg p-7  bg-white hover:bg-gray-50 border border-gray-300 aspect-square flex-shrink-0 flex-grow-0 w-[150px]`}
                    key={index}
                  >
                    <div
                      className="flex w-14 h-14 rounded-full m-auto text-center"
                      style={{ backgroundColor }}
                    >
                      <p className={`text-xl text-white m-auto text-center`}>
                        {type.count}
                      </p>
                    </div>
                    <p
                      className="text-xs text-center font-semibold mt-2"
                      style={{ color: backgroundColor }}
                    >
                      {type.name}
                    </p>
                  </div>
                );
              })}
            </div>

            <h3 className="text-xl font-bold dark:text-white mb-1 mt-3">
              Maps
            </h3>

            <MapStructuresTabs groupedStructures={groupedStructures} />
          </div>
        )}

        <div className="relative border-white border-2 dark:border-gray-600 bg-white rounded-lg h-[275px] md:h-full col-span-3 order-1 md:order-2">
          <MapboxMap
            lng={activeCoordinate[0]}
            lat={activeCoordinate[1]}
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
