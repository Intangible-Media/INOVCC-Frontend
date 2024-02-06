import JSZip from "jszip";

export const downloadImage = (file) => {
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

export const downloadFileFromUrl = async (url, fileName) => {
  // Fetch the file/data from the URL
  const response = await fetch(url);
  const data = await response.blob(); // Get the data as a Blob

  // Create an object URL for the blob
  const objectUrl = URL.createObjectURL(data);

  // Create a temporary anchor (`<a>`) element
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName || "download"; // Set the file name for the download

  // Append, click, and remove the anchor
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up the object URL
  URL.revokeObjectURL(objectUrl);
};

export const downloadFilesFromUrls = async (files) => {
  for (const { url, name } of files) {
    try {
      const response = await fetch(url);
      const data = await response.blob(); // Get the data as a Blob
      const objectUrl = URL.createObjectURL(data);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(objectUrl);

      // Artificial delay to prevent triggering the browser's popup blocker
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error downloading file", url, error);
    }
  }
};

export const downloadFilesAsZip = async (files, zipFilename) => {
  const zip = new JSZip();

  for (const { url, name } of files) {
    try {
      const response = await fetch(url);
      const data = await response.blob();
      zip.file(name, data, { binary: true });
    } catch (error) {
      console.error("Error downloading or adding file to zip", name, error);
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    const objectUrl = URL.createObjectURL(content);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = zipFilename || "files.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(objectUrl);
  });
};

export const isImage = (fileName) => {
  return /\.(jpe?g|png)$/i.test(fileName);
};

// Utility function to format the file name
export const formatFileName = (fileName) => {
  const maxLength = 14; // Max length before truncating
  const extension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2); // Extract file extension
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, ""); // Remove extension from name

  // If the name without the extension is longer than the maxLength, truncate and add "..."
  if (nameWithoutExtension.length > maxLength) {
    return `${nameWithoutExtension.substring(0, maxLength)}... .${extension}`;
  }

  return fileName; // Return original name if it's short enough
};
