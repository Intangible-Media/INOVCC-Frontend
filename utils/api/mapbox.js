/**
 * This async function gets the location details for a given longitude and latitude.
 * @param {number} longitude - The longitude of the location.
 * @param {number} latitude - The latitude of the location.
 * @returns {Promise} A promise that resolves to the location details.
 */
export const getLocationDetails = async (longitude, latitude) => {
  const endpoint = "mapbox.places";
  const accessToken =
    "pk.eyJ1IjoiaW50YW5naWJsZS1tZWRpYSIsImEiOiJjbHA5MnBnZGcxMWVrMmpxcGRyaGRteTBqIn0.O69yMbxSUy5vG7frLyYo4Q"; // Replace with your Mapbox access token
  const url = `https://api.mapbox.com/geocoding/v5/${endpoint}/${longitude},${latitude}.json?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const findFeature = (type) =>
      data.features.find((feature) => feature.place_type.includes(type));

    const place = findFeature("place");
    const region = findFeature("region");
    const address = findFeature("address");
    const postcode = findFeature("postcode");

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
