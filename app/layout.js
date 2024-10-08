"use client";

import { Dropdown, Avatar, Navbar, TextInput, Alert } from "flowbite-react";
import { Inter } from "next/font/google";
import AuthProvider from "../context/AuthProvider";
import { signOut } from "next-auth/react";
import Link from "next/link";
import DynamicBreadcrumb from "../components/DynamicBreadcrumb";
import { useEffect, useState } from "react";
import { AlertProvider } from "../context/AlertContext";
import { HiInformationCircle } from "react-icons/hi";
import NavbarDropdown from "../components/NavbarDropdown";
import { usePathname, useSearchParams } from "next/navigation";
import "./globals.css";
import path from "path";

const inter = Inter({ subsets: ["latin"] });

/**
 * Custom hook that returns a CSS class if the current URL contains the specified string.
 * @param {string} searchString - The string to search for in the URL.
 * @returns {string} The CSS class if the URL contains the search string.
 */
export const useBackgroundClass = (searchString) => {
  const [backgroundClass, setBackgroundClass] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;

    if (searchString === "overview") {
      if (url === "/?") {
        setBackgroundClass("bg-blue-100");
      } else {
        setBackgroundClass("");
      }
    } else {
      if (url.includes(searchString)) {
        setBackgroundClass("bg-blue-100");
      } else {
        setBackgroundClass("");
      }
    }
  }, [pathname, searchParams, searchString]);

  return backgroundClass;
};
export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum distance (in pixels) that a swipe must travel to be considered a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    // Get the initial touch position
    const touchDown = e.touches[0].clientX;
    setTouchStart(touchDown);
  };

  const onTouchEnd = (e) => {
    // Get the final touch position
    const touchDown = e.changedTouches[0].clientX;
    setTouchEnd(touchDown);
  };

  useEffect(() => {
    const tollerance = 250;

    if (
      touchStart - touchEnd > tollerance ||
      touchEnd - touchStart > tollerance
    ) {
      if (touchStart < touchEnd) {
        // Handle left to right swipe
        return setOpenMobileMenu(true);
        // You can add any action you want to perform on left to right swipe here
      }
      return setOpenMobileMenu(false);
    }

    // Check if the swipe is a left-to-right swipe
  }, [touchStart, touchEnd]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-100`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AuthProvider>
          <AlertProvider>
            <Navbar
              fluid
              className="fixed top-0 z-40 w-full bg-gray-800	 border-b border-blue-950 text-white dark:bg-gray-800 dark:border-gray-700"
            >
              <Navbar.Brand href="https://flowbite-react.com">
                <img
                  src="../../../logo-white.png"
                  className="mr-3 h-6 sm:h-9"
                  alt="Flowbite React Logo"
                />
              </Navbar.Brand>
              <div className="flex md:order-2">
                <NavbarDropdown />
                <Navbar.Toggle />
              </div>
              <Navbar.Collapse>
                <TextInput
                  type="text"
                  placeholder="Search"
                  id="search-bar"
                  className="bg-gray-700 rounded-md text-center"
                />
              </Navbar.Collapse>
            </Navbar>

            <div
              className={`main-navigation fixed top-0 left-0 z-30 h-screen pt-20 transition-all duration-300 px-3 py-4 transform" ${
                isCollapsed ? "w-auto" : "w-64"
              } bg-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all ${
                openMobileMenu ? "open" : "fdfds"
              }`}
            >
              <button className="hidden lg:block" onClick={toggleSidebar}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M11 17C10.7348 16.9999 10.4805 16.8945 10.293 16.707L6.29303 12.707C6.10556 12.5195 6.00024 12.2652 6.00024 12C6.00024 11.7348 6.10556 11.4805 6.29303 11.293L10.293 7.29299C10.3853 7.19748 10.4956 7.1213 10.6176 7.06889C10.7396 7.01648 10.8709 6.98889 11.0036 6.98774C11.1364 6.98659 11.2681 7.01189 11.391 7.06217C11.5139 7.11245 11.6255 7.1867 11.7194 7.28059C11.8133 7.37449 11.8876 7.48614 11.9379 7.60904C11.9881 7.73193 12.0134 7.86361 12.0123 7.99639C12.0111 8.12917 11.9835 8.26039 11.9311 8.38239C11.8787 8.5044 11.8025 8.61474 11.707 8.70699L8.41403 12L11.707 15.293C11.8468 15.4328 11.942 15.611 11.9806 15.805C12.0192 15.9989 11.9994 16.1999 11.9237 16.3826C11.848 16.5653 11.7199 16.7215 11.5555 16.8314C11.3911 16.9413 11.1978 16.9999 11 17Z"
                    fill="#4B5563"
                  />
                  <path
                    d="M17 17C16.7348 16.9999 16.4805 16.8945 16.293 16.707L12.293 12.707C12.1056 12.5195 12.0002 12.2652 12.0002 12C12.0002 11.7348 12.1056 11.4805 12.293 11.293L16.293 7.29299C16.3853 7.19748 16.4956 7.1213 16.6176 7.06889C16.7396 7.01648 16.8709 6.98889 17.0036 6.98774C17.1364 6.98659 17.2681 7.01189 17.391 7.06217C17.5139 7.11245 17.6255 7.1867 17.7194 7.28059C17.8133 7.37449 17.8876 7.48614 17.9379 7.60904C17.9881 7.73193 18.0134 7.86361 18.0123 7.99639C18.0111 8.12917 17.9835 8.26039 17.9311 8.38239C17.8787 8.5044 17.8025 8.61474 17.707 8.70699L14.414 12L17.707 15.293C17.8468 15.4328 17.942 15.611 17.9806 15.805C18.0192 15.9989 17.9994 16.1999 17.9237 16.3826C17.848 16.5653 17.7199 16.7215 17.5555 16.8314C17.3911 16.9413 17.1978 16.9999 17 17Z"
                    fill="#4B5563"
                  />
                </svg>
              </button>
              <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-300 dark:border-gray-700">
                <li>
                  <Link
                    href="/"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "/?"
                    )}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M10.4211 22C8.18765 22 6.04572 21.1128 4.46647 19.5335C2.88722 17.9543 2 15.8123 2 13.5789C2 11.3455 2.88722 9.20362 4.46647 7.62436C6.04572 6.04511 8.18765 5.15789 10.4211 5.15789C10.7002 5.15789 10.968 5.2688 11.1654 5.4662C11.3628 5.66361 11.4737 5.93135 11.4737 6.21053V12.5263H17.7895C18.0686 12.5263 18.3364 12.6372 18.5338 12.8346C18.7312 13.032 18.8421 13.2998 18.8421 13.5789C18.8396 15.8116 17.9516 17.9521 16.3729 19.5308C14.7942 21.1095 12.6537 21.9975 10.4211 22ZM9.36842 7.35053C8.22556 7.54393 7.15796 8.0481 6.28255 8.80784C5.40714 9.56758 4.75769 10.5536 4.40533 11.6578C4.05297 12.7621 4.01128 13.942 4.28485 15.0684C4.55841 16.1947 5.13667 17.2241 5.95628 18.0437C6.7759 18.8633 7.80526 19.4416 8.93163 19.7152C10.058 19.9887 11.2379 19.947 12.3422 19.5947C13.4464 19.2423 14.4324 18.5929 15.1922 17.7175C15.9519 16.842 16.4561 15.7744 16.6495 14.6316H10.4211C10.1419 14.6316 9.87414 14.5207 9.67673 14.3233C9.47932 14.1259 9.36842 13.8581 9.36842 13.5789V7.35053Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M20.9474 11.4737H13.5789C13.2998 11.4737 13.032 11.3628 12.8346 11.1654C12.6372 10.968 12.5263 10.7002 12.5263 10.4211V3.05263C12.5263 2.77346 12.6372 2.50572 12.8346 2.30831C13.032 2.1109 13.2998 2 13.5789 2C15.8116 2.00251 17.9521 2.89053 19.5308 4.46924C21.1095 6.04795 21.9975 8.18842 22 10.4211C22 10.7002 21.8891 10.968 21.6917 11.1654C21.4943 11.3628 21.2265 11.4737 20.9474 11.4737ZM14.6316 9.36842H19.8074C19.5864 8.07611 18.9699 6.88421 18.0429 5.95715C17.1158 5.03009 15.9239 4.41356 14.6316 4.19263V9.36842Z"
                        fill="#4B5563"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Overview</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/inspections"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "inspections"
                    )}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M18.066 2.00001H9.82799C9.43388 1.99889 9.04346 2.07601 8.67937 2.22689C8.31529 2.37778 7.98477 2.59944 7.70699 2.87901L4.87899 5.70701C4.5993 5.98491 4.37757 6.31559 4.22668 6.67986C4.07579 7.04413 3.99873 7.43473 3.99999 7.82901V20C3.99196 20.5215 4.19104 21.0249 4.55359 21.3998C4.91613 21.7747 5.41254 21.9905 5.93399 22H18.066C18.5874 21.9905 19.0839 21.7747 19.4464 21.3998C19.8089 21.0249 20.008 20.5215 20 20V4.00001C20.008 3.47854 19.8089 2.97516 19.4464 2.60025C19.0839 2.22534 18.5874 2.00948 18.066 2.00001ZM8.99999 4.41401V7.00001H6.41399L8.99999 4.41401ZM5.99999 20V9.00001H8.99999C9.53042 9.00001 10.0391 8.7893 10.4142 8.41423C10.7893 8.03915 11 7.53045 11 7.00001V4.00001L17.994 3.97801C17.9981 3.98461 18.0002 3.99225 18 4.00001L18.066 20H5.99999Z"
                        fill="#4B5563"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Inspections</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schedules"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "schedules"
                    )}`}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 4H18V3C18 2.447 17.552 2 17 2C16.448 2 16 2.447 16 3V4H13V3C13 2.447 12.552 2 12 2C11.448 2 11 2.447 11 3V4H8V3C8 2.447 7.552 2 7 2C6.448 2 6 2.447 6 3V4H4C2.897 4 2 4.897 2 6V20C2 21.103 2.897 22 4 22H20C21.103 22 22 21.103 22 20V6C22 4.897 21.103 4 20 4ZM4 20V10H10C10.552 10 11 9.553 11 9C11 8.447 10.552 8 10 8H4V6H6C6 6.553 6.448 7 7 7C7.552 7 8 6.553 8 6H11C11 6.553 11.448 7 12 7C12.552 7 13 6.553 13 6H16C16 6.553 16.448 7 17 7C17.552 7 18 6.553 18 6H20V8H19C18.448 8 18 8.447 18 9C18 9.553 18.448 10 19 10H20L20.001 20H4Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M12.515 10.005L10.859 11.682C10.84 11.698 10.817 11.704 10.799 11.722C10.78 11.741 10.773 11.766 10.756 11.786L7.288 15.297C7.104 15.484 7 15.737 7 16V18C7 18.553 7.448 19 8 19H10C10.263 19 10.516 18.896 10.703 18.712L14.214 15.244C14.234 15.227 14.259 15.221 14.278 15.202C14.296 15.184 14.302 15.161 14.318 15.142L15.999 13.481C16.958 12.522 16.958 10.96 15.999 10.002C15.04 9.041 13.479 9.041 12.515 10.005ZM9.589 17H9V16.41L11.521 13.858L12.142 14.479L9.589 17ZM14.589 12.062L13.564 13.074L12.926 12.435L13.933 11.415C14.113 11.235 14.405 11.235 14.584 11.415C14.763 11.595 14.765 11.887 14.589 12.062Z"
                        fill="#4B5563"
                      />
                    </svg>

                    {!isCollapsed && <span className="ml-3">Schedules</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tasks"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "tasks"
                    )}`}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 4H4C2.897 4 2 4.897 2 6V18C2 19.103 2.897 20 4 20H20C21.103 20 22 19.103 22 18V6C22 4.897 21.103 4 20 4ZM4 18V6H20L20.001 18H4Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M17 8H11C10.447 8 10 8.448 10 9C10 9.552 10.447 10 11 10H17C17.553 10 18 9.552 18 9C18 8.448 17.553 8 17 8Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M17 11H11C10.447 11 10 11.448 10 12C10 12.552 10.447 13 11 13H17C17.553 13 18 12.552 18 12C18 11.448 17.553 11 17 11Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M17 14H11C10.447 14 10 14.448 10 15C10 15.552 10.447 16 11 16H17C17.553 16 18 15.552 18 15C18 14.448 17.553 14 17 14Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M7 10C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8C6.44772 8 6 8.44772 6 9C6 9.55228 6.44772 10 7 10Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M7 16C7.55228 16 8 15.5523 8 15C8 14.4477 7.55228 14 7 14C6.44772 14 6 14.4477 6 15C6 15.5523 6.44772 16 7 16Z"
                        fill="#4B5563"
                      />
                    </svg>

                    {!isCollapsed && <span className="ml-3">Tasks</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/billing"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "/billing"
                    )}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M13.2383 6.38074C14.0269 6.56557 14.7409 7.00445 15.2808 7.63619C15.3641 7.73869 15.4657 7.82295 15.58 7.88414C15.6943 7.94534 15.8189 7.98228 15.9468 7.99285C16.0746 8.00342 16.2032 7.98742 16.3252 7.94576C16.4472 7.9041 16.5601 7.83759 16.6577 7.75004C16.7552 7.66249 16.8353 7.5556 16.8936 7.43549C16.9518 7.31537 16.9869 7.18438 16.997 7.04999C17.007 6.9156 16.9918 6.78045 16.9522 6.65224C16.9126 6.52403 16.8493 6.40529 16.766 6.30278C15.9591 5.34417 14.8875 4.67434 13.7009 4.38679C13.4979 4.3355 13.2979 4.31704 13.0959 4.28422V3.02569C13.0959 2.75366 12.993 2.49277 12.81 2.30042C12.627 2.10806 12.3788 2 12.12 2C11.8612 2 11.613 2.10806 11.43 2.30042C11.247 2.49277 11.1442 2.75366 11.1442 3.02569V4.31499C10.3203 4.41676 9.54076 4.76171 8.89573 5.30992C8.25069 5.85812 7.76657 6.58714 7.49942 7.41258C7.37724 7.90152 7.35187 8.41161 7.42489 8.91127C7.4979 9.41093 7.66775 9.8895 7.92391 10.3174C8.79973 11.7638 10.1849 12.7869 11.7765 13.1626C12.8547 13.4087 13.7995 14.0859 14.4113 15.0509C14.5308 15.2434 14.6127 15.459 14.652 15.6852C14.6914 15.9113 14.6875 16.1434 14.6406 16.3679C14.2971 17.6736 12.5328 18.3967 10.7821 17.9495C9.98564 17.7634 9.26559 17.3171 8.72508 16.6746C8.64287 16.5712 8.54209 16.4859 8.42851 16.4234C8.31492 16.361 8.19074 16.3227 8.06306 16.3107C7.80521 16.2864 7.54876 16.3709 7.35012 16.5454C7.15148 16.7199 7.02694 16.9702 7.00388 17.2412C6.99246 17.3754 7.0063 17.5106 7.04462 17.6392C7.08293 17.7678 7.14496 17.8872 7.22716 17.9906C8.03571 18.9679 9.1185 19.6502 10.3196 19.9394C10.5923 20.0082 10.8691 20.0578 11.1481 20.0881V20.9743C11.1481 21.2463 11.2509 21.5072 11.4339 21.6996C11.6169 21.8919 11.8651 22 12.1239 22C12.3827 22 12.6309 21.8919 12.8139 21.6996C12.9969 21.5072 13.0998 21.2463 13.0998 20.9743V19.9732C13.8813 19.839 14.6131 19.4829 15.2162 18.9435C15.8193 18.4042 16.2708 17.7019 16.522 16.9126C16.6432 16.4237 16.6677 15.9139 16.5942 15.4147C16.5207 14.9155 16.3507 14.4374 16.0946 14.0098C15.2181 12.5651 13.8341 11.5429 12.2439 11.1656C11.166 10.9196 10.2213 10.2428 9.60919 9.27832C9.48977 9.08557 9.408 8.86978 9.36863 8.64351C9.32926 8.41725 9.33308 8.18501 9.37986 7.96031C9.72434 6.65665 11.4916 5.93354 13.2383 6.38074Z"
                        fill="#4B5563"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Billing</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/clients"
                    className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${useBackgroundClass(
                      "/clients"
                    )}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M14 2.10526C13.521 2.10912 13.0467 2.20435 12.6 2.38632C12.8375 3.06748 12.9698 3.78427 12.992 4.50948C13.2964 4.31645 13.6446 4.21319 14 4.21053C14.3412 4.20927 14.677 4.29993 14.9756 4.47387C15.2741 4.64781 15.5254 4.89925 15.7055 5.20428C15.8857 5.50931 15.9887 5.85778 16.0048 6.21655C16.0209 6.57532 15.9495 6.93245 15.7974 7.25398C15.6454 7.57551 15.4177 7.85074 15.136 8.0535C14.8544 8.25626 14.5282 8.3798 14.1884 8.41237C13.8486 8.44494 13.5065 8.38546 13.1947 8.23958C12.8829 8.0937 12.6117 7.86628 12.407 7.57895C12.1196 8.23844 11.7345 8.84567 11.266 9.3779C11.7412 9.84997 12.319 10.1923 12.9489 10.375C13.5788 10.5577 14.2417 10.5752 14.8795 10.426C15.5173 10.2767 16.1107 9.96524 16.6078 9.51882C17.1048 9.07239 17.4904 8.50459 17.7309 7.86505C17.9713 7.22552 18.0592 6.53373 17.9869 5.85016C17.9147 5.16659 17.6844 4.51206 17.3164 3.9438C16.9483 3.37553 16.4535 2.91084 15.8754 2.59034C15.2973 2.26984 14.6534 2.10329 14 2.10526Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M15 11.5789H13.736C14.1641 12.2215 14.4913 12.9323 14.705 13.6842H15C15.7956 13.6842 16.5587 14.0169 17.1213 14.6091C17.6839 15.2014 18 16.0046 18 16.8421V17.8947H15V18.9474C14.9968 19.3068 14.9345 19.6629 14.816 20H19C19.2652 20 19.5196 19.8891 19.7071 19.6917C19.8946 19.4943 20 19.2265 20 18.9474V16.8421C19.9984 15.4467 19.4711 14.109 18.5338 13.1223C17.5964 12.1357 16.3256 11.5806 15 11.5789Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M6.5 9.47369C5.60998 9.47369 4.73995 9.19588 3.99993 8.67538C3.25991 8.15489 2.68314 7.4151 2.34254 6.54955C2.00195 5.68401 1.91283 4.73159 2.08647 3.81273C2.2601 2.89387 2.68868 2.04985 3.31802 1.38739C3.94736 0.724932 4.74918 0.273791 5.62209 0.0910192C6.49501 -0.0917529 7.39981 0.00205238 8.22208 0.360573C9.04434 0.719093 9.74715 1.32623 10.2416 2.1052C10.7361 2.88416 11 3.79998 11 4.73684C10.9987 5.9927 10.5241 7.19673 9.68052 8.08476C8.83689 8.97279 7.69307 9.47229 6.5 9.47369ZM6.5 2.10526C6.00555 2.10526 5.5222 2.2596 5.11107 2.54877C4.69995 2.83793 4.37952 3.24892 4.1903 3.72978C4.00108 4.21064 3.95157 4.73976 4.04804 5.25024C4.1445 5.76072 4.3826 6.22962 4.73223 6.59765C5.08186 6.96568 5.52732 7.21632 6.01227 7.31786C6.49723 7.4194 6.99989 7.36728 7.45671 7.16811C7.91352 6.96893 8.30397 6.63163 8.57867 6.19887C8.85338 5.76611 9 5.25732 9 4.73684C9 4.03891 8.73661 3.36955 8.26777 2.87604C7.79893 2.38252 7.16304 2.10526 6.5 2.10526Z"
                        fill="#4B5563"
                      />
                      <path
                        d="M12 20H1C0.734784 20 0.48043 19.8891 0.292893 19.6917C0.105357 19.4943 0 19.2265 0 18.9474V15.7895C0.00158786 14.3941 0.528882 13.0564 1.46622 12.0697C2.40356 11.083 3.67441 10.528 5 10.5263H8C9.32559 10.528 10.5964 11.083 11.5338 12.0697C12.4711 13.0564 12.9984 14.3941 13 15.7895V18.9474C13 19.2265 12.8946 19.4943 12.7071 19.6917C12.5196 19.8891 12.2652 20 12 20ZM2 17.8947H11V15.7895C11 14.9519 10.6839 14.1487 10.1213 13.5565C9.55871 12.9643 8.79565 12.6316 8 12.6316H5C4.20435 12.6316 3.44129 12.9643 2.87868 13.5565C2.31607 14.1487 2 14.9519 2 15.7895V17.8947Z"
                        fill="#4B5563"
                      />
                    </svg>
                    {!isCollapsed && <span className="ml-3">Clients</span>}
                  </Link>
                </li>
              </ul>
            </div>

            <div
              className={`p-0 ${
                isCollapsed ? "sm:ml-16" : "sm:ml-64"
              } mt-16 transition-all	`}
            >
              <DynamicBreadcrumb />
              <div className="px-3 md:px-6 pb-8">{children}</div>
            </div>
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
