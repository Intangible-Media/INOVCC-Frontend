// components/MapboxMap.js

"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSelectedStructure } from "../context/SelectedStructureContext";
import { getLocationDetails } from "../utils/api/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const iconMap = {
  red: "/location-red.png",
  yellow: "/location-yellow.png",
  drkgreen: "/location-dark.png",
  green: "/location-green.png",
};

const loadIcon = (color) => iconMap[color] || "/location-red.png";

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

const MapboxMap = ({ coordinates = [] }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [center, setCenter] = useState([0, 0]);
  const { selectedStructure, setSelectedStructure } = useSelectedStructure();

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    const { longitude, latitude } = selectedStructure?.attributes || {};

    // Determine the center, falling back to the default center if necessary
    const mapCenter =
      longitude != null && latitude != null ? [longitude, latitude] : center;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard-beta",
      center: mapCenter,
      zoom: 10,
      pitch: 50,
    });

    map.current.on("style.load", () => {
      map.current.setFog({});
      const isPhone = window.matchMedia("(max-width: 550px)").matches;
      const padding = isPhone ? { bottom: 400 } : { right: 400 };
      // map.current.easeTo({ padding: padding });
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        map.current.easeTo({
          zoom: 18,
          // padding: { left: 300 },
          center: [longitude, latitude],
          duration: 1000,
        });
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
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (coordinates.length === 0) return;

    // Function to execute map operations
    const executeMapOperations = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser");
        return;
      }

      coordinates.forEach((structure) => {
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
        features: coordinates.map((structure) => {
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

    if (map.current.isStyleLoaded()) {
      executeMapOperations();
    } else {
      map.current.on("load", executeMapOperations);
    }

    return () => {
      if (map.current) {
        map.current.off("load", executeMapOperations);
      }
    };
  }, [coordinates]);

  useEffect(() => {
    if (!map.current) return;
    if (!selectedStructure) return;

    const { longitude, latitude } = selectedStructure.attributes;

    const mapCenter = longitude && latitude ? [longitude, latitude] : center;

    map.current.easeTo({
      zoom: 18,
      // padding: { left: 300 },
      center: mapCenter,
      duration: 1000,
    });
  }, [selectedStructure]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
        className="relative"
      />
    </div>
  );
};

export default MapboxMap;
