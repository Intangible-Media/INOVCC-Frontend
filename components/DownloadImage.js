import React from "react";
import Image from "next/image";
import pdfIcon from "../public/file-icons/pdf.svg";

const DownloadImage = ({ src, filename }) => {
  const isPdf = src.endsWith(".pdf");

  const handleDownloadClick = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(src);
      if (response.ok) {
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = href;
        link.download =
          filename || (isPdf ? "downloaded-file.pdf" : "downloaded-image");

        document.body.appendChild(link);
        link.click();

        URL.revokeObjectURL(href);
        document.body.removeChild(link);
      } else {
        throw new Error("File download failed");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <a
      href={src}
      download={
        filename || (isPdf ? "downloaded-file.pdf" : "downloaded-image")
      }
      onClick={handleDownloadClick}
      className="downloadable-file-container" // Add a container class
    >
      {isPdf ? (
        <div>
          <div className="downloadable-file icon rounded-lg h-full w-full aspect-square justify-center items-center border border-2 hover-overlay">
            <Image
              src={pdfIcon}
              className="rounded-lg"
              alt="PDF Icon"
              width={40}
              height={40}
            />
          </div>
          <p>Filename.svg</p>
        </div>
      ) : (
        <div>
          <div className="downloadable-file rounded-lg h-full w-full aspect-square hover-overlay">
            <img
              className="fill-in rounded-lg"
              src={src}
              alt={`Download ${filename}`}
            />
          </div>
          <p>Filename.svg</p>
        </div>
      )}
    </a>
  );
};

export default DownloadImage;
