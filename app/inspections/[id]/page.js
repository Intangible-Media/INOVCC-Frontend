"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { TextInput, Button, Dropdown, Checkbox, Label } from "flowbite-react";
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
import {
  CheckMark,
  FavoriteIcon,
  PlusIcon,
} from "../../../public/icons/intangible-icons";
import {
  downloadFilesAsZip,
  isImage,
  ensureDomain,
} from "../../../utils/strings";
import { useInspection } from "../../../context/InspectionContext";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Page(props) {
  const { params } = props;
  const pathname = usePathname();
  const { data: session, loading } = useSession();
  const { inspection, setInspection } = useInspection();

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
  const [structureProgressType, setStructureProgressType] = useState("all");
  const [structureAssetType, setStructureAssetType] = useState("all");
  const [options, setOptions] = useState({
    series: [70],
    chart: {
      type: "radialBar",
      offsetY: -33,
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

  const filteredStructures = filterStructures(structureSearch);

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

  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      labels: [structureProgressType],
    }));
  }, [structureProgressType]);

  useEffect(() => {
    if (!map.current || structures.length === 0) return;

    // Function to execute map operations
    const executeMapOperations = () => {
      structures.forEach((structure) => {
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
        features: structures.map((structure) => {
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
      executeMapOperations();
    } else {
      map.current.on("load", executeMapOperations);
    }

    // Clean up the event listener
    return () => {
      if (map.current) {
        map.current.off("load", executeMapOperations);
      }
    };
  }, [structures]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard-beta",
      center: [lng, lat],
      zoom: 16,
      pitch: 50,
    });

    map.current.on("style.load", () => {
      map.current.setFog({});
      map.current.setConfigProperty("basemap", "lightPreset", "day");

      const isPhone = window.matchMedia("(max-width: 550px)").matches;

      // Set padding based on device type
      const padding = isPhone ? { bottom: 400 } : { right: 400 };

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
      const padding = isPhone ? { bottom: 400 } : { right: 450 };

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
            setLng(structuresData[0].attributes.longitude);
            setLat(structuresData[0].attributes.latitude);
          }
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session, params.id, query]); // Assuming `query` here is a dependency that might change and is suitable for useEffect's dependency array

  useEffect(() => {
    if (!map.current || !selectedStructure) return;

    if (
      map.current.getLayer("marker-layer") &&
      map.current.getSource("markers")
    ) {
      map.current.setLayoutProperty("marker-layer", "icon-size", [
        "case",
        ["==", ["get", "id"], selectedStructure.id],
        1, // Larger size for selected structure
        0.6, // Normal size
      ]);
    }
  }, [selectedStructure]);

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
      <div className="flex flex-col md:flex-row justify-between py-6">
        <div className="flex flex-col gap-3 mb-4">
          <h1 className="leading-tight text-2xl font-medium">
            {inspection?.name ? inspection.name : "Map Name Here"}
          </h1>
          {/* <h3 className="text-xs">2504 East Roma Ave. Phoenix, AZ 85016</h3> */}
        </div>

        <div className="flex gap-3 align-middle">
          <ProtectedContent requiredRoles={["Admin"]}>
            <InspectionDrawer
              inspection={inspection}
              setInspection={setInspection}
              btnText={"Edit Inspection"}
            />
          </ProtectedContent>
          <Button className="bg-dark-blue-700 text-white shrink-0 self-start">
            Add to Favorites <FavoriteIcon />
          </Button>
        </div>
      </div>

      <div
        ref={mapContainer}
        className="map-container col-span-3 relative overflow-hidden p-4 mb-4 border-white border-2 dark:border-gray-600 bg-white rounded-lg"
      >
        <div
          className="grid max-w-xs grid-cols-2 gap-1 p-1 mx-auto my-2 bg-white rounded-lg dark:bg-gray-600 absolute left-8 bottom-4 z-10"
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

        <div className="map-structure-panel shadow-sm flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white w-full z-10 h-32 rounded-lg absolute right-8 top-8 bottom-8 overflow-hidden">
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

              {structureSearch || activeView === "singleView" ? (
                <div
                  className="exit-icon absolute right-5 cursor-pointer mt-3"
                  onClick={(e) => {
                    setActiveView("overview");
                    setStructureSearch("");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M7.05864 6L11.0214 2.03721C11.0929 1.96814 11.15 1.88553 11.1892 1.79419C11.2285 1.70284 11.2491 1.6046 11.25 1.50519C11.2508 1.40578 11.2319 1.30719 11.1942 1.21518C11.1566 1.12317 11.101 1.03958 11.0307 0.969285C10.9604 0.898989 10.8768 0.843396 10.7848 0.805752C10.6928 0.768107 10.5942 0.749164 10.4948 0.750028C10.3954 0.750892 10.2972 0.771546 10.2058 0.810783C10.1145 0.850021 10.0319 0.907058 9.96279 0.978565L6 4.94136L2.03721 0.978565C1.896 0.842186 1.70688 0.766722 1.51058 0.768428C1.31428 0.770134 1.1265 0.848873 0.987685 0.987685C0.848873 1.1265 0.770134 1.31428 0.768428 1.51058C0.766722 1.70688 0.842186 1.896 0.978565 2.03721L4.94136 6L0.978565 9.96279C0.907058 10.0319 0.850021 10.1145 0.810783 10.2058C0.771546 10.2972 0.750892 10.3954 0.750028 10.4948C0.749164 10.5942 0.768107 10.6928 0.805752 10.7848C0.843396 10.8768 0.898989 10.9604 0.969285 11.0307C1.03958 11.101 1.12317 11.1566 1.21518 11.1942C1.30719 11.2319 1.40578 11.2508 1.50519 11.25C1.6046 11.2491 1.70284 11.2285 1.79419 11.1892C1.88553 11.15 1.96814 11.0929 2.03721 11.0214L6 7.05864L9.96279 11.0214C10.104 11.1578 10.2931 11.2333 10.4894 11.2316C10.6857 11.2299 10.8735 11.1511 11.0123 11.0123C11.1511 10.8735 11.2299 10.6857 11.2316 10.4894C11.2333 10.2931 11.1578 10.104 11.0214 9.96279L7.05864 6Z"
                      fill="#6B7280"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          </div>

          {activeView === "singleView" && (
            <MapPanel structure={selectedStructure} />
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
                  onClick={() => {
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
        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
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
                    selectedStructure.attributes.status
                  )} flex self-center align-middle text-xs font-medium px-2.5 py-0.5 gap-2 rounded-full`}
                >
                  {selectedStructure.attributes.status}
                  {selectedStructure.attributes.status === "Uploaded" && (
                    <CheckMark />
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="w-full mt-auto">
            <ProtectedContent requiredRoles={["Admin"]}>
              <ApexChart
                type="radialBar"
                options={options}
                series={[activeCompletion]}
                height={450}
                width={"100%"}
              />
            </ProtectedContent>
          </div>
        </div>

        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex flex-col gap-1">
            <h6 className="text-lg font-semibold">Documents</h6>
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
              className="text-sm text-gray-500 font-medium"
              onClick={(e) => {
                downloadFilesAsZip(
                  getArrayOfUrls(inspectionDocuments),
                  `${inspection?.name} Documents`
                );
              }}
            >
              Download All
            </button>
            <button className="flex align-middle text-sm font-semibold">
              Add Documents <PlusIcon />
            </button>
          </div>
        </div>

        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex justify-between">
            <div>
              <h6 className="text-lg font-semibold">Assets</h6>
              <select
                className="block pb-2.5 pt-0 px-0 w-36 text-sm font-medium text-dark-blue-700 bg-transparent border-0 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                value={structureAssetType}
                onChange={(e) => {
                  setStructureAssetType(e.target.value);
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
                    selectedStructure.attributes.status
                  )} flex self-center align-middle text-xs font-medium px-2.5 py-0.5 gap-2 rounded-full`}
                >
                  {selectedStructure.attributes.status}
                  {selectedStructure.attributes.status === "Uploaded" && (
                    <CheckMark />
                  )}
                </span>
              )}
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
              className="text-sm text-gray-500 font-medium"
              onClick={(e) => {
                const assetsToDownload = [];
                const zipFileName = `All Assets`;

                structures.filter((structure) => {
                  const structureImages = structure.attributes.images.data;
                  if (structureImages) {
                    for (let image of structureImages) {
                      assetsToDownload.push(image);
                    }
                  }
                });

                downloadFilesAsZip(
                  getArrayOfUrls(assetsToDownload),
                  zipFileName
                );
              }}
            >
              Download All
            </button>
            <button className="flex align-middle text-sm font-semibold">
              Add Documents <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg mb-4">
          <h6 className="text-lg font-semibold">Inspectors</h6>

          <div className="flex flex-col overflow-auto">
            {uniqueInspectors.map((inspector, index) => (
              <div
                key={`${inspector.id}-${index}`}
                className="alternate-bg flex gap-4 align-middle border-t py-1"
              >
                <img
                  className="border-2 border-white rounded-full dark:border-gray-800 h-12 w-12 object-cover"
                  src={`${ensureDomain(
                    inspector.attributes.picture.data.attributes.formats
                      .thumbnail.url
                  )}`}
                  alt="Inspector Picture"
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

        <div className="inspection-map-box-sm flex flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg mb-4">
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
                  <img
                    className="border-2 border-white rounded-full dark:border-gray-800 h-12 w-12 object-cover" // Use className for styles except width and height
                    src={`${ensureDomain(
                      clientContact?.attributes?.picture?.data?.attributes
                        ?.formats?.thumbnail?.url
                    )}`}
                    alt="fdsfdsfds"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
        {inspection && (
          <ActivityLog id={inspection?.id} collection="inspections" />
        )}
      </div>
    </>
  );
}
