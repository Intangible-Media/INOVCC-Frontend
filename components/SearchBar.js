"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "flowbite-react";

const SearchBar = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      router.push(`/search?search=${searchText}`);
    }
  };

  return (
    <TextInput
      type="text"
      placeholder="Search"
      id="search-bar"
      className="bg-gray-700 rounded-md text-center md:w-[500px]"
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        console.log(e.target.value);
        setSearchText(e.target.value);
      }}
      value={searchText}
    />
  );
};
export default SearchBar;
