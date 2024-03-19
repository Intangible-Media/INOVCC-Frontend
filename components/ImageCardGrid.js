import { Label, FileInput, Dropdown } from "flowbite-react";
import { GoPlus } from "react-icons/go";
import { ensureDomain } from "../utils/strings";

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

  const downloadImage = (file) => {
    // Create a URL for the file
    const url = URL.createObjectURL(file);

    // Create a temporary anchor (`<a>`) element
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name; // Set the file name for the download

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
        className={`grid ${columnsNumber} ${paddedStyle} ${background} gap-2`}
      >
        {files.map((file, index) => {
          // Create an object URL for the file
          const fileUrl = file.attributes?.url || URL.createObjectURL(file);
          const fileName = file.attributes?.name || file.name;

          // Determine the background style
          const backgroundStyle = isImage(fileName)
            ? {
                backgroundImage: `url(${ensureDomain(fileUrl)})`,
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
                <svg
                  className="m-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                >
                  <path
                    d="M20 3.75H4C3.46957 3.75 2.96086 3.96071 2.58579 4.33579C2.21071 4.71086 2 5.21957 2 5.75V19.75C2 20.2804 2.21071 20.7891 2.58579 21.1642C2.96086 21.5393 3.46957 21.75 4 21.75H20C20.5304 21.75 21.0391 21.5393 21.4142 21.1642C21.7893 20.7891 22 20.2804 22 19.75V5.75C22 5.21957 21.7893 4.71086 21.4142 4.33579C21.0391 3.96071 20.5304 3.75 20 3.75ZM4 19.75V5.75H20V19.75H4Z"
                    fill="#1F2A37"
                  />
                  <path
                    d="M16.3 13.214C16.2154 13.0803 16.1003 12.9685 15.9641 12.8879C15.8279 12.8073 15.6745 12.7602 15.5166 12.7505C15.3586 12.7407 15.2006 12.7686 15.0555 12.8318C14.9104 12.895 14.7824 12.9917 14.682 13.114L13.136 15.001L10.364 10.25C10.2765 10.0902 10.1455 9.95843 9.98625 9.86995C9.82698 9.78147 9.64592 9.73988 9.464 9.75C9.28374 9.75564 9.10837 9.80992 8.95645 9.9071C8.80452 10.0043 8.68171 10.1407 8.601 10.302L5.101 17.302C5.02441 17.4548 4.98828 17.6248 4.99606 17.7955C5.00385 17.9663 5.05528 18.1322 5.14545 18.2775C5.23562 18.4227 5.36152 18.5424 5.51113 18.6251C5.66073 18.7079 5.82905 18.7508 6 18.75H18C18.1791 18.75 18.3549 18.7018 18.509 18.6106C18.6631 18.5194 18.7899 18.3885 18.8762 18.2316C18.9624 18.0746 19.0049 17.8974 18.9993 17.7184C18.9936 17.5394 18.94 17.3652 18.844 17.214L16.3 13.214Z"
                    fill="#1F2A37"
                  />
                  <path
                    d="M14.5 10.75C15.3284 10.75 16 10.0784 16 9.25C16 8.42157 15.3284 7.75 14.5 7.75C13.6716 7.75 13 8.42157 13 9.25C13 10.0784 13.6716 10.75 14.5 10.75Z"
                    fill="#1F2A37"
                  />
                </svg>
              )}
              <div className="file-name-footer bg-white p-4 flex justify-between align-middle absolute left-0 right-0 bottom-0 mt-auto">
                <h6 className="leading-none text-xxs">
                  {formatFileName(file.attributes?.name || file.name)}
                </h6>
                <Dropdown
                  inline
                  label=""
                  placement="top"
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <span className="flex">
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
                  <Dropdown.Item onClick={() => downloadImage(file)}>
                    <div className="flex items-center">
                      <span className="">Download</span>
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
