import axios from "axios";

/**
 * Uploads a file to Strapi.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {File} data.file - The file to upload.
 * @param {Object} [data.ref] - Optional parameters to associate the file with a specific entry.
 * @param {string} [data.ref.id] - The ID of the entry to associate the file with.
 * @param {string} [data.ref.ref] - The model name of the entry.
 * @param {string} [data.ref.field] - The field name in the model to associate the file with.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const uploadFile = (data) => {
  const formData = new FormData();
  formData.append("files", data.file);
  if (data.ref) {
    formData.append("refId", data.ref.id);
    formData.append("ref", data.ref.ref);
    formData.append("field", data.ref.field);
  }

  return axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Deletes a file from Strapi.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {number|string} data.id - The ID of the file to delete.
 * @returns {Promise} - The Axios promise with the response from the API.
 */
export const deleteFile = (data) => {
  console.log(data);
  return axios.delete(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload/files/${data.id}`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );
};
