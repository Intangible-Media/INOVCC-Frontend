import { useState } from "react";
import { getResponse } from "../utils/openai";
import { Button, TextInput } from "flowbite-react";

const ChatInterface = ({ contextData }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  function objectToPassage(obj, indentLevel = 0) {
    let passage = "";
    const indent = " ".repeat(indentLevel * 2); // Create an indent based on the hierarchy level

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        // If it's a nested object or array, describe it in a new paragraph or list
        passage += `\n${indent}${key} consists of the following: `;
        passage += objectToPassage(value, indentLevel + 1); // Recursively convert the nested object
      } else {
        // Convert key-value pairs into sentences
        passage += `\n${indent}${key} is ${value}.`;
      }
    }

    return passage;
  }

  const sendMessage = async (userMessage) => {
    // Prevent sending empty messages
    if (!userMessage.trim()) return;

    // Add user's message to the chat
    const updatedMessages = [
      ...messages,
      { text: userMessage, sender: "user" },
    ];
    setMessages(updatedMessages);
    setMessage("");

    // Get response from OpenAI
    const aiResponse = await getResponse(userMessage, contextData);
    // Add AI's response to the chat
    setMessages([...updatedMessages, { text: aiResponse, sender: "ai" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(message);
  };

  return (
    <>
      <div className="messages-container h-auto overflow-y-auto">
        {messages.map((message, index) => {
          // Convert <br> tags in message.text to line breaks
          const formattedMessage = {
            __html: message.text.replace(/<br>/g, "<br />"),
          };

          return (
            <div
              key={index}
              className={`message p-2 my-2 text-sm rounded-md ${
                message.sender === "user"
                  ? "bg-dark-blue-700 text-right text-white"
                  : "bg-gray-200 text-left"
              }`}
              dangerouslySetInnerHTML={formattedMessage}
            />
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          className="block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500 p-2.5 text-sm rounded-lg"
        />
        <Button
          type="submit"
          className="bg-dark-blue-700 text-white rounded-r-lg"
        >
          Send
        </Button>
      </form>
    </>
  );
};

export default ChatInterface;
