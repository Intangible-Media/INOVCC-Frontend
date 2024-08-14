"use client";

import { useLoading } from "../context/LoadingContext";
import { downloadFilesAsZip } from "../utils/strings";

export default function DownloadFilesAsZipButton({
  images = [],
  name = "Inspection",
}) {
  const { showLoading, hideLoading, showSuccess } = useLoading();

  return (
    <button
      className="text-sm text-dark-blue-700 font-medium"
      onClick={async (e) => {
        showLoading("Downloading all documents for this map");
        try {
          const imagesWithAttributes = images.map((image) => image.attributes);
          const response = await downloadFilesAsZip(
            imagesWithAttributes,
            `${name} Documents.zip`
          );

          showSuccess("Successfully downloaded all map documents!");
        } catch (error) {
          console.error(error);
          hideLoading();
        }
      }}
    >
      Download All
    </button>
  );
}
