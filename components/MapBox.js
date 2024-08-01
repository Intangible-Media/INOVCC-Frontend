// components/MapboxMap.js

"use client";

import React, { useRef, useEffect, useState } from "react";
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

const MapboxMap = ({
  lng,
  lat,
  zoom = 10,
  style = "mapbox://styles/mapbox/streets-v11",
  coordinates = [],
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [center, setCenter] = useState([lng, lat]);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedStructure, setSelectedStructure] = useState(null);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

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
      const isPhone = window.matchMedia("(max-width: 550px)").matches;
      const padding = isPhone ? { bottom: 400 } : { right: 400 };
      // map.current.easeTo({ padding: padding });

      // Add traffic layer and zoom event
      addTrafficLayer();
      addZoomEvent();
    });

    // return () => {
    //   map.current.remove();
    // };
  }, [lng, lat, style, zoom]);

  useEffect(() => {
    if (!map.current) return;
    if (coordinates.length === 0) return;

    // Function to execute map operations
    const executeMapOperations = () => {
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

    const executeMapOperationsold = () => {
      coordinates.forEach(([lng, lat]) => {
        new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
      });

      const geojsonData = {
        type: "FeatureCollection",
        features: coordinates.map(([lng, lat], index) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          properties: {
            id: index,
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
            "icon-image": "marker-15",
            "icon-size": 1,
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

  const addTrafficLayer = () => {
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
            "#000000",
          ],
        },
        layout: {
          visibility: "visible",
        },
      });
    }
  };

  const addZoomEvent = () => {
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
  };

  useEffect(() => {
    if (!map.current) return;

    const isPhone = window.matchMedia("(max-width: 550px)").matches;
    const padding = isPhone ? { bottom: 400 } : { right: 450 };

    map.current.easeTo({
      zoom: 18,
      // padding: { left: 300 },
      center: [lng, lat],
      duration: 1000,
    });

    getLocationDetails(lng, lat).catch((error) => {
      console.error("Error getting location details:", error);
    });
  }, [lng, lat]);

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
