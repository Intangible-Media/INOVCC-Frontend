"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import axios from "axios";
import dynamic from "next/dynamic";
import { MdLocationPin } from "react-icons/md";
import DownloadImage from "../../../components/DownloadImage";
import { TextInput, Badge, Button } from "flowbite-react";
import DirectionsComponent from "../../../components/DirectionsComponent";
import qs from "qs";
import "mapbox-gl/dist/mapbox-gl.css";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [openImages, setOpenImages] = useState(true);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [lng, setLng] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(16);
  const [structureSearch, setStructureSearch] = useState("");
  const [structures, setStructures] = useState([]);
  const [structureImages, setStructureImages] = useState([]);
  const [structureDocuments, setStructureDocuments] = useState([]);
  const [structureInspectors, setStructureInspectors] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showSateliteLayer, setShowSateliteLayer] = useState(false);
  const [activeMapStyle, setActiveMapStyle] = useState("3d");
  const [directions, setDirections] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    State: "",
    city: "",
    address: "",
    zipCode: "",
  });

  const [chartSeries, setChartSeries] = useState([]);

  const activeMapStyleTab =
    "text-white bg-cyan-400 dark:bg-gray-300 dark:text-gray-900";
  const inactiveMapStyleTab =
    "text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700";

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const option = {
    chart: {
      id: "apexchart-example",
      width: "100%",
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
  };

  const query = qs.stringify({
    populate: {
      structures: {
        populate: "*",
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

  const processStructureData = (structureData) => {
    const structureCountsByMonth = structureData.reduce((acc, structure) => {
      const month = new Date(structure.attributes.inspectionDate).getMonth();
      const type = structure.attributes.type;

      if (!acc[type]) {
        acc[type] = Array(12).fill(0);
      }

      acc[type][month]++;
      return acc;
    }, {});

    const series = Object.entries(structureCountsByMonth).map(
      ([name, data]) => ({
        name,
        data,
      })
    );

    setChartSeries(series);
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
      colors: ["#ffffff"],
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
            background: "rgba(255,255,255, .3)",
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
              color: "#ffffff",
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          gradientToColors: ["#ffffff"],
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
        className={`bg-${getInspectionColor(
          structure.attributes.status
        )}-100 text-${getInspectionColor(
          structure.attributes.status
        )}-700 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
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

  const toggleSatelliteLayer = () => {
    if (map.current.getLayer("satellite")) {
      const visibility = map.current.getLayoutProperty(
        "satellite",
        "visibility"
      );

      // Toggle the layer visibility by changing the layout property
      if (visibility === "visible") {
        // map.current.setPitch(50, { duration: 500 });
        map.current.setLayoutProperty("satellite", "visibility", "none");
        setActiveMapStyle("3d");
      } else {
        map.current.setLayoutProperty("satellite", "visibility", "visible");
        map.current.setPitch(0, { duration: 500 });
        setActiveMapStyle("satelite");
      }
    }
  };

  const removeSateliteLayer = () => {
    if (map.current.getLayer("satellite")) {
      map.current.removeLayer("satellite");
      // Also remove the source if it's not used by any other layers
      if (map.current.getSource("satellite-source")) {
        map.current.removeSource("satellite-source");
      }
    }
  };

  const changeMarkerStyle = (structureId, newColor) => {
    const marker = markerRefs.current[structureId];

    if (marker) {
      const markerElement = marker.getElement();
      markerElement.style.width = "50px";
      markerElement.style.height = "50px";
    }
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard-beta", // Use your custom style URL
      center: [lng, lat],
      zoom: zoom,
      pitch: 50, // Set the initial pitch
    });

    map.current.on("style.load", () => {
      map.current.setFog({}); // Optional: set the fog to enhance the 3D effect

      map.current.easeTo({
        padding: {
          right: 450,
        },
      });

      // Add the satellite layer with initial visibility set to 'none'
      addSateliteLayer();

      // Add a street layer or other layers here if needed

      // Event listener for clicks on the map
      map.current.on("click", (e) => {
        createMarker(e.lngLat.lng, e.lngLat.lat);
      });

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
            // If you want to initialize the layer as invisible, set 'visibility': 'none'
            visibility: "visible",
          },
        });
      }

      const MIN_TRAFFIC_ZOOM_LEVEL = 17; // Set your desired minimum zoom level

      map.current.on("zoom", () => {
        const currentZoom = map.current.getZoom();
        console.log(currentZoom);
        if (currentZoom >= MIN_TRAFFIC_ZOOM_LEVEL) {
          // Show the traffic layer when zoomed in
          console.log("this is true");
          map.current.setLayoutProperty("traffic", "visibility", "visible");
        } else {
          console.log("this is NOT true");
          // Hide the traffic layer when zoomed out
          map.current.setLayoutProperty("traffic", "visibility", "none");
        }
      });
    });

    // Define the createMarker function inside useEffect
    const createMarker = (markerLng, markerLat) => {
      const el = document.createElement("div");
      el.className = "im-marker";
      el.style.color = "rgb(250 204 21)";

      new mapboxgl.Marker(el)
        .setLngLat([markerLng, markerLat])
        .addTo(map.current);

      map.current.easeTo({
        center: [markerLng, markerLat],
        zoom: 18,
        duration: 1000,
      });
    };

    // Define addSateliteLayer inside useEffect
    function addSateliteLayer() {
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
  }, []);

  const markerRefs = useRef({});

  useEffect(() => {
    structures.forEach((structure) => {
      const el = document.createElement("div");
      el.className = "im-marker";
      el.style.color = getMarkerColor(structure);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([
          structure.attributes.longitude,
          structure.attributes.latitude,
        ])
        .addTo(map.current);

      markerRefs.current[structure.id] = marker;

      // Log each marker stored
    });

    map.current.easeTo({
      center: [lng, lat],
      zoom: 18,
      duration: 0,
    });
  }, [map.current, structures]); // Add 'structures' as a dependency if it's dynamic

  useEffect(() => {
    // Function to animate the map and get location details
    const updateMapAndLocation = async () => {
      map.current.easeTo({ center: [lng, lat], zoom: 18, duration: 1000 });
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
    processStructureData(structures);
  }, [structures]);

  // Fetch structures and add markers
  useEffect(() => {
    const fetchData = async () => {
      if (session?.accessToken) {
        try {
          const response = await axios.get(
            `http://localhost:1337/api/inspections/${params.id}?${query}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          const structuresData = response.data.data.attributes.structures.data;
          setStructures(structuresData);
          setLng(structuresData[0].attributes.longitude);
          setLat(structuresData[0].attributes.latitude);

          // Add a marker for each structure
          structuresData.map((structure) => {
            const el = document.createElement("div");
            el.className = "im-marker";
            el.style.color = getMarkerColor(structure);

            new mapboxgl.Marker(el)
              .setLngLat([
                structure.attributes.longitude,
                structure.attributes.latitude,
              ])
              .addTo(map.current);
          });
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session, params.id, query]); // Make sure to add `params.id` and `query` as dependencies if they can change

  useEffect(() => {
    if (showSateliteLayer) return addSateliteLayer();
    return removeSateliteLayer();
  }, [showSateliteLayer]);

  return (
    <>
      <div
        ref={mapContainer}
        className="map-container col-span-3 relative overflow-hidden p-4 mb-4 border-gray-300 dark:border-gray-600 bg-white rounded-lg"
      >
        <div
          className="grid max-w-xs grid-cols-2 gap-1 p-1 mx-auto my-2 bg-white rounded-lg dark:bg-gray-600 absolute left-8 bottom-4 z-50"
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

        <div className="map-structure-panel flex flex-col items-center border-gray-300 dark:border-gray-600 bg-white p-8 w-full z-50 h-32 rounded-lg absolute right-8 top-8 bottom-8">
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
                className="flex flex-row items-center bg-white border-2 border-gray-100 rounded-lg md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-2"
                onClick={(e) => {
                  e.preventDefault();
                  updateCenterOnClick(
                    structure.attributes.longitude,
                    structure.attributes.latitude
                  );
                  getStructureData(structure);
                  setSelectedStructure(structure);
                  changeMarkerStyle(structure.id, "green");
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
                  <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {structure.attributes.mapSection}
                    <span className="font-light">
                      {" - "}
                      {structure.attributes.type}
                    </span>
                  </h5>
                  <p className="font-normal text-gray-700 dark:text-gray-400">
                    <span
                      className={`bg-${getInspectionColor(
                        structure.attributes.status
                      )}-100 text-${getInspectionColor(
                        structure.attributes.status
                      )}-700 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300`}
                    >
                      {structure.attributes.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="col-span-2 flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg"></div>

        <div className="overflow-x-auto whitespace-nowrap col-span-3">
          <div className="structures-container inline-flex gap-4">
            {renderProgressBars(structures)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col border-gray-300 dark:border-gray-600 bg-white gap-4 p-8 rounded-lg">
          <p className="flex items-center gap-2 text-lg font-semibold mr-auto">
            Details{" "}
            {selectedStructure && (
              <SelectedStructureBadge structure={selectedStructure} />
            )}
          </p>

          <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
            <div className="flex flex-col pb-3">
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
            {structureInspectors.map((inspector) => (
              <li
                className="p-4 border border-1 rounded-lg hover:bg-gray-200"
                key={inspector}
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
                    src={`http://localhost:1337${image.attributes.formats.thumbnail.url}`}
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
                    src={`http://localhost:1337${image.attributes.url}`}
                    filename={"somehting"}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
