"use client";

import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

export default function dashboard() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const [lng, setLng] = useState(-112.02199);
  const [lat, setLat] = useState(33.50154);
  const [zoom, setZoom] = useState(20);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q";

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
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

  return (
    <>
      <h1>This is the Inspection Single</h1>
      <div>
        <div className="sidebar-map">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="map-container" />
        <button onClick={() => setMapStyle("satellite-streets-v12")}>
          Satellite
        </button>
        <button onClick={() => setMapStyle("streets-v12")}>Annimated</button>
      </div>
    </>
  );
}
