import axios from "axios";
import { notFound } from "next/navigation";

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
 * Retrieves a specific inspection based on provided criteria.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.id - The ID of the inspection to retrieve.
 * @param {Object} data.query - The query parameters for the request.
 * @returns {Promise<Object>} - A promise that resolves to the inspection data.
 */
export const fetchInspection = async (data) => {
  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
    next: { revalidate: 60 }, // Cache the response for 60 seconds
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections/${data.id}?${data.query}`,
    fetchOptions
  );

  if (response.status === 404) {
    // Use Next.js's notFound() utility to indicate a 404 error
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch inspection with ID ${data.id}: ${response.statusText}`
    );
  }

  const inspectionData = await response.json();
  return inspectionData;
};

/**
 * Retrieves all inspections concurrently.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The pre-processed query string for the request.
 * @returns {Promise<Array>} - A promise that resolves to an array of all inspections.
 */
export const getAllInspections = async (data) => {
  // Fetch the first page to get pagination info
  const initialResponse = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}&pagination[page]=1&pagination[pageSize]=25`,
    {
      headers: {
        Authorization: `Bearer ${data.jwt}`,
      },
    }
  );

  console.log("First page of inspections fetched");

  const { meta } = initialResponse.data;
  const totalPages = meta.pagination.pageCount;

  console.log("Total pages of inspections:", totalPages);

  // Create an array of promises for all pages
  const promises = [];
  for (let page = 1; page <= totalPages; page++) {
    console.log("Fetching page:", page);
    promises.push(
      axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}&pagination[page]=${page}&pagination[pageSize]=25`,
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
  const allInspections = responses.flatMap((response) => response.data.data);

  return allInspections;
};

/**
 * Retrieves all inspections with batching and caching in Next.js.
 * @param {Object} data - The data for the request.
 * @param {string} data.jwt - The JWT for authentication.
 * @param {string} data.query - The pre-processed query string for the request.
 * @returns {Promise<Array>} - A promise that resolves to an array of all inspections.
 */
export const fetchAllInspections = async (data) => {
  const BATCH_SIZE = 5; // Number of pages to fetch in each batch
  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${data.jwt}`,
    },
    next: { revalidate: 60 }, // Cache the response for 60 seconds
  };

  // Step 1: Fetch the first page to get pagination info
  const initialResponse = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}&pagination[page]=1&pagination[pageSize]=25`,
    fetchOptions
  );

  if (!initialResponse.ok) {
    throw new Error("Failed to fetch the first page of inspections");
  }

  const initialData = await initialResponse.json();
  const totalPages = initialData.meta.pagination.pageCount;

  console.log(`Total pages of inspections: ${totalPages}`);

  // Step 2: Fetch all pages in batches
  let allInspections = [];

  for (let i = 1; i <= totalPages; i += BATCH_SIZE) {
    const batchPromises = [];

    for (let j = i; j < i + BATCH_SIZE && j <= totalPages; j++) {
      console.log(`Fetching page ${j}...`);

      const pagePromise = fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/inspections?${data.query}&pagination[page]=${j}&pagination[pageSize]=25`,
        fetchOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch page ${j}`);
        }
        return response.json();
      });

      batchPromises.push(pagePromise);
    }

    const batchResponses = await Promise.all(batchPromises);
    const batchInspections = batchResponses.flatMap(
      (response) => response.data
    );
    allInspections = allInspections.concat(batchInspections);
  }

  // Step 3: Return all inspections
  return allInspections;
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
