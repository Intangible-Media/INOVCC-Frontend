"use client";

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import axios from "axios";
import { MdLocationPin } from "react-icons/md";
import "mapbox-gl/dist/mapbox-gl.css";

import qs from "qs";

export default function Page({ params }) {
  const { data: session, loading } = useSession();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState(0);
  const [zoom, setZoom] = useState(16);
  const [structures, setStructures] = useState([]);
  const [mapStyle, setMapStyle] = useState("streets-v12");

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const query = qs.stringify({
    populate: ["structures"],
  });

  const updateCenterOnClick = (longitude, latitude) => {
    setLng(longitude);
    setLat(latitude);
  };

  const getInspectionColor = (status) => {
    if (status.toLowerCase() == "inspected") return "cyan";
    if (status.toLowerCase() == "not inspected") return "yellow";
    else return "red";
  };

  const getMarkerColor = (structure) => {
    const { status } = structure.attributes;

    if (status.toLowerCase() == "inspected") return "rgb(8 145 178)";
    if (status.toLowerCase() == "not inspected") return "rgb(250 204 21)";
    else return "rgb(220 38 38)";
  };

  // Initialize map only once
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
    });

    // map.current.setPitch(50, { duration: 2000 });
  }, []);

  useEffect(() => {
    // map.current.setCenter([lng, lat]);

    map.current.easeTo({ center: [lng, lat], zoom: 18, duration: 1000 });

    // map.current.panTo([lng, lat], { duration: 1000 });

    // map.current.setZoom(20);
  }, [lng, lat]);

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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div
          ref={mapContainer}
          className="map-container flex col-span-2 rounded-lg"
        >
          <div
            data-dial-init=""
            className="map-speed-dial end-6 bottom-6 group"
            onMouseOver={() => setIsOpen(true)}
            onMouseOut={() => setIsOpen(false)}
          >
            <div
              id="speed-dial-menu-vertical"
              className={`flex flex-col items-center ${
                !isOpen && "hidden"
              } mb-4 space-y-2`}
            >
              <button
                type="button"
                data-tooltip-target="tooltip-share"
                data-tooltip-placement="left"
                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M14.419 10.581a3.564 3.564 0 0 0-2.574 1.1l-4.756-2.49a3.54 3.54 0 0 0 .072-.71 3.55 3.55 0 0 0-.043-.428L11.67 6.1a3.56 3.56 0 1 0-.831-2.265c.006.143.02.286.043.428L6.33 6.218a3.573 3.573 0 1 0-.175 4.743l4.756 2.491a3.58 3.58 0 1 0 3.508-2.871Z" />
                </svg>
                <span className="sr-only">Share</span>
              </button>
              <div
                id="tooltip-share"
                role="tooltip"
                className="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                Share
                <div className="tooltip-arrow" data-popper-arrow="" />
              </div>
              <button
                type="button"
                data-tooltip-target="tooltip-print"
                data-tooltip-placement="left"
                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 20h10a1 1 0 0 0 1-1v-5H4v5a1 1 0 0 0 1 1Z" />
                  <path d="M18 7H2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-1-2V2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3h14Z" />
                </svg>
                <span className="sr-only">Print</span>
              </button>
              <div
                id="tooltip-print"
                role="tooltip"
                className="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                Print
                <div className="tooltip-arrow" data-popper-arrow="" />
              </div>
              <button
                type="button"
                data-tooltip-target="tooltip-download"
                data-tooltip-placement="left"
                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z" />
                  <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Download</span>
              </button>
              <div
                id="tooltip-download"
                role="tooltip"
                className="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                Download
                <div className="tooltip-arrow" data-popper-arrow="" />
              </div>
              <button
                type="button"
                data-tooltip-target="tooltip-copy"
                data-tooltip-placement="left"
                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 dark:hover:text-white shadow-sm dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 20"
                >
                  <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z" />
                  <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z" />
                </svg>
                <span className="sr-only">Copy</span>
              </button>
              <div
                id="tooltip-copy"
                role="tooltip"
                className="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
              >
                Copy
                <div className="tooltip-arrow" data-popper-arrow="" />
              </div>
            </div>
            <button
              type="button"
              data-dial-toggle="speed-dial-menu-vertical"
              aria-controls="speed-dial-menu-vertical"
              aria-expanded="false"
              className="flex items-center justify-center text-black bg-white rounded-full w-14 h-14 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-45"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 1v16M1 9h16"
                />
              </svg>
              <span className="sr-only">Open actions menu</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-lg border-gray-300 dark:border-gray-600 bg-white map-stuctures-container p-8">
          <div className="im-snapping overflow-x-auto w-full">
            {structures.map((structure, index) => (
              <div
                key={`${structure.id}-${index}`}
                className="flex flex-col items-center bg-white border-2 border-gray-100 rounded-lg md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-2"
                onClick={(e) => {
                  e.preventDefault();
                  updateCenterOnClick(
                    structure.attributes.longitude,
                    structure.attributes.latitude
                  );
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
    </>
  );
}
