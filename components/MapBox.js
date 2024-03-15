import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapBox = ({ containerId, marker }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return; // Initialize map only once and ensure container is present

    mapboxgl.accessToken =
      "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

    console.log("marker", marker);

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard-beta",
      zoom: 15,
      center: marker,
      pitch: 50,
    });

    //new mapboxgl.Marker().setLngLat(marker).addTo(mapRef.current);

    mapRef.current.on("load", () => {
      mapRef.current.setFog({});
      mapRef.current.setConfigProperty("basemap", "lightPreset", "day");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => mapRef.current.resize(), 0);

    new mapboxgl.Marker().setLngLat(marker).addTo(mapRef.current);

    mapRef.current.easeTo({
      center: marker,
      zoom: 15,
      pitch: 50,
    });
  });

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="map-container-sm col-span-3 relative overflow-hidden p-4 border-white border-2 dark:border-gray-600 bg-white rounded-lg"
      style={{ height: "15rem", width: "100%" }} // Ensure the container has dimensions
    ></div>
  );
};

export default MapBox;
