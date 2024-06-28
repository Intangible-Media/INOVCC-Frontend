import { Label, FileInput, Dropdown } from "flowbite-react";
import { GoPlus } from "react-icons/go";
import { ensureDomain, getUrls } from "../utils/strings";

export default function ImageCardGrid({
  files,
  labelText,
  updateFiles,
  identifier,
  background = "bg-gray-100",
  imageBackground = "bg-white",
  columns = 3,
  padded = true,
  editMode = false,
}) {
  // Function to handle new file uploads
  const handleNewFile = (event) => {
    const newFiles = event.target.files;
    updateFiles([...files, ...newFiles]);
  };

  // const downloadImage = (file) => {
  //   // Create a URL for the file
  //   const url = URL.createObjectURL(file);

  //   // Create a temporary anchor (`<a>`) element
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = file.name; // Set the file name for the download

  //   // Append the anchor to the body, click it, and then remove it
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);

  //   // Clean up the URL object
  //   URL.revokeObjectURL(url);
  // };

  const downloadImage = async (fileOrUrl) => {
    let blob;
    let filename = "download"; // Default filename

    if (typeof fileOrUrl === "string") {
      // If fileOrUrl is a URL string
      try {
        // Fetch the resource and convert it to a Blob
        const response = await fetch(fileOrUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        blob = await response.blob();
        filename = fileOrUrl.split("/").pop() || filename; // Use the last part of the URL as the filename
      } catch (e) {
        console.error("Invalid URL string or network error.", e);
        return;
      }
    } else if (fileOrUrl instanceof Blob || fileOrUrl instanceof File) {
      // If fileOrUrl is a Blob or File object
      blob = fileOrUrl;
      filename = fileOrUrl.name || filename; // Use the file name if available
    } else {
      console.error(
        "Invalid input type. Expected a URL string, Blob, or File object."
      );
      return;
    }

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor (`<a>`) element
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // Set the file name for the download

    // Append the anchor to the body, click it, and then remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  // Utility function to format the file name
  const formatFileName = (fileName) => {
    const maxLength = 14; // Max length before truncating
    const extension = fileName.slice(
      ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
    ); // Extract file extension
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, ""); // Remove extension from name

    // If the name without the extension is longer than the maxLength, truncate and add "..."
    if (nameWithoutExtension.length > maxLength) {
      return `${nameWithoutExtension.substring(0, maxLength)}... .${extension}`;
    }

    return fileName; // Return original name if it's short enough
  };

  const isImage = (fileName) => {
    return /\.(jpe?g|png)$/i.test(fileName);
  };

  const columnsNumber = `grid-cols-${columns}`;
  const paddedStyle = padded ? "p-4" : "";

  return (
    <div className="flex flex-col gap-4">
      {labelText && (
        <Label className="text-xs" htmlFor="inspectionName">
          {labelText}
        </Label>
      )}

      <div
        className={`grid ${columnsNumber} 3xl:grid-cols-3 ${paddedStyle} ${background} gap-2`}
      >
        {files?.map((file, index) => {
          // Create an object URL for the file

          const smallestImageResolution =
            getUrls(file, "smallest")[0] || URL.createObjectURL(file);
          const fileUrl = file.attributes?.url || URL.createObjectURL(file);
          const fileName = file.attributes?.name || file.name;

          // Determine the background style
          const backgroundStyle = isImage(fileName)
            ? {
                backgroundImage: `url(${ensureDomain(
                  smallestImageResolution
                )})`,
                backgroundSize: "cover",
              }
            : {};

          return (
            <div
              key={index}
              className={`flex aspect-square relative rounded-md overflow-hidden border border-gray-300 hover:bg-gray-200 ${
                !isImage(file.name) ? imageBackground : ""
              }`}
              style={backgroundStyle}
            >
              {!isImage(fileName) && (
                // Show the SVG icon if the file is not an image
                <div className="group flex flex-col gap-2 items-center justify-center w-full h-full  text-gray-800 rounded-md p-4 relative overflow-hidden cursor-pointer">
                  <div className="flex flex-col justify-center ">
                    <h6 className=" text-lg text-gray-400 font-medium">
                      {file.attributes.ext}
                    </h6>
                  </div>
                  <h6 className="text-xxs font-medium text-gray-500 shorten-text absolute -bottom-3 left-3 right-3 group-hover:bottom-3 transition-all duration-200">
                    {file.attributes.name}
                  </h6>
                </div>
              )}
              <div className="file-name-footer bg-white p-4 flex justify-between align-middle absolute left-0 right-0 bottom-0 mt-auto">
                <h6 className="leading-none text-xxs shorten-text">
                  {formatFileName(file.attributes?.name || file.name)}
                </h6>
                <Dropdown
                  inline
                  label=""
                  placement="top"
                  className="cursor-pointer"
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <span className="flex cursor-pointer">
                      <svg
                        className="m-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="5"
                        viewBox="0 0 20 5"
                        fill="none"
                      >
                        <path
                          d="M18 4.5C19.1046 4.5 20 3.60457 20 2.5C20 1.39543 19.1046 0.5 18 0.5C16.8954 0.5 16 1.39543 16 2.5C16 3.60457 16.8954 4.5 18 4.5Z"
                          fill="#9CA3AF"
                        />
                        <path
                          d="M10 4.5C11.1046 4.5 12 3.60457 12 2.5C12 1.39543 11.1046 0.5 10 0.5C8.89543 0.5 8 1.39543 8 2.5C8 3.60457 8.89543 4.5 10 4.5Z"
                          fill="#9CA3AF"
                        />
                        <path
                          d="M2 4.5C3.10457 4.5 4 3.60457 4 2.5C4 1.39543 3.10457 0.5 2 0.5C0.895431 0.5 0 1.39543 0 2.5C0 3.60457 0.895431 4.5 2 4.5Z"
                          fill="#9CA3AF"
                        />
                      </svg>
                    </span>
                  )}
                >
                  <Dropdown.Item
                    onClick={() => downloadImage(ensureDomain(fileUrl))}
                  >
                    <div className="flex items-center">
                      <span>Download</span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <div className="flex items-center">
                      <span className="">Remove</span>
                    </div>
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </div>
          );
        })}

        {editMode && (
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor={identifier}
              className="dark:hover:bg-bray-800 flex h-full w-full cursor-pointer flex-col items-center justify-center  aspect-square relative rounded-md overflow-hidden bg-gray-100 border border-gray-300 hover:bg-gray-200"
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <GoPlus className="text-center mx-auto" />
                <p className="leading-none text-xs font-medium">Add New</p>
              </div>
              <FileInput
                id={identifier}
                className="hidden"
                multiple
                onChange={handleNewFile}
              />
            </Label>
          </div>
        )}
      </div>

      {editMode && (
        <div className="flex justify-between pb-4 border-b-2 border-gray-200">
          <Label className="text-xs" htmlFor="inspectionName">
            Download All
          </Label>
          <button className="flex align-middle text-xs font-medium text-dark-blue-700">
            Add Structure{" "}
            <svg
              className="m-auto ml-2"
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
            >
              <path
                d="M4.99967 2.58337V5.50004M4.99967 5.50004V8.41671M4.99967 5.50004H7.91634M4.99967 5.50004H2.08301"
                stroke="#4B5563"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
