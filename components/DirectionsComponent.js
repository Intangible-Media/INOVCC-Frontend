const DirectionsComponent = ({ destinationLatitude, destinationLongitude }) => {
  const googleMapsLink = `https://www.google.com/maps/?q=${destinationLatitude},${destinationLongitude}`;

  return (
    <a
      href={googleMapsLink}
      target="_blank"
      className="leading-tight text-xs text-dark-blue-700 w-fit"
    >
      Get Directions
    </a>
  );
};

export default DirectionsComponent;
