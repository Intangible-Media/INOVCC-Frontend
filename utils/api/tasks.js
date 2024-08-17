import axios from "axios";

/**
 * Retrieves a specific task based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the task to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getTask = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all tasks.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const getAllTasks = (data) => {
  return axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Retrieves all tasks.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise<Object>} - The response from the API.
 */
export const fetchAllTasks = async (data) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
      next: { revalidate: 60 }, // Optional: Use Next.js caching with revalidation every 60 seconds
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  const tasks = await response.json();
  return tasks;
};

/**
 * Creates a new task.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {Object} data.payload - The payload of the task to create.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const createTask = (data) => {
  return axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Updates an existing task.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the task to update.
 * @param {Object} data.payload - The payload for the update.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const updateTask = (data) => {
  return axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks/${data.id}?${data.query}`,
    data.payload,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Deletes a specific task.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the task to delete.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteTask = (data) => {
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks/${data.id}?${data.query}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};

/**
 * Uploads multiple files and associates them with a specific entry in the Task collection.
 * @param {string} jwt - The JWT for authentication.
 * @param {Array<File>} files - Array of files to be uploaded.
 * @param {string} taskId - The ID of the task entry to associate the files with.
 * @param {string} fieldName - The field within the task model to associate the files with.
 * @returns {Promise<void>}
 */
export const uploadFiles = async (jwt, files, taskId, fieldName) => {
  const formData = new FormData();

  // Add each file to the FormData object
  console.log(files);
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Append reference data to link the uploaded files to the task entry
  formData.append("ref", "api::task.task"); // Assuming the task type is correctly named
  formData.append("refId", taskId);
  formData.append("field", fieldName);

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

    console.log(`${fieldName} uploaded successfully`, uploadResponse.data);
  } catch (error) {
    console.error(`Error uploading ${fieldName}:`, error);
  }
};
