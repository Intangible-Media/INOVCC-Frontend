import axios from "axios";

/**
 * Retrieves a specific activity based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the activity to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getActivity = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all activities.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllActivities = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Creates a new activity.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the activity to create.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createActivity = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Updates an existing activity.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the activity to update.
 * @param {Object} data.payload - The payload for the update.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateActivity = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities/${data.id}?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Deletes a specific activity.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the activity to delete.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteActivity = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/activities/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};
