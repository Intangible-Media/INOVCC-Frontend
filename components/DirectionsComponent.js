const DirectionsComponent = ({ destinationLongitude, destinationLatitude }) => {
  const googleMapsLink = `https://www.google.com/maps/?q=${destinationLatitude},${destinationLongitude}`;

  return (
    <a
      href={googleMapsLink}
      target="_blank"
      className="leading-tight text-xs text-blue-700 w-fit"
    >
      Get Directions
    </a>
  );
};

export default DirectionsComponent;
