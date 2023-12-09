"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import axios from "axios";
import dynamic from "next/dynamic";
import { MdLocationPin } from "react-icons/md";
import DownloadImage from "../../../components/DownloadImage";
import { TextInput, Badge, Tooltip, Breadcrumb } from "flowbite-react";
import DirectionsComponent from "../../../components/DirectionsComponent";
import qs from "qs";
import "mapbox-gl/dist/mapbox-gl.css";
import StructureDrawer from "../../../components/Drawers/StructureDrawer";
import AuthorizedWrapper from "../../../components/Auth/AuthorizationWrapper";
import { Butcherman } from "next/font/google";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: true });

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(10);
  const [structureSearch, setStructureSearch] = useState("");
  const [structures, setStructures] = useState([]);
  const [structureImages, setStructureImages] = useState([]);
  const [structureDocuments, setStructureDocuments] = useState([]);
  const [structureInspectors, setStructureInspectors] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [activeMapStyle, setActiveMapStyle] = useState("3d");
  const [directions, setDirections] = useState(null);
  const [inspectionReport, setInspectionReport] = useState("");
  const [client, setClient] = useState({
    name: "",
    contacts: [],
  });
  const [locationDetails, setLocationDetails] = useState({
    State: "",
    city: "",
    address: "",
    zipCode: "",
  });

  const activeMapStyleTab =
    "text-white bg-cyan-400 dark:bg-gray-300 dark:text-gray-900";
  const inactiveMapStyleTab =
    "text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700";

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const query = qs.stringify({
    populate: {
      structures: {
        populate: "*",
      },
      client: {
        populate: ["contacts"],
      },
    },
  });

  const getLocationDetails = async (longitude, latitude) => {
    const endpoint = "mapbox.places"; // or 'mapbox.places-permanent'
    const accessToken =
      "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q"; // Replace with your Mapbox access token
    const url = `https://api.mapbox.com/geocoding/v5/${endpoint}/${longitude},${latitude}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Extracting city, state, address, and zip code from the response
      const place = data.features.find((feature) =>
        feature.place_type.includes("place")
      ); // City
      const region = data.features.find((feature) =>
        feature.place_type.includes("region")
      ); // State
      const address = data.features.find((feature) =>
        feature.place_type.includes("address")
      ); // Address
      const postcode = data.features.find((feature) =>
        feature.place_type.includes("postcode")
      ); // Zip Code

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

  const filterStructures = (searchTerm) => {
    return structures.filter((structure) => {
      const attributes = structure.attributes;
      return (
        attributes.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attributes.mapSection
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        attributes.type.toLowerCase().includes(searchTerm.toLowerCase())
        // Add more fields to check if needed
      );
    });
  };

  const updateCenterOnClick = (longitude, latitude) => {
    setLng(longitude);
    setLat(latitude);
  };

  const getStructureData = (structure) => {
    const images = structure.attributes.images.data || [];
    const files = structure.attributes.documents.data || [];
    const inspectors = structure.attributes.inspectors.data || [];

    setStructureImages(images);
    setStructureDocuments(files);
    setStructureInspectors(inspectors);
  };

  const getInspectionColor = (status) => {
    if (status.toLowerCase() == "inspected") return "cyan";
    if (status.toLowerCase() == "not inspected") return "yellow";
    else return "red";
  };

  const getMarkerColor = (structure) => {
    const { status } = structure.attributes;

    if (status.toLowerCase() == "inspected") return "#27A9EF";
    if (status.toLowerCase() == "not inspected") return "rgb(250 204 21)";
    else return "rgb(220 38 38)";
  };

  const filteredStructures = filterStructures(structureSearch);

  const calculateTypeFrequencies = (structures) => {
    const typeCounts = structures.reduce((acc, structure) => {
      // Extract type and status from the structure's attributes
      const type = structure.attributes.type.toLowerCase().replace(/ /g, "-");
      const status = structure.attributes.status;

      // Initialize the object for the type if it doesn't exist
      if (!acc[type]) {
        acc[type] = { totalOfType: 0, totalInspected: 0 };
      }

      // Increment the total count for this type
      acc[type].totalOfType++;

      // Increment the inspected count if the structure's status is 'inspected'
      if (status === "Inspected") {
        // Assuming 'Inspected' is the exact string to check
        acc[type].totalInspected++;
      }

      return acc;
    }, {});

    return typeCounts;
  };

  const SemiCircleGauge = ({ value, type }) => {
    const chartOptions = {
      chart: {
        type: "radialBar",
      },
      colors: ["#33abef"],
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            margin: 0,
            size: "55%",
            background: "transparent",
          },
          track: {
            background: "#f5f5f5",
            startAngle: -135,
            endAngle: 135,
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: "15px",
            },
            value: {
              fontSize: "15px",
              show: true,
              color: "#33abef",
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          gradientToColors: ["#33abef"],
          stops: [0, 100],
        },
      },
      stroke: {
        lineCap: "round",
      },
      labels: [
        `${type
          .replace(/-/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}`,
      ],
    };
    // Since the import is dynamic, we need to check if ApexChart is not undefined
    return (
      <ApexChart
        type="radialBar"
        options={chartOptions}
        series={[value]}
        height={240}
        width={"100%"}
      />
    );
  };

  const SelectedStructureBadge = ({ structure }) => {
    return (
      <Badge
        color="info"
        className={`bg-orange-400 text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
      >
        {structure.attributes.mapSection}
      </Badge>
    );
  };

  const renderProgressBars = (structures) => {
    const typeFrequencies = calculateTypeFrequencies(structures);

    const progressBars = useMemo(() => {
      return Object.entries(typeFrequencies).map(([type, data]) => {
        // Calculate progress as the ratio of inspected structures to total structures of that type
        const progress =
          data.totalOfType > 0
            ? Math.round((data.totalInspected / data.totalOfType) * 100)
            : 0;

        return (
          <div
            key={type}
            className={`structure-graph flex flex-col justify-center border-gray-300 dark:border-gray-600 bg-white gap-4 p-4 rounded-lg aspect-square w-56`}
          >
            <SemiCircleGauge type={type} value={progress} />
          </div>
        );
      });
    }, [structures]); // Depend on structures to update when data changes

    return progressBars;
  };

  function InspectionReport({ reportText }) {
    const formattedText = reportText.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));

    return (
      <div>
        <h2>Inspection Report</h2>
        <div>{formattedText}</div>
      </div>
    );
  }

  function createColoredMarkerSVG(svg, color) {
    // Replace the fill color in the SVG
    return svg.replace(/fill="currentColor"/g, `fill="${color}"`);
  }

  function getColorBasedOnStatus(status) {
    switch (status) {
      case "Not Inspected":
        return "rgb(253 224 71)"; // Red
      case "Inspected":
        return "#27A9EF"; // Green
      default:
        return "#ff0000"; // Black or any default color
    }
  }

  const toggleSatelliteLayer = () => {
    if (map.current && map.current.getLayer("satellite")) {
      const visibility = map.current.getLayoutProperty(
        "satellite",
        "visibility"
      );

      if (visibility === "visible") {
        map.current.setLayoutProperty("satellite", "visibility", "none");
        setActiveMapStyle("3d");
      } else {
        map.current.setLayoutProperty("satellite", "visibility", "visible");
        setActiveMapStyle("satelite");
      }
    } else {
      console.warn("Satellite layer not found on the map.");
    }
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard-beta",
      center: [lng, lat],
      zoom: zoom,
      pitch: 50,
    });

    map.current.on("style.load", () => {
      map.current.setFog({});
      map.current.setConfigProperty("basemap", "lightPreset", "day");

      const isPhone = window.matchMedia("(max-width: 550px)").matches;

      // Set padding based on device type
      const padding = isPhone ? { bottom: 400 } : { right: 400 };

      map.current.easeTo({ padding: padding });

      // Function to add a satellite layer
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

      // Add the satellite layer
      addSatelliteLayer();

      // Add the traffic layer
      addTrafficLayer();

      // Add zoom level event handling for traffic layer
      addZoomEvent();
    });
  }, [lng, lat, zoom]);

  // Separate useEffect for the marker layer
  useEffect(() => {
    if (!map.current || structures.length === 0) return;

    fetch("/location-pin.svg")
      .then((response) => response.text())
      .then((svg) => {
        structures.forEach((structure) => {
          const color = getColorBasedOnStatus(structure.attributes.status);
          const coloredSVG = createColoredMarkerSVG(svg, color);

          const blob = new Blob([coloredSVG], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const image = new Image();
          image.src = url;

          image.onload = () => {
            const imageName = `profile-icon-${structure.id}`;

            // Check if the image already exists on the map
            if (map.current.hasImage(imageName)) {
              // Optionally remove the existing image
              map.current.removeImage(imageName);
            }

            map.current.addImage(imageName, image);
            URL.revokeObjectURL(url);
          };
        });

        const geojsonData = {
          type: "FeatureCollection",
          features: structures.map((structure) => ({
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
              icon: `profile-icon-${structure.id}`,
            },
          })),
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
              "icon-size": 1.5, // Adjust icon size as needed
            },
          });
        }
      })
      .catch((error) => console.error("Error loading SVG:", error));
  }, [structures]);

  useEffect(() => {
    if (!map.current) return;

    const onMarkerClick = (e) => {
      const markerId = e.features[0].properties.id;
      // Handle marker click event
    };

    map.current.on("click", "marker-layer", onMarkerClick);

    return () => {
      map.current.off("click", "marker-layer", onMarkerClick);
    };
  }, [map.current]);

  useEffect(() => {
    // Function to animate the map and get location details
    const updateMapAndLocation = async () => {
      // Determine if the device is a phone or not
      const isPhone = window.matchMedia("(max-width: 550px)").matches;
      // Set padding based on device type
      const padding = isPhone ? { bottom: 400 } : { right: 450 };

      map.current.easeTo({
        padding: padding,
        center: [lng, lat],
        zoom: 16,
        duration: 1000,
      });

      try {
        const locationDetails = await getLocationDetails(lng, lat);
      } catch (error) {
        console.error("Error getting location details:", error);
      }
    };

    const fetchLocationDetails = async () => {
      const details = await getLocationDetails(lng, lat);
      setLocationDetails(details);
    };

    // Call the async function
    updateMapAndLocation();
    fetchLocationDetails();
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
          const clientName =
            response.data.data.attributes.client.data.attributes.name;
          const clientContacts =
            response.data.data.attributes.client.data.attributes.contacts.data;

          setStructures(structuresData);
          setClient({
            name: clientName,
            contacts: clientContacts,
          });

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
    // Function to fetch data
    const fetchData = async () => {
      if (session?.accessToken) {
        window.alert("This is running again ");
        try {
          const inspectionReportResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${params.id}/report`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          setInspectionReport(
            inspectionReportResponse.data.choices[0].message.content
          );
          // Cache the data
          localStorage.setItem(
            `inspectionReport_${params.id}`,
            JSON.stringify(
              inspectionReportResponse.data.choices[0].message.content
            )
          );
          console.log(inspectionReportResponse.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    // Check if the data is already in the cache
    const cachedData = localStorage.getItem(`inspectionReport_${params.id}`);
    if (cachedData) {
      setInspectionReport(JSON.parse(cachedData));
    } else {
      fetchData();
    }
  }, [session, params.id]);

  useEffect(() => {
    if (!map.current || !selectedStructure) return;

    if (
      map.current.getLayer("marker-layer") &&
      map.current.getSource("markers")
    ) {
      map.current.setLayoutProperty("marker-layer", "icon-size", [
        "case",
        ["==", ["get", "id"], selectedStructure.id],
        2, // Larger size for selected structure
        1.5, // Normal size
      ]);
    }
  }, [selectedStructure]);

  return (
    <>
      <div
        ref={mapContainer}
        className="map-container col-span-3 relative overflow-hidden p-4 mb-4 border-gray-300 dark:border-gray-600 bg-white rounded-lg"
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

        <div className="map-structure-panel shadow-sm flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white p-8 w-full z-10 h-32 rounded-lg absolute right-8 top-8 bottom-8">
          <TextInput
            id="small"
            type="text"
            placeholder="Search Structures"
            sizing="md"
            className="w-full mb-6"
            value={structureSearch}
            onChange={(e) => setStructureSearch(e.target.value)}
          />

          <div className="im-snapping overflow-x-auto w-full">
            {filteredStructures.map((structure, index) => (
              <div
                key={`${structure.id}-${index}`}
                className={`flex flex-row items-center bg-white border-2 border-gray-100 rounded-lg md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-2 ${
                  selectedStructure &&
                  selectedStructure.id === structure.id &&
                  "active-structure"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  updateCenterOnClick(
                    structure.attributes.longitude,
                    structure.attributes.latitude
                  );
                  getStructureData(structure);
                  setSelectedStructure(structure);
                }}
              >
                <MdLocationPin
                  className={`bg-${getInspectionColor(
                    structure.attributes.status
                  )}-100 text-${getInspectionColor(
                    structure.attributes.status
                  )}-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
                  style={{ width: 40, height: 40 }}
                />

                <div className="flex flex-col justify-between pt-0 pb-0 pl-4 pr-4 leading-normal w-full">
                  <h5 className="flex mb-2 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                    {structure.attributes.mapSection}
                    <span className="flex items-center font-light ml-1">
                      {` - ${structure.attributes.type}`}
                    </span>
                  </h5>
                  <p className="flex text-sm text-gray-700 dark:text-gray-400">
                    <span
                      className={`bg-${getInspectionColor(
                        structure.attributes.status
                      )}-100 text-${getInspectionColor(
                        structure.attributes.status
                      )}-700 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
                    >
                      {structure.attributes.status}
                    </span>

                    {selectedStructure && (
                      <>
                        {selectedStructure.id === structure.id && (
                          <Badge
                            color="info"
                            className={`bg-orange-400 text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 ml-1`}
                          >
                            Active
                          </Badge>
                        )}
                      </>
                    )}
                  </p>
                </div>
                {selectedStructure?.id === structure.id && (
                  <StructureDrawer structure={selectedStructure} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mb-0 mr-auto">
            Client
          </p>

          <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
            <div className="flex flex-col pb-3">
              <dd className="text-md font-semibold">{client.name}</dd>
            </div>
          </dl>
          <div>
            <div className="flex -space-x-2 overflow-hidden">
              {client.contacts.map((contact) => (
                <Tooltip
                  key={contact.attributes.username}
                  content={contact.attributes.username}
                  animation="duration-300"
                >
                  <img
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mb-0 mr-auto">
            Documents
          </p>
          <div className="grid grid-cols-4 gap-2">
            {structureDocuments.length === 0 ? (
              <div className="animate-pulse">
                <svg
                  className="h-full w-full text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            ) : (
              <>
                {structureDocuments.map((image) => (
                  <DownloadImage
                    key={`${image.attributes.name}`}
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.url}`}
                    filename={"somehting"}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto whitespace-nowrap col-span-3 md:col-span-1">
          <div className="structures-container inline-flex gap-4">
            {renderProgressBars(structures)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg mb-4">
          <p className="flex items-center gap-2 text-lg font-semibold mr-auto">
            Details{" "}
            {selectedStructure && (
              <SelectedStructureBadge structure={selectedStructure} />
            )}
          </p>

          <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
            <div className="flex flex-col ">
              <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                Address
              </dt>
              <dd className="text-md font-semibold">
                {locationDetails.address}
              </dd>
            </div>
            <div className="flex flex-col pt-3">
              <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                City, State
              </dt>
              <dd className="text-md font-semibold">
                {locationDetails.city}, {locationDetails.State},{" "}
                {locationDetails.zipCode}
              </dd>
            </div>
            {selectedStructure && (
              <DirectionsComponent
                destinationLongitude={selectedStructure.attributes.longitude}
                destinationLatitude={selectedStructure.attributes.latitude}
              />
            )}
          </dl>
        </div>

        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 mb-4 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mr-auto">
            Inspectors{" "}
            {selectedStructure && (
              <SelectedStructureBadge structure={selectedStructure} />
            )}
          </p>

          <ul className="max-w-md flex flex-col gap-4 divide-gray-200 dark:divide-gray-700">
            {structureInspectors.map((inspector, index) => (
              <li
                className="p-4 border border-1 rounded-lg hover:bg-gray-200"
                key={`${inspector.attributes.username}-${index}`}
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <img
                      className="w-12 h-12 rounded-full"
                      src="/profile.png"
                      alt="Neil image"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {inspector.attributes.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {inspector.attributes.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-6 p-8 mb-4 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mb-0 mr-auto">
            Assets{" "}
            {selectedStructure && (
              <SelectedStructureBadge structure={selectedStructure} />
            )}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {structureImages.length === 0 ? (
              <div className="animate-pulse">
                <svg
                  className="h-full w-full text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            ) : (
              <>
                {structureImages.map((image) => (
                  <DownloadImage
                    key={`${image.attributes.name}`}
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.formats.thumbnail.url}`}
                    filename={"somehting"}
                  />
                ))}
              </>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {structureDocuments.length === 0 ? (
              <div className="animate-pulse">
                <svg
                  className="h-full w-full text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            ) : (
              <>
                {structureDocuments.map((image) => (
                  <DownloadImage
                    key={`${image.attributes.name}`}
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${image.attributes.url}`}
                    filename={"somehting"}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex col-span-4 md:col-span-1 flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mr-auto">
            Inspection Report
          </p>
          <InspectionReport reportText={inspectionReport} />
        </div>
      </div>
    </>
  );
}
