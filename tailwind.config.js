/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: "#E5F4FD", // Very light cyan
          100: "#CCE9FB", // Lighter cyan
          200: "#99D4F7", // Light cyan
          300: "#66BFF3", // Less light cyan
          400: "#33ABEF", // Lighter than default
          DEFAULT: "#27A9EF", // Default cyan
          600: "#238FCB", // Slightly darker than default
          700: "#1F76A7", // Dark cyan
          800: "#1B5D83", // Darker cyan
          900: "#17445F", // Very dark cyan
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
