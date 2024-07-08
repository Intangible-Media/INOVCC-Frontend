"use client";
import React, { useState } from "react";

const stages = [
  "Initial Conversation",
  "Projects Discussed",
  "RFP Sent",
  "Proposal Accepted",
  "Initial Payment",
  "Project Started",
];

const initialCards = {
  "Initial Conversation": [],
  "Projects Discussed": [],
  "RFP Sent": [],
  "Proposal Accepted": [],
  "Initial Payment": [],
  "Project Started": [],
};

const SalesDashboard = () => {
  const [cards, setCards] = useState(initialCards);

  const addCard = (stage) => {
    const title = prompt("Enter card title:");
    if (title) {
      setCards({
        ...cards,
        [stage]: [...cards[stage], title],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">Sales Dashboard</h1>
      <div className="flex justify-between space-x-4">
        {stages.map((stage) => (
          <div
            key={stage}
            className="flex flex-col w-1/6 bg-white p-4 rounded shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">{stage}</h2>
            <button
              onClick={() => addCard(stage)}
              className="bg-blue-500 text-white px-2 py-1 rounded mb-4"
            >
              Add Card
            </button>
            <div className="space-y-2">
              {cards[stage].map((card, index) => (
                <div key={index} className="bg-blue-100 p-2 rounded">
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sales Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">123</p>
          </div>
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">$456,789</p>
          </div>
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold">78%</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        <ul className="bg-white p-6 rounded shadow-lg">
          <li className="mb-2">John Doe moved Client A to Proposal Accepted</li>
          <li className="mb-2">Jane Smith added a new card to RFP Sent</li>
          <li className="mb-2">
            Michael Brown marked Client B as Project Started
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SalesDashboard;
