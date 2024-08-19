"use client";

import { useState } from "react";
import { TextInput } from "flowbite-react";
import { refreshSchedulenQueryData } from "../app/actions";
import { CiSearch } from "react-icons/ci";

export default function SearchStructureSchedule({ params }) {
  const [searchQuery, setSearchQuery] = useState(""); // Initialize searchQuery

  const handleSubmit = (e) => {
    e.preventDefault();
    refreshSchedulenQueryData(params.id, searchQuery);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="searchQuery"
        placeholder="Search in Maps"
        icon={CiSearch}
        value={searchQuery} // Use the state value
        onChange={(e) => setSearchQuery(e.target.value)} // Update state on change
      />
    </form>
  );
}
