import React, { useState, useEffect } from "react";
import { Button } from "flowbite-react";

// const getDirections = async ({
//   longitude,
//   latitude,
//   destinationLongitude,
//   destinationLatitude,
// }) => {
//   const accessToken =
//     "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q"; // Replace with your Mapbox access token
//   const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${destinationLongitude},${destinationLatitude}?access_token=${accessToken}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     console.log(data);
//     return data.routes[0]; // Return the first route
//   } catch (error) {
//     console.error("Error in fetching directions:", error);
//     return null; // or handle the error as needed
//   }
// };

const DirectionsComponent = ({ destinationLongitude, destinationLatitude }) => {
  const [currentLocation, setCurrentLocation] = useState({
    longitude: null,
    latitude: null,
  });
  const [directions, setDirections] = useState(null);

  //   useEffect(() => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition((position) => {
  //         setCurrentLocation({
  //           longitude: position.coords.longitude,
  //           latitude: position.coords.latitude,
  //         });
  //       });
  //     }
  //   }, []);

  //   const handleGetDirections = async () => {
  //     if (
  //       currentLocation.longitude !== null &&
  //       currentLocation.latitude !== null
  //     ) {
  //       const result = await getDirections({
  //         longitude: currentLocation.longitude,
  //         latitude: currentLocation.latitude,
  //         destinationLongitude,
  //         destinationLatitude,
  //       });
  //       setDirections(result);
  //     } else {
  //       console.log("Current location not available.");
  //     }
  //   };

  const googleMapsLink = `https://www.google.com/maps/?q=${destinationLatitude},${destinationLongitude}`;

  return (
    <a href={googleMapsLink} target="_blank" className="text-indigo-700">
      Get Directions
    </a>
  );
};

export default DirectionsComponent;
