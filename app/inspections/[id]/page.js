"use client";

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"
import { useSession } from "next-auth/react";
import axios from "axios";
import { MdLocationPin } from "react-icons/md";

import qs from "qs";

export default function Page({ params }) {
  const { data: session, loading } = useSession();

  const mapContainer = useRef(null);

  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [lng, setLng] = useState(-112.02199);
  const [lat, setLat] = useState(33.50154);
  const [zoom, setZoom] = useState(15);
  const [structures, setStructures] = useState([]);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  const query = qs.stringify({
    populate: ["structures"],
  });

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/intangible-media/clpaieybn001e01pxcw507frn`,
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker()
      .setLngLat([-112.02199, 33.50154])
      .addTo(map.current);

    // Create a default Marker, colored black, rotated 45 degrees.
    const marker2 = new mapboxgl.Marker({ color: "black", rotation: 45 })
      .setLngLat([12.65147, 55.608166])
      .addTo(map.current);
  }, []);

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
          console.log(response.data.data.attributes.structures.data);
          setStructures(response.data.data.attributes.structures.data);
        } catch (error) {
          console.error("Error fetching data", error.response || error);
        }
      }
    };

    fetchData();
  }, [session]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div
          ref={mapContainer}
          className="map-container flex col-span-2 rounded-lg"
        />

        <div className="flex flex-col items-center rounded-lg border-gray-300 dark:border-gray-600 bg-white h-96 p-8">
          <div className=" overflow-x-auto w-full">
            {structures.map((structure) => (
              <div className="flex flex-col items-center bg-white border-2 border-gray-100 rounded-lg md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 mb-2">
                <MdLocationPin
                  className="text-sky-500	"
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
                    <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
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
