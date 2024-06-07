import axios from "axios";

/**
 * Retrieves a specific inspection based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the inspection to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getInspection = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all inspections.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllInspections = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Creates a new inspection.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the inspection to create.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createInspection = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Updates an existing inspection.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the inspection to update.
 * @param {Object} data.payload - The payload for the update.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateInspection = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Deletes a specific inspection.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the inspection to delete.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteInspection = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Asynchronously uploads an array of files to a specified field within a structure entry.
 * The files are uploaded via a multipart/form-data POST request to a dedicated upload endpoint.
 *
 * @async
 * @param {File[]} files - An array of File objects to be uploaded.
 * @param {string} structureId - The ID of the structure to which the files are to be associated.
 * @param {string} fieldName - The name of the field within the structure entry to associate the uploaded files with.
 * @returns {Promise<void>} A promise that resolves when the upload operation is complete. Logs the outcome of the operation.
 */

// Helper function to upload files to a specific field
export const uploadFiles = async (jwt, files, inspectionId, fieldName) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file); // Add each file to the form data
  });

  // Append reference data to link the uploaded files to the structure entry
  formData.append("ref", "api::inspection.inspection"); // Adjust according to your API path
  formData.append("refId", inspectionId);
  formData.append("field", fieldName); // Use the field name passed as a parameter

  try {
    // Make the POST request to upload and associate files with the structure entry
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

    //console.log(`${fieldName} uploaded successfully`, uploadResponse.data);
  } catch (error) {
    console.error(`Error uploading ${fieldName}:`, error);
  }
};
