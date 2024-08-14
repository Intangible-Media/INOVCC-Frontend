"use client";

import { useLoading } from "../context/LoadingContext";
import {
  downloadFilesAsZipWithSubfolders,
  convertInspectionsToZipArgs,
} from "../utils/strings";

export default function DownloadFilesAsSubFolderZipButton({
  structures = [],
  name = "Inspection",
}) {
  const { showLoading, hideLoading, showSuccess } = useLoading();

  return (
    <button
      className="text-sm text-dark-blue-700 font-medium"
      onClick={async (e) => {
        showLoading(
          `Downloading all documents for ${structures.length} structures`
        );
        const formattedStructures = convertInspectionsToZipArgs(structures);

        try {
          const response = await downloadFilesAsZipWithSubfolders(
            formattedStructures
          );

          showSuccess("Download finished successfully!");
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
