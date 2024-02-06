import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function summarizeApiResponse(apiResponse) {
  console.log("apiResponse");
  console.log(apiResponse);
  // Define what data to keep for each structure
  const structuresSummary = apiResponse.structures.data?.map((s) => ({
    id: s.id,
    status: s.attributes.status,
    inspectionDate: s.attributes.inspectionDate,
    type: s.attributes.type,
    longitude: s.attributes.longitude,
    latitude: s.attributes.latitude,
  }));

  // Define what data to keep for each document
  const documentsSummary = apiResponse.documents.data.map((d) => ({
    id: d.id,
    name: d.attributes.name,
    url: d.attributes.url,
  }));

  // Summarize the entire response
  const summarizedResponse = {
    name: apiResponse.name,
    createdAt: apiResponse.createdAt,
    structures: structuresSummary,
    documents: documentsSummary,
    client: apiResponse.client.data,
  };

  // Convert the summary to a string for the OpenAI API
  return JSON.stringify(summarizedResponse, null, 2);
}

export const getResponse = async (message, fullApiResponse) => {
  try {
    // First, summarize the API response to shrink its size
    const summarizedContext = summarizeApiResponse(fullApiResponse);

    // Construct the conversation context
    const messages = [
      {
        role: "system",
        content: summarizedContext, // Use the summarized context here
      },
      {
        role: "user",
        content: message, // User's message
      },
      // Optionally, include the last assistant's message to maintain context
      // {
      //   role: 'assistant',
      //   content: 'The last message from the assistant',
      // }
    ];

    // Create the completion request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use the appropriate model
      messages: messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Log the entire response for debugging
    console.log("OpenAI API response:", response);

    // Check if 'choices' exists and has content
    if (!response.choices || response.choices.length === 0) {
      console.error("No choices found in response:", response);
      return "I am having trouble understanding that.";
    }

    // Extract and return the response text
    // Ensure the response structure matches your API response
    const aiResponse = response.choices[0].message.content.trim();
    const formattedAiResponse = aiResponse.replace(/\n/g, "<br>");

    console.log(formattedAiResponse);

    return formattedAiResponse;
  } catch (error) {
    // Log the entire error for debugging
    console.error("Error calling OpenAI API:", error);
    return "I am having trouble understanding that.";
  }
};
