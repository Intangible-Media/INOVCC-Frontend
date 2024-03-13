import axios from "axios";

/**
 * Retrieves a specific structure based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the structure to retrieve.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getStructure = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllStructure = (data) => {
  return axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures`, {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
  });
};

/**
 * Creates a new structure.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the structure to create.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createStructure = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateStructure = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}`,
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
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteStructure = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/structures/${data.id}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};
