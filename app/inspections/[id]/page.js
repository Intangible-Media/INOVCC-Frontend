"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import axios from "axios";
import dynamic from "next/dynamic";
import { TextInput, Button, Dropdown, Checkbox, Label } from "flowbite-react";
import DirectionsComponent from "../../../components/DirectionsComponent";
import Link from "next/link";
import qs from "qs";
import "mapbox-gl/dist/mapbox-gl.css";
import MapPanel from "../../../components/Panel/MapPanel";
import InspectionDrawer from "../../../components/Drawers/InspectionDrawer";
import {
  formatFileName,
  downloadFileFromUrl,
  downloadFilesAsZip,
  isImage,
  ensureDomain,
} from "../../../utils/strings";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Page(props) {
  const { params } = props;
  const pathname = usePathname();

  const { data: session, loading } = useSession();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(0);
  const [structureSearch, setStructureSearch] = useState("");
  const [structures, setStructures] = useState([]);
  const [inspectionDocuments, setInspectionDocuments] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [activeMapStyle, setActiveMapStyle] = useState("3d");
  const [inspectionReport, setInspectionReport] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [activeCompletion, setActiveCompletion] = useState(0);
  const [structureProgressType, setStructureProgressType] = useState("all");
  const [structureAssetType, setStructureAssetType] = useState("all");
  const [inspection, setInspection] = useState(null);

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
   * This async function gets the location details for a given longitude and latitude.
   * @param {number} longitude - The longitude of the location.
   * @param {number} latitude - The latitude of the location.
   * @returns {Promise} A promise that resolves to the location details.
   */
  const getLocationDetails = async (longitude, latitude) => {
    const endpoint = "mapbox.places";
    const accessToken =
      "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q"; // Replace with your Mapbox access token
    const url = `https://api.mapbox.com/geocoding/v5/${endpoint}/${longitude},${latitude}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const findFeature = (type) =>
        data.features.find((feature) => feature.place_type.includes(type));

      const place = findFeature("place");
      const region = findFeature("region");
      const address = findFeature("address");
      const postcode = findFeature("postcode");

      return {
        State: region ? region.text : "Not found",
        city: place ? place.text : "Not found",
        address: address ? `${address.address} ${address.text}` : "Not found",
        zipCode: postcode ? postcode.text : "Not found",
      };
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      return {
        State: "Error",
        city: "Error",
        address: "Error",
        zipCode: "Error",
      };
    }
  };

  /**
   * This function filters structures based on a search term.
   * @param {string} searchTerm - The term to search for.
   * @returns {Array} The filtered structures.
   */
  const filterStructures = (searchTerm) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return structures.filter((structure) => {
      const attributes = structure.attributes;
      return ["status", "mapSection", "type"].some((field) =>
        attributes[field].toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
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

  const getInspectionIconColor = (status) => {
    if (status.toLowerCase() == "uploaded") return "text-green-600";
    if (status.toLowerCase() == "inspected") return "text-green-600";
    if (status.toLowerCase() == "not inspected") return "text-yellow-400";
    else return "text-red-600";
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
    console.log("this has been rerendered");
    setOptions((prevOptions) => ({
      ...prevOptions,
      labels: [structureProgressType],
    }));
  }, [structureProgressType]);

  // Separate useEffect for the marker layer
  useEffect(() => {
    if (!map.current || structures.length === 0) return;

    // Load the specific PNG files based on the status

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

    if (!map.current.getSource("markers")) {
      map.current.addSource("markers", {
        type: "geojson",
        data: geojsonData,
      });
    } else {
      map.current.getSource("markers").setData(geojsonData);
    }

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
  }, [structures]);

  // useEffect(() => {
  //   if (!map.current) return;

  //   const onMarkerClick = (e) => {
  //     // Handle marker click event
  //   };

  //   map.current.on("click", "marker-layer", onMarkerClick);

  //   return () => {
  //     map.current.off("click", "marker-layer", onMarkerClick);
  //   };
  // }, [map.current]);

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
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${params.id}?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          const structuresData = response.data.data.attributes.structures.data;

          setInspection({
            ...response.data.data.attributes,
            id: response.data.data.id,
          });
          console.log(response.data.data.attributes);
          setInspectionDocuments(response.data.data.attributes.documents.data);
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
  }, [session, params.id, query]);

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

  useEffect(() => {
    console.log(inspection);
  }, [inspection]);

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

  const CheckMark = () => (
    <svg
      className="m-auto"
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
    >
      <path
        d="M3.6722 6.99999C3.51987 7.00065 3.37336 6.93626 3.26399 6.82059L0.509147 3.90423C0.454238 3.84574 0.410425 3.77604 0.38021 3.69908C0.349996 3.62212 0.33397 3.53943 0.33305 3.45572C0.331191 3.28665 0.390968 3.12371 0.499233 3.00273C0.607497 2.88175 0.755379 2.81264 0.910347 2.81061C1.06532 2.80858 1.21467 2.8738 1.32557 2.99191L3.67453 5.47756L8.67336 0.181164C8.78441 0.0630521 8.93392 -0.00209614 9.089 5.14605e-05C9.24407 0.00219906 9.39202 0.0714667 9.50028 0.192616C9.60855 0.313765 9.66826 0.476873 9.6663 0.646056C9.66433 0.815239 9.60083 0.976641 9.48979 1.09475L4.08041 6.82059C3.97104 6.93626 3.82452 7.00065 3.6722 6.99999Z"
        fill="white"
      />
    </svg>
  );

  const ElipseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M9.99992 5.5C10.9204 5.5 11.6666 4.82843 11.6666 4C11.6666 3.17157 10.9204 2.5 9.99992 2.5C9.07944 2.5 8.33325 3.17157 8.33325 4C8.33325 4.82843 9.07944 5.5 9.99992 5.5Z"
        fill="#1F2A37"
      />
      <path
        d="M9.99992 11.5C10.9204 11.5 11.6666 10.8284 11.6666 10C11.6666 9.17157 10.9204 8.5 9.99992 8.5C9.07944 8.5 8.33325 9.17157 8.33325 10C8.33325 10.8284 9.07944 11.5 9.99992 11.5Z"
        fill="#1F2A37"
      />
      <path
        d="M9.99992 17.5C10.9204 17.5 11.6666 16.8284 11.6666 16C11.6666 15.1716 10.9204 14.5 9.99992 14.5C9.07944 14.5 8.33325 15.1716 8.33325 16C8.33325 16.8284 9.07944 17.5 9.99992 17.5Z"
        fill="#1F2A37"
      />
    </svg>
  );

  const ElipseIconAlt = () => (
    <svg
      className="m-auto"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="5"
      viewBox="0 0 20 5"
      fill="none"
    >
      <path
        d="M18 4.5C19.1046 4.5 20 3.60457 20 2.5C20 1.39543 19.1046 0.5 18 0.5C16.8954 0.5 16 1.39543 16 2.5C16 3.60457 16.8954 4.5 18 4.5Z"
        fill="#9CA3AF"
      />
      <path
        d="M10 4.5C11.1046 4.5 12 3.60457 12 2.5C12 1.39543 11.1046 0.5 10 0.5C8.89543 0.5 8 1.39543 8 2.5C8 3.60457 8.89543 4.5 10 4.5Z"
        fill="#9CA3AF"
      />
      <path
        d="M2 4.5C3.10457 4.5 4 3.60457 4 2.5C4 1.39543 3.10457 0.5 2 0.5C0.895431 0.5 0 1.39543 0 2.5C0 3.60457 0.895431 4.5 2 4.5Z"
        fill="#9CA3AF"
      />
    </svg>
  );

  const FavoriteIcon = () => (
    <svg
      className="ml-3"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <mask id="path-1-inside-1_1319_3063" fill="white">
        <path d="M4.95866 6.69306C4.43948 6.69306 3.93197 6.53101 3.50029 6.22739C3.06861 5.92377 2.73216 5.49222 2.53348 4.98732C2.33479 4.48242 2.28281 3.92684 2.3841 3.39084C2.48538 2.85484 2.73539 2.36249 3.1025 1.97606C3.46962 1.58962 3.93735 1.32646 4.44655 1.21984C4.95575 1.11323 5.48355 1.16795 5.9632 1.37708C6.44286 1.58622 6.85283 1.94038 7.14127 2.39478C7.42971 2.84918 7.58366 3.38341 7.58366 3.92991C7.58289 4.66249 7.30608 5.36484 6.81396 5.88286C6.32185 6.40087 5.65461 6.69225 4.95866 6.69306ZM4.95866 2.39482C4.67023 2.39482 4.38827 2.48485 4.14845 2.65353C3.90863 2.82221 3.72171 3.06195 3.61133 3.34245C3.50096 3.62295 3.47208 3.93161 3.52835 4.22939C3.58462 4.52717 3.72351 4.80069 3.92746 5.01538C4.13141 5.23006 4.39126 5.37627 4.67415 5.4355C4.95704 5.49473 5.25026 5.46433 5.51674 5.34814C5.78321 5.23196 6.01097 5.0352 6.17122 4.78276C6.33146 4.53031 6.41699 4.23352 6.41699 3.92991C6.41699 3.52278 6.26335 3.13232 5.98986 2.84444C5.71637 2.55655 5.34543 2.39482 4.95866 2.39482Z" />
        <path d="M8.16699 12.8334H1.75033C1.59562 12.8334 1.44724 12.7687 1.33785 12.6536C1.22845 12.5384 1.16699 12.3822 1.16699 12.2194V10.3773C1.16792 9.56331 1.47551 8.78297 2.02229 8.20741C2.56907 7.63185 3.3104 7.30807 4.08366 7.3071H5.83366C6.60692 7.30807 7.34825 7.63185 7.89503 8.20741C8.44181 8.78297 8.7494 9.56331 8.75033 10.3773V12.2194C8.75033 12.3822 8.68887 12.5384 8.57947 12.6536C8.47007 12.7687 8.3217 12.8334 8.16699 12.8334ZM2.33366 11.6053H7.58366V10.3773C7.58366 9.88872 7.39928 9.42017 7.0711 9.07471C6.74291 8.72925 6.29779 8.53517 5.83366 8.53517H4.08366C3.61953 8.53517 3.17441 8.72925 2.84622 9.07471C2.51803 9.42017 2.33366 9.88872 2.33366 10.3773V11.6053Z" />
        <path d="M12.2503 5.46499H11.0837V4.23692C11.0837 4.07407 11.0222 3.91789 10.9128 3.80274C10.8034 3.68758 10.655 3.62289 10.5003 3.62289C10.3456 3.62289 10.1972 3.68758 10.0878 3.80274C9.97845 3.91789 9.91699 4.07407 9.91699 4.23692V5.46499H8.75033C8.59562 5.46499 8.44724 5.52969 8.33785 5.64484C8.22845 5.75999 8.16699 5.91618 8.16699 6.07903C8.16699 6.24188 8.22845 6.39806 8.33785 6.51322C8.44724 6.62837 8.59562 6.69306 8.75033 6.69306H9.91699V7.92113C9.91699 8.08399 9.97845 8.24017 10.0878 8.35532C10.1972 8.47048 10.3456 8.53517 10.5003 8.53517C10.655 8.53517 10.8034 8.47048 10.9128 8.35532C11.0222 8.24017 11.0837 8.08399 11.0837 7.92113V6.69306H12.2503C12.405 6.69306 12.5534 6.62837 12.6628 6.51322C12.7722 6.39806 12.8337 6.24188 12.8337 6.07903C12.8337 5.91618 12.7722 5.75999 12.6628 5.64484C12.5534 5.52969 12.405 5.46499 12.2503 5.46499Z" />
      </mask>
      <path
        d="M4.95866 6.69306C4.43948 6.69306 3.93197 6.53101 3.50029 6.22739C3.06861 5.92377 2.73216 5.49222 2.53348 4.98732C2.33479 4.48242 2.28281 3.92684 2.3841 3.39084C2.48538 2.85484 2.73539 2.36249 3.1025 1.97606C3.46962 1.58962 3.93735 1.32646 4.44655 1.21984C4.95575 1.11323 5.48355 1.16795 5.9632 1.37708C6.44286 1.58622 6.85283 1.94038 7.14127 2.39478C7.42971 2.84918 7.58366 3.38341 7.58366 3.92991C7.58289 4.66249 7.30608 5.36484 6.81396 5.88286C6.32185 6.40087 5.65461 6.69225 4.95866 6.69306ZM4.95866 2.39482C4.67023 2.39482 4.38827 2.48485 4.14845 2.65353C3.90863 2.82221 3.72171 3.06195 3.61133 3.34245C3.50096 3.62295 3.47208 3.93161 3.52835 4.22939C3.58462 4.52717 3.72351 4.80069 3.92746 5.01538C4.13141 5.23006 4.39126 5.37627 4.67415 5.4355C4.95704 5.49473 5.25026 5.46433 5.51674 5.34814C5.78321 5.23196 6.01097 5.0352 6.17122 4.78276C6.33146 4.53031 6.41699 4.23352 6.41699 3.92991C6.41699 3.52278 6.26335 3.13232 5.98986 2.84444C5.71637 2.55655 5.34543 2.39482 4.95866 2.39482Z"
        fill="#9CA3AF"
      />
      <path
        d="M8.16699 12.8334H1.75033C1.59562 12.8334 1.44724 12.7687 1.33785 12.6536C1.22845 12.5384 1.16699 12.3822 1.16699 12.2194V10.3773C1.16792 9.56331 1.47551 8.78297 2.02229 8.20741C2.56907 7.63185 3.3104 7.30807 4.08366 7.3071H5.83366C6.60692 7.30807 7.34825 7.63185 7.89503 8.20741C8.44181 8.78297 8.7494 9.56331 8.75033 10.3773V12.2194C8.75033 12.3822 8.68887 12.5384 8.57947 12.6536C8.47007 12.7687 8.3217 12.8334 8.16699 12.8334ZM2.33366 11.6053H7.58366V10.3773C7.58366 9.88872 7.39928 9.42017 7.0711 9.07471C6.74291 8.72925 6.29779 8.53517 5.83366 8.53517H4.08366C3.61953 8.53517 3.17441 8.72925 2.84622 9.07471C2.51803 9.42017 2.33366 9.88872 2.33366 10.3773V11.6053Z"
        fill="#9CA3AF"
      />
      <path
        d="M12.2503 5.46499H11.0837V4.23692C11.0837 4.07407 11.0222 3.91789 10.9128 3.80274C10.8034 3.68758 10.655 3.62289 10.5003 3.62289C10.3456 3.62289 10.1972 3.68758 10.0878 3.80274C9.97845 3.91789 9.91699 4.07407 9.91699 4.23692V5.46499H8.75033C8.59562 5.46499 8.44724 5.52969 8.33785 5.64484C8.22845 5.75999 8.16699 5.91618 8.16699 6.07903C8.16699 6.24188 8.22845 6.39806 8.33785 6.51322C8.44724 6.62837 8.59562 6.69306 8.75033 6.69306H9.91699V7.92113C9.91699 8.08399 9.97845 8.24017 10.0878 8.35532C10.1972 8.47048 10.3456 8.53517 10.5003 8.53517C10.655 8.53517 10.8034 8.47048 10.9128 8.35532C11.0222 8.24017 11.0837 8.08399 11.0837 7.92113V6.69306H12.2503C12.405 6.69306 12.5534 6.62837 12.6628 6.51322C12.7722 6.39806 12.8337 6.24188 12.8337 6.07903C12.8337 5.91618 12.7722 5.75999 12.6628 5.64484C12.5534 5.52969 12.405 5.46499 12.2503 5.46499Z"
        fill="#9CA3AF"
      />
      <path
        d="M4.95866 6.69306V8.19307L4.96041 8.19306L4.95866 6.69306ZM3.50029 6.22739L4.36323 5.00047L4.36323 5.00047L3.50029 6.22739ZM2.53348 4.98732L1.13765 5.53658H1.13765L2.53348 4.98732ZM2.3841 3.39084L3.85801 3.66936L2.3841 3.39084ZM3.1025 1.97606L2.015 0.942935L2.015 0.942935L3.1025 1.97606ZM4.44655 1.21984L4.75395 2.68801L4.44655 1.21984ZM5.9632 1.37708L6.56272 0.00209701L5.9632 1.37708ZM7.14127 2.39478L5.87486 3.19865L5.87486 3.19866L7.14127 2.39478ZM7.58366 3.92991L9.08366 3.93149V3.92991H7.58366ZM3.52835 4.22939L5.00226 3.95087L5.00226 3.95087L3.52835 4.22939ZM1.33785 12.6536L2.42535 11.6204L1.33785 12.6536ZM1.16699 12.2194H-0.333008H1.16699ZM1.16699 10.3773L-0.333008 10.3756V10.3773H1.16699ZM2.02229 8.20741L3.10979 9.24053H3.10979L2.02229 8.20741ZM4.08366 7.3071V5.8071L4.08177 5.8071L4.08366 7.3071ZM5.83366 7.3071L5.83555 5.8071H5.83366V7.3071ZM7.89503 8.20741L6.80753 9.24053L7.89503 8.20741ZM8.75033 10.3773H10.2503L10.2503 10.3756L8.75033 10.3773ZM2.33366 11.6053H0.833659V13.1053H2.33366V11.6053ZM7.58366 11.6053V13.1053H9.08366V11.6053H7.58366ZM11.0837 5.46499H9.58366V6.96499H11.0837V5.46499ZM10.9128 3.80274L9.8253 4.83586L10.9128 3.80274ZM10.0878 3.80274L11.1753 4.83586L10.0878 3.80274ZM9.91699 5.46499V6.96499H11.417V5.46499H9.91699ZM8.33785 5.64484L9.42535 6.67797L8.33785 5.64484ZM8.33785 6.51322L9.42535 5.48009L8.33785 6.51322ZM9.91699 6.69306H11.417V5.19306H9.91699V6.69306ZM11.0837 6.69306V5.19306H9.58366V6.69306H11.0837ZM4.95866 5.19306C4.75381 5.19306 4.54672 5.12952 4.36323 5.00047L2.63734 7.4543C3.31722 7.93249 4.12516 8.19306 4.95866 8.19306V5.19306ZM4.36323 5.00047C4.17871 4.87069 4.02368 4.67793 3.9293 4.43806L1.13765 5.53658C1.44063 6.30651 1.95851 6.97685 2.63734 7.4543L4.36323 5.00047ZM3.9293 4.43806C3.83471 4.1977 3.80892 3.92916 3.85801 3.66936L0.910182 3.11232C0.756704 3.92452 0.834876 4.76714 1.13765 5.53658L3.9293 4.43806ZM3.85801 3.66936C3.90706 3.4098 4.02644 3.18135 4.19 3.00918L2.015 0.942935C1.44434 1.54363 1.06371 2.29988 0.910182 3.11232L3.85801 3.66936ZM4.19 3.00918C4.35278 2.83783 4.55063 2.73058 4.75395 2.68801L4.13914 -0.24832C3.32406 -0.0776571 2.58645 0.341415 2.015 0.942935L4.19 3.00918ZM4.75395 2.68801C4.9566 2.64557 5.16757 2.66656 5.36369 2.75207L6.56272 0.00209701C5.79952 -0.330665 4.95489 -0.419123 4.13914 -0.24832L4.75395 2.68801ZM5.36369 2.75207C5.56086 2.83803 5.74192 2.98922 5.87486 3.19865L8.40767 1.5909C7.96374 0.891543 7.32486 0.334403 6.56272 0.00209701L5.36369 2.75207ZM5.87486 3.19866C6.00826 3.4088 6.08366 3.66346 6.08366 3.92991H9.08366C9.08366 3.10335 8.85115 2.28955 8.40767 1.5909L5.87486 3.19866ZM6.08366 3.92833C6.08328 4.28773 5.94678 4.61782 5.72646 4.84973L7.90146 6.91598C8.66538 6.11186 9.08249 5.03725 9.08366 3.93149L6.08366 3.92833ZM5.72646 4.84973C5.50862 5.07905 5.23012 5.19275 4.95691 5.19307L4.96041 8.19306C6.07911 8.19176 7.13508 7.7227 7.90146 6.91598L5.72646 4.84973ZM4.95866 0.894819C4.3559 0.894819 3.77352 1.08337 3.28551 1.42661L5.0114 3.88044C5.00302 3.88633 4.98456 3.89482 4.95866 3.89482V0.894819ZM3.28551 1.42661C2.79853 1.76912 2.43018 2.24766 2.21551 2.7932L5.00715 3.89171C5.01324 3.87625 5.01873 3.87529 5.0114 3.88044L3.28551 1.42661ZM2.21551 2.7932C2.00104 3.33824 1.94597 3.93393 2.05443 4.50791L5.00226 3.95087C4.99818 3.92929 5.00088 3.90767 5.00715 3.89171L2.21551 2.7932ZM2.05443 4.50791C2.16294 5.08212 2.43246 5.61955 2.83996 6.0485L5.01496 3.98225C5.01497 3.98226 5.01443 3.9817 5.01352 3.9804C5.0126 3.9791 5.01136 3.97713 5.00997 3.9744C5.00716 3.96886 5.00417 3.96097 5.00226 3.95087L2.05443 4.50791ZM2.83996 6.0485C3.24824 6.47827 3.77797 6.78038 4.36675 6.90366L4.98156 3.96734C5.00455 3.97215 5.01458 3.98185 5.01496 3.98225L2.83996 6.0485ZM4.36675 6.90366C4.95618 7.02708 5.56624 6.96294 6.11625 6.72313L4.91723 3.97316C4.93429 3.96572 4.9579 3.96238 4.98156 3.96734L4.36675 6.90366ZM6.11625 6.72313C6.66522 6.48377 7.12189 6.08404 7.43762 5.58663L4.90481 3.97888C4.90006 3.98636 4.90121 3.98014 4.91723 3.97316L6.11625 6.72313ZM7.43762 5.58663C7.75291 5.08994 7.91699 4.51357 7.91699 3.92991H4.91699C4.91699 3.95346 4.91001 3.97069 4.90481 3.97888L7.43762 5.58663ZM7.91699 3.92991C7.91699 3.14907 7.62303 2.38571 7.07736 1.81131L4.90236 3.87756C4.90245 3.87766 4.90625 3.88178 4.91016 3.89171C4.91408 3.90167 4.91699 3.91478 4.91699 3.92991H7.91699ZM7.07736 1.81131C6.52919 1.2343 5.76881 0.894819 4.95866 0.894819V3.89482C4.94206 3.89482 4.92768 3.89121 4.91723 3.88666C4.91219 3.88446 4.90848 3.88223 4.90597 3.88048C4.90345 3.8787 4.90234 3.87754 4.90236 3.87756L7.07736 1.81131ZM8.16699 11.3334H1.75033V14.3334H8.16699V11.3334ZM1.75033 11.3334C2.01899 11.3334 2.26007 11.4465 2.42535 11.6204L0.250348 13.6867C0.634417 14.091 1.17224 14.3334 1.75033 14.3334V11.3334ZM2.42535 11.6204C2.58814 11.7918 2.66699 12.0085 2.66699 12.2194H-0.333008C-0.333008 12.7559 -0.131238 13.285 0.250348 13.6867L2.42535 11.6204ZM2.66699 12.2194V10.3773H-0.333008V12.2194H2.66699ZM2.66699 10.379C2.66749 9.93816 2.83477 9.53002 3.10979 9.24053L0.934788 7.17429C0.116239 8.03592 -0.331656 9.18847 -0.333007 10.3756L2.66699 10.379ZM3.10979 9.24053C3.38233 8.95365 3.73498 8.80754 4.08555 8.8071L4.08177 5.8071C2.88581 5.80861 1.7558 6.31006 0.934788 7.17429L3.10979 9.24053ZM4.08366 8.8071H5.83366V5.8071H4.08366V8.8071ZM5.83177 8.8071C6.18234 8.80754 6.53499 8.95365 6.80753 9.24053L8.98253 7.17429C8.16151 6.31006 7.03151 5.80861 5.83555 5.8071L5.83177 8.8071ZM6.80753 9.24053C7.08254 9.53002 7.24982 9.93816 7.25033 10.379L10.2503 10.3756C10.249 9.18847 9.80108 8.03592 8.98253 7.17429L6.80753 9.24053ZM7.25033 10.3773V12.2194H10.2503V10.3773H7.25033ZM7.25033 12.2194C7.25033 12.0085 7.32918 11.7918 7.49197 11.6204L9.66697 13.6867C10.0486 13.285 10.2503 12.7559 10.2503 12.2194H7.25033ZM7.49197 11.6204C7.65725 11.4465 7.89833 11.3334 8.16699 11.3334V14.3334C8.74507 14.3334 9.2829 14.091 9.66697 13.6867L7.49197 11.6204ZM2.33366 13.1053H7.58366V10.1053H2.33366V13.1053ZM9.08366 11.6053V10.3773H6.08366V11.6053H9.08366ZM9.08366 10.3773C9.08366 9.51501 8.75897 8.67356 8.1586 8.04159L5.9836 10.1078C6.0396 10.1668 6.08366 10.2624 6.08366 10.3773H9.08366ZM8.1586 8.04159C7.55573 7.40699 6.72116 7.03517 5.83366 7.03517V10.0352C5.87441 10.0352 5.93008 10.0515 5.9836 10.1078L8.1586 8.04159ZM5.83366 7.03517H4.08366V10.0352H5.83366V7.03517ZM4.08366 7.03517C3.19616 7.03517 2.36158 7.40699 1.75872 8.04158L3.93372 10.1078C3.98724 10.0515 4.0429 10.0352 4.08366 10.0352V7.03517ZM1.75872 8.04158C1.15835 8.67356 0.833659 9.51501 0.833659 10.3773H3.83366C3.83366 10.2624 3.87772 10.1668 3.93372 10.1078L1.75872 8.04158ZM0.833659 10.3773V11.6053H3.83366V10.3773H0.833659ZM12.2503 3.96499H11.0837V6.96499H12.2503V3.96499ZM12.5837 5.46499V4.23692H9.58366V5.46499H12.5837ZM12.5837 4.23692C12.5837 3.70037 12.3819 3.17128 12.0003 2.76961L9.8253 4.83586C9.66251 4.6645 9.58366 4.44778 9.58366 4.23692H12.5837ZM12.0003 2.76961C11.6162 2.36533 11.0784 2.12289 10.5003 2.12289V5.12289C10.2317 5.12289 9.99058 5.00984 9.8253 4.83586L12.0003 2.76961ZM10.5003 2.12289C9.92224 2.12289 9.38441 2.36533 9.00035 2.76961L11.1753 4.83586C11.0101 5.00983 10.769 5.12289 10.5003 5.12289V2.12289ZM9.00035 2.76961C8.61876 3.17128 8.41699 3.70037 8.41699 4.23692H11.417C11.417 4.44778 11.3381 4.6645 11.1753 4.83586L9.00035 2.76961ZM8.41699 4.23692V5.46499H11.417V4.23692H8.41699ZM9.91699 3.96499H8.75033V6.96499H9.91699V3.96499ZM8.75033 3.96499C8.17224 3.96499 7.63441 4.20744 7.25035 4.61172L9.42535 6.67797C9.26007 6.85194 9.01899 6.96499 8.75033 6.96499V3.96499ZM7.25035 4.61172C6.86876 5.01338 6.66699 5.54247 6.66699 6.07903H9.66699C9.66699 6.28989 9.58814 6.50661 9.42535 6.67797L7.25035 4.61172ZM6.66699 6.07903C6.66699 6.61559 6.86876 7.14467 7.25035 7.54634L9.42535 5.48009C9.58814 5.65145 9.66699 5.86817 9.66699 6.07903H6.66699ZM7.25035 7.54634C7.63441 7.95062 8.17224 8.19306 8.75033 8.19306V5.19306C9.01899 5.19306 9.26007 5.30612 9.42535 5.48009L7.25035 7.54634ZM8.75033 8.19306H9.91699V5.19306H8.75033V8.19306ZM8.41699 6.69306V7.92113H11.417V6.69306H8.41699ZM8.41699 7.92113C8.41699 8.45769 8.61876 8.98678 9.00035 9.38845L11.1753 7.3222C11.3381 7.49356 11.417 7.71028 11.417 7.92113H8.41699ZM9.00035 9.38845C9.38441 9.79273 9.92224 10.0352 10.5003 10.0352V7.03517C10.769 7.03517 11.0101 7.14822 11.1753 7.3222L9.00035 9.38845ZM10.5003 10.0352C11.0784 10.0352 11.6162 9.79273 12.0003 9.38845L9.82531 7.3222C9.99058 7.14822 10.2317 7.03517 10.5003 7.03517V10.0352ZM12.0003 9.38845C12.3819 8.98678 12.5837 8.45769 12.5837 7.92113H9.58366C9.58366 7.71028 9.66251 7.49356 9.82531 7.3222L12.0003 9.38845ZM12.5837 7.92113V6.69306H9.58366V7.92113H12.5837ZM11.0837 8.19306H12.2503V5.19306H11.0837V8.19306ZM12.2503 8.19306C12.8284 8.19306 13.3662 7.95062 13.7503 7.54634L11.5753 5.48009C11.7406 5.30612 11.9817 5.19306 12.2503 5.19306V8.19306ZM13.7503 7.54634C14.1319 7.14467 14.3337 6.61559 14.3337 6.07903H11.3337C11.3337 5.86818 11.4125 5.65146 11.5753 5.48009L13.7503 7.54634ZM14.3337 6.07903C14.3337 5.54247 14.1319 5.01339 13.7503 4.61172L11.5753 6.67796C11.4125 6.5066 11.3337 6.28988 11.3337 6.07903H14.3337ZM13.7503 4.61172C13.3662 4.20743 12.8284 3.96499 12.2503 3.96499V6.96499C11.9817 6.96499 11.7406 6.85194 11.5753 6.67796L13.7503 4.61172Z"
        fill="#E1E0F5"
        mask="url(#path-1-inside-1_1319_3063)"
      />
    </svg>
  );

  const ImageIcon = () => (
    <svg
      className="m-auto"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M20 3.75H4C3.46957 3.75 2.96086 3.96071 2.58579 4.33579C2.21071 4.71086 2 5.21957 2 5.75V19.75C2 20.2804 2.21071 20.7891 2.58579 21.1642C2.96086 21.5393 3.46957 21.75 4 21.75H20C20.5304 21.75 21.0391 21.5393 21.4142 21.1642C21.7893 20.7891 22 20.2804 22 19.75V5.75C22 5.21957 21.7893 4.71086 21.4142 4.33579C21.0391 3.96071 20.5304 3.75 20 3.75ZM4 19.75V5.75H20V19.75H4Z"
        fill="#1F2A37"
      />
      <path
        d="M16.3 13.214C16.2154 13.0803 16.1003 12.9685 15.9641 12.8879C15.8279 12.8073 15.6745 12.7602 15.5166 12.7505C15.3586 12.7407 15.2006 12.7686 15.0555 12.8318C14.9104 12.895 14.7824 12.9917 14.682 13.114L13.136 15.001L10.364 10.25C10.2765 10.0902 10.1455 9.95843 9.98625 9.86995C9.82698 9.78147 9.64592 9.73988 9.464 9.75C9.28374 9.75564 9.10837 9.80992 8.95645 9.9071C8.80452 10.0043 8.68171 10.1407 8.601 10.302L5.101 17.302C5.02441 17.4548 4.98828 17.6248 4.99606 17.7955C5.00385 17.9663 5.05528 18.1322 5.14545 18.2775C5.23562 18.4227 5.36152 18.5424 5.51113 18.6251C5.66073 18.7079 5.82905 18.7508 6 18.75H18C18.1791 18.75 18.3549 18.7018 18.509 18.6106C18.6631 18.5194 18.7899 18.3885 18.8762 18.2316C18.9624 18.0746 19.0049 17.8974 18.9993 17.7184C18.9936 17.5394 18.94 17.3652 18.844 17.214L16.3 13.214Z"
        fill="#1F2A37"
      />
      <path
        d="M14.5 10.75C15.3284 10.75 16 10.0784 16 9.25C16 8.42157 15.3284 7.75 14.5 7.75C13.6716 7.75 13 8.42157 13 9.25C13 10.0784 13.6716 10.75 14.5 10.75Z"
        fill="#1F2A37"
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      className="m-auto ml-2"
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="11"
      viewBox="0 0 10 11"
      fill="none"
    >
      <path
        d="M4.99967 2.58337V5.50004M4.99967 5.50004V8.41671M4.99967 5.50004H7.91634M4.99967 5.50004H2.08301"
        stroke="#4B5563"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between py-6">
        <div className="flex flex-col gap-3 mb-4">
          <h1 className="leading-tight text-2xl font-medium">
            {inspection?.name ? inspection.name : "Map Name Here"}
          </h1>
          {/* <h3 className="text-xs">2504 East Roma Ave. Phoenix, AZ 85016</h3> */}
        </div>

        <div className="grid grid-cols-2 gap-3 align-middle">
          <InspectionDrawer
            btnText={"Edit Inspection"}
            structures={structures}
            setStructures={setStructures}
            inspection={inspection}
            currentDocuments={inspectionDocuments}
          />
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

            {activeView === "overview" && (
              <div className="justify-center gap-4 mt-3 hidden">
                <p className="text-sm font-medium">Show Only:</p>
                <div className="flex items-center gap-2">
                  <Checkbox id="cant-inspect" />
                  <Label className="text-sm font-medium" htmlFor="cant-inspect">
                    {"Can't Inspect"}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="inspected" />
                  <Label className="text-sm font-medium" htmlFor="inspected">
                    Inspected
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="uploaded" />
                  <Label className="text-sm font-medium" htmlFor="uploaded">
                    Uploaded
                  </Label>
                </div>
              </div>
            )}
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
                    <Dropdown
                      inline
                      label=""
                      placement="top"
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span>
                          <ElipseIcon />
                        </span>
                      )}
                    >
                      <Dropdown.Item>
                        <div className="flex items-center">
                          <span className="ml-2">
                            <Link href={`/inspections`}>View</Link>
                          </span>{" "}
                        </div>
                      </Dropdown.Item>
                    </Dropdown>
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
            <ApexChart
              type="radialBar"
              options={options}
              series={[activeCompletion]}
              height={450}
              width={"100%"}
            />
          </div>
        </div>

        <div className="inspection-map-box flex col-span-4 md:col-span-1 flex-col border-gray-300 bg-white gap-4 p-4 md:p-8 rounded-lg">
          <div className="flex flex-col gap-1">
            <h6 className="text-lg font-semibold">Documents</h6>
            <p className="text-base text-gray-500">Map Name 12344.89</p>
          </div>
          <div className="overflow-auto">
            <div className="grid grid-cols-2 gap-3">
              {inspectionDocuments?.map((image, index) => {
                return (
                  <div
                    key={index}
                    className="flex aspect-square relative rounded-md overflow-hidden border"
                    style={
                      isImage(`${image.attributes.url}`)
                        ? {
                            // If there's a picture, set it as the background
                            backgroundImage: `url(${ensureDomain(
                              image.attributes.url
                            )})`,
                            backgroundSize: "cover",
                          }
                        : {
                            // Otherwise, set a default background
                            backgroundColor: "bg-gray-100",
                          }
                    }
                  >
                    {!isImage(`${image.attributes.url}`) && ( // If there's no picture, show the ImageIcon
                      <ImageIcon />
                    )}
                    <div className="file-name-footer bg-white p-4 flex justify-between align-middle absolute left-0 right-0 bottom-0 mt-auto">
                      <h6 className="leading-none text-xxs">
                        {formatFileName(image.attributes.name)}
                      </h6>
                      <Dropdown
                        inline
                        label=""
                        placement="top"
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <span className="flex">
                            <ElipseIconAlt />
                          </span>
                        )}
                      >
                        <Dropdown.Item
                          onClick={(e) =>
                            downloadFileFromUrl(image.attributes.url)
                          }
                        >
                          <div className="flex items-center">
                            <span className="">Download</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <div className="flex items-center">
                            <span className="">Remove</span>
                          </div>
                        </Dropdown.Item>
                      </Dropdown>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              {structures.map((structure) =>
                structure.attributes.images.data?.map((image, index) => (
                  <div
                    key={`${structure.id}-${index}`}
                    className="aspect-square rounded-md overflow-hidden relative border"
                  >
                    <img
                      className="object-cover hover:saturate-50" // Step 2: Use the Image component
                      src={`${ensureDomain(
                        image?.attributes?.formats?.small?.url
                      )}`}
                      alt="fasfdsafdsa"
                    />
                    <div className="file-name-footer bg-white p-4 flex justify-between align-middle absolute left-0 right-0 bottom-0 mt-auto">
                      <h6 className="leading-none text-xxs">
                        {formatFileName(image.attributes.name)}
                      </h6>
                      <Dropdown
                        inline
                        label=""
                        placement="top"
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <span className="flex">
                            <ElipseIconAlt />
                          </span>
                        )}
                      >
                        <Dropdown.Item
                          onClick={(e) =>
                            downloadFileFromUrl(`${image.attributes.url}`)
                          }
                        >
                          <div className="flex items-center">
                            <span className="">Download</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <div className="flex items-center">
                            <span className="">Remove</span>
                          </div>
                        </Dropdown.Item>
                      </Dropdown>
                    </div>
                  </div>
                ))
              )}
            </div>
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

          <div className="flex justify-between pt-5 border-t mt-auto">
            <button className="text-sm text-gray-500 font-medium">Edit</button>
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

          <div className="flex justify-between pt-5 border-t mt-auto">
            <button className="text-sm text-gray-500 font-medium">Edit</button>
            <button className="flex align-middle text-sm font-semibold">
              Email Client <PlusIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
