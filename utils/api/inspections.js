import axios from "axios";

/**
 * Retrieves a specific inspection based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the inspection to retrieve.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getInspection = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllInspections = (data) => {
  return axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections`, {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
  });
};

/**
 * Creates a new inspection.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the inspection to create.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createInspection = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateInspection = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteInspection = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};
