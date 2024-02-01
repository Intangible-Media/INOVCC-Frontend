import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapBox = ({ containerId, center, onStyleLoad }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return; // Initialize map only once and ensure container is present

    mapboxgl.accessToken =
      "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/standard-beta",
      center: center,
      zoom: 15,
      pitch: 50,
    });

    map.on("load", () => {
      map.setFog({});
      map.setConfigProperty("basemap", "lightPreset", "day");

      const isPhone = window.matchMedia("(max-width: 550px)").matches;

      if (onStyleLoad) {
        onStyleLoad(map);
      }
    });

    mapRef.current = map;

    // return () => {
    //   map.remove();
    // };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
