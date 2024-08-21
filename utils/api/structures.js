import axios from "axios";
import Pica from "pica";

/**
 * Retrieves a specific structure based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the structure to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getStructure = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all structures.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The query parameters for the request.
 * @returns {Promise} - A promise with the response from the API.
 */
export const fetchAllStructure = async (data) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.jwt}`,
        },
        next: {
          revalidate: 10, // Optional: Revalidate this data every 10 seconds
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch structures");
    }

    const structures = await response.json();
    return structures;
  } catch (error) {
    console.error("Error fetching structures:", error);
    throw error;
  }
};

/**
 * Retrieves all structures concurrently.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The pre-processed query string for the request.
 * @returns {Promise<Array>} - A promise that resolves to an array of all structures.
 */
export const getAllStructure = async (data) => {
  // Fetch the first page to get pagination info
  const initialResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}&pagination[page]=1&pagination[pageSize]=25`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );

  console.log("you made it past the first page");

  const { meta } = initialResponse.data;
  const totalPages = meta.pagination.pageCount;

  console.log("totalpages", totalPages);

  // Create an array of promises for all pages
  const promises = [];
  for (let page = 1; page <= totalPages; page++) {
    console.log(page);
    promises.push(
      axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}&pagination[page]=${page}&pagination[pageSize]=25`,
        {
          headers: {
            Authorization: `Bearer ${data.jwt}`,
          },
        }
      )
    );
  }

  // Wait for all promises to resolve
  const responses = await Promise.all(promises);

  // Combine all data into one array
  const allStructures = responses.flatMap((response) => response.data.data);

  return allStructures;
};

/**
 * Retrieves all structures concurrently.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The pre-processed query string for the request.
 * @returns {Promise<Array>} - A promise that resolves to an array of all structures.
 */
export const getAllStructuresNew = async (data) => {
  // Fetch the first page to get pagination info
  const structures = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );

  return structures.data.data;
};

/**
 * Retrieves all structures concurrently.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The pre-processed query string for the request.
 * @returns {Promise<Array>} - A promise that resolves to an array of all structures.
 */
export const fetchAllStructures = async (data) => {
  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
    next: { revalidate: 60 }, // Cache the response for 60 seconds
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}`,
    fetchOptions
  );

  if (!response.ok) {
    throw new Error("Failed to fetch structures");
  }

  const structuresData = await response.json();
  return structuresData.data;
};

/**
 * Creates a new structure.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the structure to create.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createStructure = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Updates an existing structure.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the structure to update.
 * @param {Object} data.payload - The payload for the update.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateStructure = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Deletes a specific structure.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the structure to delete.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteStructure = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Asynchronously uploads each file from an array of files to a specified field within a structure entry.
 * Each file is uploaded via a separate multipart/form-data POST request to a dedicated upload endpoint.
 *
 * @async
 * @param {File[]} files - An array of File objects to be uploaded.
 * @param {string} structureId - The ID of the structure to which the files are to be associated.
 * @param {string} fieldName - The name of the field within the structure entry to associate the uploaded files with.
 * @returns {Promise<void>} A promise that resolves when all upload operations are complete. Logs the outcome of each operation.
 */

export const uploadFiles = async (
  jwt,
  files,
  structureId,
  fieldName,
  maxRetries = 3
) => {
  const retryDelays = [1000, 3000, 5000]; // Delays between retries in milliseconds
  let successCount = 0;
  let errorMessages = [];

  // Function to compress image
  const compressImage = async (file) => {
    const pica = new Pica();
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const compressedCanvas = await pica.resize(canvas, canvas, {
      quality: 3,
      alpha: true,
    });

    const blob = await pica.toBlob(compressedCanvas, "image/jpeg", 0.5);
    return new File([blob], file.name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  for (const file of files) {
    let compressedFile = file;
    if (file.type.startsWith("image/")) {
      compressedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append("files", compressedFile);
    formData.append("ref", "api::structure.structure");
    formData.append("refId", structureId);
    formData.append("field", fieldName);

    let attempts = 0;
    let fileUploaded = false;

    while (attempts < maxRetries && !fileUploaded) {
      try {
        // Make the POST request to upload and associate the file with the structure entry
        const uploadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(
          `${file.name} uploaded successfully to ${fieldName}`,
          uploadResponse.data
        );
        successCount++;
        fileUploaded = true;
      } catch (error) {
        attempts++;
        console.error(error);
        console.error(
          `Attempt ${attempts}: Error uploading ${file.name} to ${fieldName}`,
          error
        );

        if (attempts === maxRetries) {
          errorMessages.push(
            `Failed to upload ${file.name} after ${maxRetries} attempts. Error: ${error.message}`
          );
        } else {
          console.log(`Retrying in ${retryDelays[attempts - 1]}ms...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelays[attempts - 1])
          );
        }
      }
    }
  }

  let resultType = "Success";
  if (errorMessages.length > 0) {
    resultType = successCount === 0 ? "Error" : "Mixed";
  }

  return {
    type: resultType,
    message:
      errorMessages.length > 0
        ? `Some files failed to upload: ${errorMessages.join(" | ")}`
        : "All files uploaded successfully.",
  };
};

export const uploadFilesNew = async (
  jwt,
  files,
  structureId,
  fieldName,
  maxRetries = 3
) => {
  const retryDelays = [1000, 3000, 5000]; // Delays between retries in milliseconds
  const successCount = { count: 0 };
  const errorMessages = [];

  // Compress an image file if necessary
  const compressImage = async (file) => {
    const pica = new Pica();
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const compressedCanvas = await pica.resize(canvas, canvas, {
      quality: 3,
      alpha: true,
    });

    const blob = await pica.toBlob(compressedCanvas, "image/jpeg", 0.5);
    return new File([blob], file.name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  // Upload a single file with retries
  const uploadFile = async (file) => {
    let compressedFile = file;
    if (file.type.startsWith("image/")) {
      compressedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append("files", compressedFile);
    formData.append("ref", "api::structure.structure");
    formData.append("refId", structureId);
    formData.append("field", fieldName);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const uploadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(
          `${file.name} uploaded successfully to ${fieldName}`,
          uploadResponse.data
        );
        successCount.count++;
        return;
      } catch (error) {
        console.error(
          `Attempt ${attempt + 1}: Error uploading ${
            file.name
          } to ${fieldName}`,
          error
        );

        if (attempt === maxRetries - 1) {
          errorMessages.push(
            `Failed to upload ${file.name} after ${maxRetries} attempts. Error: ${error.message}`
          );
        } else {
          console.log(`Retrying in ${retryDelays[attempt]}ms...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelays[attempt])
          );
        }
      }
    }
  };

  // Compress and upload all files in parallel
  await Promise.all(files.map((file) => uploadFile(file)));

  let resultType = "Success";
  if (errorMessages.length > 0) {
    resultType = successCount.count === 0 ? "Error" : "Mixed";
  }

  return {
    type: resultType,
    message:
      errorMessages.length > 0
        ? `Some files failed to upload: ${errorMessages.join(" | ")}`
        : "All files uploaded successfully.",
  };
};

export const uploadFilesAlt = async (
  jwt,
  files,
  structureId,
  fieldName,
  addGeoTag,
  cordinates,
  maxRetries = 3
) => {
  const retryDelays = [1000, 3000, 5000]; // Delays between retries in milliseconds
  const successCount = 0;
  const errorMessages = [];

  const compressImage = async (file, addGeoTag, cordinates) => {
    try {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Image could not be decoded"));
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scaleFactor = Math.min(1, 1750 / img.width); // Target width of 1750px or less
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (addGeoTag) {
        const fontSize = 40;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        const padding = 10;
        ctx.fillText(
          `Longitude: ${cordinates.longitude}`,
          canvas.width - padding,
          padding
        );
        ctx.fillText(
          `Latitude: ${cordinates.latitude}`,
          canvas.width - padding,
          padding + fontSize + 5
        );
      }

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          0.8 // Slightly higher quality to balance size and quality
        );
      });
    } catch (error) {
      console.warn("Image compression failed. Uploading original file.", error);
      return file; // Fallback to original file if compression fails
    }
  };

  const uploadFile = async (file) => {
    let compressedFile = file;
    if (file.type.startsWith("image/")) {
      compressedFile = await compressImage(file, addGeoTag, cordinates);
    }

    const formData = new FormData();
    formData.append("files", compressedFile);
    formData.append("ref", "api::structure.structure");
    formData.append("refId", structureId);
    formData.append("field", fieldName);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error(`HTTP error! status: ${uploadResponse.status}`);
        }

        console.log(`${file.name} uploaded successfully to ${fieldName}`);
        return true;
      } catch (error) {
        console.error(
          `Attempt ${attempt + 1}: Error uploading ${file.name}`,
          error
        );
        if (attempt === maxRetries - 1) {
          errorMessages.push(
            `Failed to upload ${file.name} after ${maxRetries} attempts. Error: ${error.message}`
          );
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelays[attempt])
          );
        }
      }
    }
    return false;
  };

  const uploadPromises = files.map((file) => uploadFile(file));
  await Promise.all(uploadPromises);

  let resultType = "Success";
  if (errorMessages.length > 0) {
    resultType = successCount === 0 ? "Error" : "Mixed";
  }

  return {
    type: resultType,
    message:
      errorMessages.length > 0
        ? `Some files failed to upload: ${errorMessages.join(" | ")}`
        : "All files uploaded successfully.",
  };
};
