import axios from "axios";

/**
 * Retrieves a specific client based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the client to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getClient = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all clients.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllClients = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Creates a new client.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the client to create.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createClient = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Updates an existing client.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the client to update.
 * @param {Object} data.payload - The payload for the update.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateClient = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients/${data.id}?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Deletes a specific client.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the client to delete.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteClient = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/clients/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};
