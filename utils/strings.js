import JSZip from "jszip";

/**
 * Initiates a download of an image file from a Blob or File object.
 *
 * @param {Blob|File} file - The Blob or File object to download.
 */
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

/**
 * Downloads a file from a specified URL. The function fetches the data from the URL,
 * creates a Blob object from it, and then triggers a download using an anchor element.
 *
 * @param {string} url - The URL from which to download the file.
 * @param {string} [fileName="download"] - The name to use for the downloaded file. Defaults to 'download' if not specified.
 */

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

/**
 * Downloads multiple files from provided URLs. For each file, it fetches the data,
 * creates a Blob object, and triggers a download using an anchor element. It introduces
 * a delay between downloads to avoid triggering browsers' popup blockers.
 *
 * @param {Array.<{url: string, name: string}>} files - An array of objects where each object contains a 'url' and a 'name' for the file to download.
 */

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

/**
 * Downloads multiple files as a single ZIP file. It fetches each file from its URL,
 * adds it to a ZIP archive using JSZip, and then triggers a download of the ZIP file.
 *
 * @param {Array.<{url: string, name: string}>} files - An array of objects where each object contains a 'url' and a 'name' for the file to be included in the ZIP.
 * @param {string} [zipFilename="files.zip"] - The name to use for the ZIP file. Defaults to 'files.zip' if not specified.
 */

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

/**
 * Checks if a given file name represents an image based on its extension.
 *
 * @param {string} fileName - The name of the file to check.
 * @returns {boolean} True if the file is an image (jpeg or png), false otherwise.
 */

export const isImage = (fileName) => {
  return /\.(jpe?g|png)$/i.test(fileName);
};

/**
 * Ensures that a given URL includes a domain name. If the URL already starts with a protocol (e.g., http, https, ftp, ftps),
 * it returns the URL unchanged. Otherwise, it prepends 'http://localhost:1337' to the URL This is ONLY used when getting
 * images from the strapi API because it doesn't not return the 'http://localhost:1337' and breaks locally.
 *
 * @param {string} url - The URL to check and potentially modify.
 * @returns {string} The original URL if it starts with a protocol, or the URL with 'http://localhost:1337' prepended if it does not.
 */
export const ensureDomain = (url) => {
  // Extend the regex to include "blob:" URLs
  const protocolRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|ftps:\/\/|blob:)/;

  // Check if the URL starts with a recognized protocol
  if (protocolRegex.test(url)) {
    // If the URL starts with a recognized protocol, return it unchanged
    return url;
  } else {
    // If the URL does not start with a recognized protocol, prepend 'http://localhost:1337'
    return "http://localhost:1337" + url;
  }
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

/**
 * Converts an ISO date string to a more readable date and time format.
 *
 * @param {string} dateString - The ISO date string to be formatted.
 * @returns {string} A string representing the formatted date and time in the form "Month Day, Year Hours:Minutes AM/PM".
 */
export const formatReadableDate = (dateString) => {
  const date = new Date(dateString);

  // Specify options for date and time format
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

  // Generate formatted date and time
  const formattedDate = date.toLocaleDateString("en-US", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  // Combine date and time for full display
  return `${formattedDate} ${formattedTime}`;
};

/**
 * Converts an ISO date string to a relative time string indicating how long ago it was,
 * in terms of years, months, weeks, days, hours, and minutes.
 *
 * @param {string} dateString - The ISO date string to be converted.
 * @returns {string} A string representing how long ago the date was, with the most significant non-zero time unit.
 */
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  let delta = Math.floor((now - date) / 1000); // difference in seconds

  const minutes = Math.floor(delta / 60);
  const hours = Math.floor(delta / 3600);
  const days = Math.floor(delta / 86400);
  const weeks = Math.floor(delta / (86400 * 7));
  const months = Math.floor(delta / (86400 * 30));
  const years = Math.floor(delta / (86400 * 365));

  if (years > 0) {
    return `${years} year${years === 1 ? "" : "s"} ago`;
  } else if (months > 0) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else {
    return "just now";
  }
};
