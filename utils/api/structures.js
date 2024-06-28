import axios from "axios";

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
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllStructure = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
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

  for (const file of files) {
    const formData = new FormData();
    formData.append("files", file);
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
