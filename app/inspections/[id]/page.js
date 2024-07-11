"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { TextInput, Button, Dropdown, Checkbox, Badge } from "flowbite-react";
import DirectionsComponent from "../../../components/DirectionsComponent";
import qs from "qs";
import "mapbox-gl/dist/mapbox-gl.css";
import MapPanel from "../../../components/Panel/MapPanel";
import InspectionDrawer from "../../../components/Drawers/InspectionDrawer";
import { getInspection } from "../../../utils/api/inspections";
import ImageCardGrid from "../../../components/ImageCardGrid";
import ActivityLog from "../../../components/ActivityLog";
import ProtectedContent from "../../../components/ProtectedContent";
import { getLocationDetails } from "../../../utils/api/mapbox";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaRegStar } from "react-icons/fa";
import Camera from "../../../components/Camera";
import AvatarImage from "../../../components/AvatarImage";
import {
  CheckMark,
  FavoriteIcon,
  PlusIcon,
  StarSm,
} from "../../../public/icons/intangible-icons";
import {
  downloadFilesAsZip,
  downloadFilesAsZipWithSubfolders,
  convertInspectionsToZipArgs,
  sortStructuresByStatus,
  isImage,
  ensureDomain,
} from "../../../utils/strings";
import { useInspection } from "../../../context/InspectionContext";
import { AddFavorite } from "../../../public/icons/intangible-icons";
import { useLoading } from "../../../context/LoadingContext";
import { format } from "path";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Page(props) {
  const router = useRouter();
  const { params } = props;
  const pathname = usePathname();
  const { data: session, loading } = useSession();
  const { inspection, setInspection } = useInspection();
  const { showLoading, hideLoading, showSuccess } = useLoading();

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [structureSearch, setStructureSearch] = useState("");
  const [structures, setStructures] = useState([]);
  const [inspectionDocuments, setInspectionDocuments] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [activeMapStyle, setActiveMapStyle] = useState("3d");
  const [activeView, setActiveView] = useState("overview");
  const [activeCompletion, setActiveCompletion] = useState(0);
  const [structureProgressType, setStructureProgressType] = useState("All");
  const [structureAssetType, setStructureAssetType] = useState("all");
  const [options, setOptions] = useState({
    series: [70],
    chart: {
      type: "radialBar",
      offsetY: 0,
    },
    colors: ["#FDF6B2"],
    plotOptions: {
      radialBar: {
        hollow: {
          size: "72%",
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: 30,
            show: true,
            color: "#111928",
            fontSize: "17px",
          },
          value: {
            offsetY: -15,
            color: "#111928",
            fontSize: "48px",
            show: true,
          },
        },
      },
    },
    labels: [structureAssetType],
  });

  const searchParams = useSearchParams();
  const activeMapStyleTab =
    "text-white bg-dark-blue-700 dark:bg-gray-300 dark:text-gray-900";
  const inactiveMapStyleTab =
    "text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700";

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const iconMap = {
    red: "/location-red.png",
    yellow: "/location-yellow.png",
    drkgreen: "/location-dark.png",
    green: "/location-green.png",
  };

  const loadIcon = (color) => iconMap[color] || "/location-red.png";

  const query = qs.stringify(
    {
      populate: {
        favorited_by: {
          populate: "*",
        },
        structures: {
          populate: {
            inspectors: {
              populate: "*",
            },
            images: {
              populate: "*",
            },
            notes: {
              populate: "*",
            },
          },
        },
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

  const addToFavorite = () => {};

  /**
   * This function takes an array of files and returns an array of URLs.
   * @param {Array} files - The files to get the URLs from.
   * @returns {Array} The array of URLs.
   */
  const getArrayOfUrls = (files) => {
    return files.map((file) => ({
      url: `${file.attributes.url}`,
      name: file.attributes.name,
    }));
  };

  /**
   * This function filters structures based on a search term.
   * @param {string} searchTerm - The term to search for.
   * @returns {Array} The filtered structures.
   */
  const filterStructures = (searchTerm) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredStructuresList =
      inspection?.structures.data.filter((structure) => {
        const attributes = structure.attributes;
        return ["status", "mapSection", "type"].some((field) =>
          attributes[field].toLowerCase().includes(lowerCaseSearchTerm)
        );
      }) || [];

    return filteredStructuresList;
  };

  /**
   * This function updates the center of the map.
   * @param {number} longitude - The longitude of the new center.
   * @param {number} latitude - The latitude of the new center.
   */
  const updateCenterOnClick = (longitude, latitude) => {
    setLng(longitude);
    setLat(latitude);
  };

  /**
   * This function gets the color for an inspection based on its status.
   * @param {string} status - The status of the inspection.
   * @returns {string} The color for the inspection.
   */
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

  const getAllStructureTypes = () => {
    const types = structures.map((structure) => structure.attributes.type);
    const uniqueTypes = [...new Set(types)]; // Removes duplicates
    return uniqueTypes;
  };

  const filteredStructures = sortStructuresByStatus(
    filterStructures(structureSearch)
  );

  /**
   * This function returns a color based on the status.
   * @param {string} status - The status to get the color for.
   * @returns {string} The color for the status.
   */
  function getColorBasedOnStatus(status) {
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
  }

  /**
   * This function adds a satellite layer to the map.
   */
  function addSatelliteLayer() {
    if (!map.current.getLayer("satellite")) {
      if (!map.current.getSource("satellite-source")) {
        map.current.addSource("satellite-source", {
          type: "raster",
          url: "mapbox://mapbox.satellite",
          tileSize: 256,
        });
      }

      map.current.addLayer({
        id: "satellite",
        source: "satellite-source",
        type: "raster",
        layout: {
          visibility: "none",
        },
      });
    }
  }

  /**
   * This function toggles the satellite layer on the map.
   */
  const toggleSatelliteLayer = () => {
    if (map.current && map.current.getLayer("satellite")) {
      const visibility = map.current.getLayoutProperty(
        "satellite",
        "visibility"
      );

      if (visibility === "visible") {
        map.current.setLayoutProperty("satellite", "visibility", "none");
        setActiveMapStyle("3d");
        map.current.easeTo({ pitch: 50 });
      } else {
        map.current.setLayoutProperty("satellite", "visibility", "visible");
        setActiveMapStyle("satelite");
        map.current.easeTo({ pitch: 0 });
      }
    } else {
      console.warn("Satellite layer not found on the map but just made it.");
      addSatelliteLayer();
      return toggleSatelliteLayer();
    }
  };

  const createStructureSelectedParam = (structureId) => {
    const url = new URL(window.location);
    url.searchParams.set("structure", structureId);
    window.history.pushState({}, "", url.toString());

    // Any additional logic you need after setting the URL can go here.
  };

  // Simplified query string handling using Next.js router
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      labels: [structureProgressType],
    }));
  }, [structureProgressType]);

  useEffect(() => {
    if (!map.current || structures.length === 0) return;

    const structureId = searchParams.get("structure");
    const structuresArray = inspection?.structures.data || [];

    if (structureId) {
      const structure = structures.find((s) => s.id === Number(structureId));

      updateCenterOnClick(
        structure.attributes.longitude,
        structure.attributes.latitude
      );
      setSelectedStructure(structure);
      setActiveView("singleView");
    }

    // Function to execute map operations
    const executeMapOperations = () => {
      structuresArray.forEach((structure) => {
        const color = getColorBasedOnStatus(structure.attributes.status);
        const iconName = `profile-icon-${color}`;

        // Only load the image if it's not already on the map
        if (!map.current.hasImage(iconName)) {
          const url = loadIcon(color);
          map.current.loadImage(url, (error, image) => {
            if (error) {
              console.error(`Error loading ${color} icon:`, error);
              return;
            }

            // Check if the image already exists before adding it
            if (!map.current.hasImage(iconName)) {
              map.current.addImage(iconName, image);
            }
          });
        }
      });

      const geojsonData = {
        type: "FeatureCollection",
        features: structuresArray.map((structure) => {
          const color = getColorBasedOnStatus(structure.attributes.status);
          const iconName = `profile-icon-${color}`;

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                structure.attributes.longitude,
                structure.attributes.latitude,
              ],
            },
            properties: {
              id: structure.id,
              icon: iconName,
            },
          };
        }),
      };

      // Ensure the "markers" source is added or updated
      if (!map.current.getSource("markers")) {
        map.current.addSource("markers", {
          type: "geojson",
          data: geojsonData,
        });
      } else {
        map.current.getSource("markers").setData(geojsonData);
      }

      // Ensure the "marker-layer" is added
      if (!map.current.getLayer("marker-layer")) {
        map.current.addLayer({
          id: "marker-layer",
          type: "symbol",
          source: "markers",
          layout: {
            "icon-image": ["get", "icon"],
            "icon-size": 0.6, // Adjust icon size as needed
          },
        });
      }
    };

    // Check if the map is already loaded, if not, listen for the load event
    if (map.current.isStyleLoaded()) {
      addSatelliteLayer();
      executeMapOperations();
    } else {
      map.current.on("load", addSatelliteLayer);
      map.current.on("load", executeMapOperations);
    }

    // Clean up the event listener
    return () => {
      if (map.current) {
        map.current.off("load", addSatelliteLayer);
        map.current.off("load", executeMapOperations);
      }
    };
  }, [inspection?.structures.data]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard-beta",
      center: [lng, lat],
      zoom: 18,
      pitch: 50,
    });

    map.current.on("style.load", () => {
      map.current.setFog({});
      map.current.setConfigProperty("basemap", "lightPreset", "day");

      const isPhone = window.matchMedia("(max-width: 550px)").matches;

      // Set padding based on device type
      const padding = isPhone ? { bottom: 525 } : { right: 400 };

      map.current.easeTo({ padding: padding });

      // Function to add a traffic layer
      function addTrafficLayer() {
        if (!map.current.getLayer("traffic")) {
          if (!map.current.getSource("mapbox-traffic")) {
            map.current.addSource("mapbox-traffic", {
              type: "vector",
              url: "mapbox://mapbox.mapbox-traffic-v1",
            });
          }

          map.current.addLayer({
            id: "traffic",
            type: "line",
            source: "mapbox-traffic",
            "source-layer": "traffic",
            minzoom: 0,
            maxzoom: 22,
            paint: {
              "line-width": 5,
              "line-color": [
                "match",
                ["get", "congestion"],
                ["low"],
                "hsl(138, 100%, 40%)",
                ["moderate"],
                "hsl(71, 100%, 64%)",
                ["heavy"],
                "hsl(28, 100%, 56%)",
                ["severe"],
                "hsl(0, 100%, 50%)",
                "#000000", // Default color
              ],
            },
            layout: {
              visibility: "visible",
            },
          });
        }
      }

      function addZoomEvent() {
        const MIN_TRAFFIC_ZOOM_LEVEL = 17;
        map.current.on("zoom", () => {
          const currentZoom = map.current.getZoom();
          if (map.current.getLayer("traffic")) {
            map.current.setLayoutProperty(
              "traffic",
              "visibility",
              currentZoom >= MIN_TRAFFIC_ZOOM_LEVEL ? "visible" : "none"
            );
          }
        });
      }

      // Add the traffic layer
      addTrafficLayer();

      // Add zoom level event handling for traffic layer
      addZoomEvent();
    });
  }, [lng, lat]);

  useEffect(() => {
    // Function to animate the map and get location details
    const updateMapAndLocation = async () => {
      // Determine if the device is a phone or not
      const isPhone = window.matchMedia("(max-width: 550px)").matches;
      // Set padding based on device type
      const padding = isPhone ? { bottom: 525 } : { right: 450 };

      map.current.easeTo({
        zoom: 18,
        padding: padding,
        center: [lng, lat],
        duration: 1000,
      });

      try {
        await getLocationDetails(lng, lat);
      } catch (error) {
        console.error("Error getting location details:", error);
      }
    };
    // Call the async function
    updateMapAndLocation();
  }, [lng, lat]);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          // Ensure getInspection is imported or defined in your component/module
          const response = await getInspection({
            jwt: session.accessToken,
            id: params.id,
            query: query,
          });

          const inspectionData = response.data.data;
          const structuresData = inspectionData.attributes.structures.data;

          setInspection({
            ...inspectionData.attributes,
            id: inspectionData.id,
          });
          setInspectionDocuments(inspectionData.attributes.documents.data);
          setStructures(structuresData);

          if (structuresData.length > 0) {
            setLng(
              sortStructuresByStatus(structuresData)[0].attributes.longitude
            );
            setLat(
              sortStructuresByStatus(structuresData)[0].attributes.latitude
            );
          }
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session, params.id, query]); // Assuming `query` here is a dependency that might change and is suitable for useEffect's dependency array

  useEffect(() => {
    updateProgressBar(structureProgressType);
  }, [structureProgressType, structures]); // Depend on structures as well

  /**
   * Updates the progress bar based on the percentage of inspected structures.
   *
   * @param {string} type - The type of structures to consider. Defaults to "all".
   */
  const updateProgressBar = (type = "all") => {
    type = type.trim().toLowerCase();

    const filteredStructuresByType = structures.filter(
      (structure) =>
        type === "all" || structure.attributes.type.toLowerCase() === type
    );

    const inspectedStructures = filteredStructuresByType.filter(
      (structure) => structure.attributes.status.toLowerCase() === "inspected"
    );

    const percentOfCompletion =
      filteredStructuresByType.length > 0
        ? Math.round(
            (inspectedStructures.length / filteredStructuresByType.length) * 100
          )
        : 0;

    setActiveCompletion(percentOfCompletion);
  };

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
    inspection?.structures.data
      .map((structure) => structure.attributes.images?.data)
      .flat()
      .filter(Boolean) || [];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between pt-6 pb-6 md:pb-5">
        <div className="flex flex-col gap-0.5 md:gap-2 mb-4">
          {/* <Camera /> */}
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
          {/* <h3 className="text-xs">2504 East Roma Ave. Phoenix, AZ 85016</h3> */}
        </div>

        <div className="flex gap-3 align-middle">
          <ProtectedContent requiredRoles={["Admin"]}>
            <InspectionDrawer
              inspection={inspection}
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
      </div>

      <div
        ref={mapContainer}
        className="map-container col-span-3 relative overflow-hidden p-4 mb-4 border-white border-2 dark:border-gray-600 bg-white rounded-lg"
      >
        <div
          className="grid max-w-xs grid-cols-2 gap-1 p-1 mx-auto my-2 bg-white rounded-lg dark:bg-gray-600 absolute left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-8 bottom-[585px] md:bottom-4 z-10"
          role="group"
        >
          <button
            onClick={toggleSatelliteLayer}
            type="button"
            className={`px-5 py-1.5 text-xs font-medium rounded-lg ${
              activeMapStyle == "satelite"
                ? activeMapStyleTab
                : inactiveMapStyleTab
            }`}
          >
            Satellite
          </button>
          <button
            onClick={toggleSatelliteLayer}
            type="button"
            className={`px-5 py-1.5 text-xs font-medium rounded-lg ${
              activeMapStyle == "3d" ? activeMapStyleTab : inactiveMapStyleTab
            }`}
          >
            3D
          </button>
        </div>

        <div className="map-structure-panel shadow-md flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white w-full z-10 h-32 rounded-lg absolute right-6 top-6 bottom-6 overflow-hidden">
          {activeView === "overview" && (
            <div className="p-4 w-full bg-gray-100">
              <div className="relative">
                <TextInput
                  id="small"
                  type="text"
                  placeholder="Search Structures"
                  sizing="md"
                  className="w-full relative"
                  value={structureSearch}
                  onChange={(e) => setStructureSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {activeView === "singleView" && (
            <MapPanel
              structure={selectedStructure}
              setSelectedStructure={setSelectedStructure}
              setActiveView={setActiveView}
              setStructureSearch={setStructureSearch}
            />
          )}

          {activeView === "overview" && (
            <div className="im-snapping overflow-x-auto w-full">
              {filteredStructures.map((structure, index) => (
                <div
                  key={`${structure.id}-${index}`}
                  className={`flex flex-row cursor-pointer justify-between items-center bg-white border-0 border-b-2 border-gray-100 md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-0 ${
                    selectedStructure &&
                    selectedStructure.id === structure.id &&
                    "active-structure"
                  }`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default click behavior
                    e.stopPropagation(); // Stop propagation if necessary
                    updateCenterOnClick(
                      structure.attributes.longitude,
                      structure.attributes.latitude
                    );
                    setSelectedStructure(structure);
                    setActiveView("singleView");
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

                  <div className="flex">
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

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-6 md:p-8 rounded-lg">
          <div className="flex justify-between">
            <div>
              <h6 className="text-lg font-semibold">Structure Status</h6>
              <select
                className="block pb-2.5 pt-0 px-0 w-36 text-sm font-medium text-dark-blue-700 bg-transparent border-0 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                value={structureProgressType}
                onChange={(e) => {
                  setStructureProgressType(e.target.value);
                }}
              >
                <option value="All">All</option>
                {getAllStructureTypes().map((structureType, index) => (
                  <option key={index} value={structureType}>
                    {structureType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {selectedStructure && (
                <span
                  className={`${getInspectionColor(
                    "uploaded"
                  )} flex self-center align-middle text-xs font-medium px-2.5 py-0.5 gap-2 rounded-full`}
                >
                  Uploaded
                  <CheckMark />
                </span>
              )}
            </div>
          </div>
          <div className="w-full mt-auto md:mt-0">
            <ProtectedContent requiredRoles={["Admin"]}>
              <div className=" h-[400px] md:h-[400px] -mb-12 -mt-8">
                <ApexChart
                  type="radialBar"
                  options={options}
                  series={[activeCompletion]}
                  height={"100%"}
                  width={"100%"}
                />
              </div>
            </ProtectedContent>
          </div>
        </div>

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
            <button
              className="text-sm text-dark-blue-700 font-medium"
              onClick={async (e) => {
                showLoading("Downloading all documents for this map");
                try {
                  const imagesWithAttributes = inspection?.documents.data.map(
                    (image) => image.attributes
                  );
                  const response = await downloadFilesAsZip(
                    imagesWithAttributes,
                    `${inspection?.name} Documents.zip`
                  );

                  showSuccess("Successfully downloaded all map documents!");
                } catch (error) {
                  console.error(error);
                  hideLoading();
                }
              }}
            >
              Download All
            </button>
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
            <ImageCardGrid
              files={allStructuresImages}
              background={"bg-white"}
              editMode={false}
              columns={2}
              padded={false}
            />
          </div>
          <div className="flex justify-between pt-5 border-t mt-auto">
            <button
              className="text-sm text-dark-blue-700 font-medium"
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
              Download All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
        {inspection && (
          <ActivityLog id={inspection?.id} collection="inspections" />
        )}
      </div>
    </>
  );
}
