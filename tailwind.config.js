const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1700px",
        // => @media (min-width: 992px) { ... }
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateX(100%)", opacity: ".75" },
          "100%": { transform: "translateX(0%)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        // Add more custom animations here
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in-out",
        fadeInFast: "fadeIn .2s ease-in-out",
        slideUp: "slideUp 400ms ease-in-out",
        slideDown: "slideDown 500ms ease-out backward",
        // Reference more custom animations here
      },
      colors: {
        cyan: {
          50: "#F9FAFB", // Very light cyan
          100: "#F3F4F6", // Lighter cyan
          200: "#E5E7EB", // Light cyan
          300: "#D1D5DB", // Less light cyan
          400: "#9CA3AF", // Lighter than default
          DEFAULT: "#6B7280", // Default cyan
          600: "#4B5563", // Slightly darker than default
          700: "#374151", // Dark cyan
          800: "#1F2A37", // Darker cyan
          900: "#111928", // Very dark cyan
        },
        gray: {
          50: "#F9FAFB", // Replace with your actual color code for grey-50
          100: "#F3F4F6", // Replace with your actual color code for grey-100
          200: "#E5E7EB", // Replace with your actual color code for grey-200
          300: "#D1D5DB", // Replace with your actual color code for grey-300
          400: "#9CA3AF", // Replace with your actual color code for grey-400
          500: "#6B7280", // Replace with your actual color code for grey-500
          600: "#4B5563", // Replace with your actual color code for grey-600
          700: "#374151", // Replace with your actual color code for grey-700
          800: "#1F2937", // Replace with your actual color code for grey-800
          900: "#111827", // Replace with your actual color code for grey-900
        },
        "dark-blue": {
          50: "#e1e0f5",
          100: "#c3c2eb",
          200: "#a6a3e2",
          300: "#8885d8",
          400: "#6a66ce",
          500: "#4c48c4", // Consider this as the "base" color if not specified
          600: "#3c37ad",
          700: "#312e8e",
          800: "#272470",
          900: "#1c1a51",
        },
        "dark-green": {
          50: "#e1e0f5",
          100: "#c3c2eb",
          200: "#a6a3e2",
          300: "#8885d8",
          400: "#6a66ce",
          DEFAULT: "#046C4E", // Default cyan
          600: "#3c37ad",
          700: "#312e8e",
          800: "#272470",
          900: "#1c1a51",
        },
      },
      fontSize: {
        xxs: ["10px", "10px"],
      },
    },
  },
  plugins: [flowbite.plugin()],
};
