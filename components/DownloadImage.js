import React from "react";

const DownloadImage = ({ src, filename }) => {
  const handleDownloadClick = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(src);
      if (response.ok) {
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);

        // Create a temporary link element and trigger the download
        const link = document.createElement("a");
        link.href = href;
        link.download = filename || "downloaded-image";

        // Append to the body, click it, and then remove it
        document.body.appendChild(link);
        link.click();

        // Clean up by revoking the ObjectURL and removing the link
        URL.revokeObjectURL(href);
        document.body.removeChild(link);
      } else {
        throw new Error("Image download failed");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <a
      href={src}
      download={filename || "downloaded-image"}
      onClick={handleDownloadClick}
    >
      <img
        src={src}
        className="downloadable-file rounded-lg h-full w-full aspect-square"
        alt={`Download ${filename}`}
      />
    </a>
  );
};

export default DownloadImage;
