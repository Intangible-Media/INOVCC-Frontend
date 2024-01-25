"use client";

import {
  Badge,
  Sidebar,
  Dropdown,
  Avatar,
  Navbar,
  TextInput,
} from "flowbite-react";
import { Inter } from "next/font/google";
import AuthProvider from "../context/AuthProvider";
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
} from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";

import DynamicBreadcrumb from "../components/DynamicBreadcrumb";

import { useEffect, useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>
          <>
            <Navbar
              fluid
              className="fixed top-0 z-50 w-full bg-gray-800	 border-b border-blue-950 text-white dark:bg-gray-800 dark:border-gray-700"
            >
              <Navbar.Brand href="https://flowbite-react.com">
                <img
                  src="../../../logo-white.png"
                  className="mr-3 h-6 sm:h-9"
                  alt="Flowbite React Logo"
                />
              </Navbar.Brand>
              <div className="flex md:order-2">
                <div className="mr-5 flex align-middle m-autoa">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19.079 14.829C18.4881 14.2477 18.1488 13.4578 18.134 12.629V10.829C18.133 9.35216 17.6212 7.92113 16.6855 6.77854C15.7497 5.63596 14.4477 4.85214 13 4.56001V3.10001C13 2.83479 12.8946 2.58044 12.7071 2.3929C12.5196 2.20536 12.2652 2.10001 12 2.10001C11.7348 2.10001 11.4804 2.20536 11.2929 2.3929C11.1054 2.58044 11 2.83479 11 3.10001V4.56001C9.55183 4.85225 8.24937 5.6365 7.31359 6.7797C6.37781 7.9229 5.86635 9.35465 5.866 10.832V12.418C5.86607 12.4886 5.87378 12.559 5.889 12.628H5.866C5.85125 13.4568 5.51194 14.2467 4.921 14.828C4.38423 15.3542 4.05692 16.0575 4 16.807C4 17.35 4 19 5.538 19H7.746C8.03584 19.9003 8.60385 20.6855 9.36829 21.2425C10.1327 21.7995 11.0542 22.0995 12 22.0995C12.9458 22.0995 13.8673 21.7995 14.6317 21.2425C15.3961 20.6855 15.9642 19.9003 16.254 19H18.462C20 19 20 17.35 20 16.807C19.9428 16.0578 19.6156 15.3549 19.079 14.829ZM12 20.1C11.5932 20.0995 11.1928 19.9989 10.834 19.8071C10.4753 19.6152 10.1693 19.3381 9.943 19H14.057C13.8307 19.3381 13.5247 19.6152 13.166 19.8071C12.8072 19.9989 12.4068 20.0995 12 20.1ZM18 17H6C6 16.933 6 16.864 6 16.807C6.1063 16.54 6.26627 16.2977 6.47 16.095C7.35569 15.1579 7.85559 13.9214 7.87 12.632V10.832C7.8681 9.71355 8.2954 8.63699 9.06382 7.82429C9.83224 7.01159 10.8832 6.5247 12 6.46401C13.1175 6.52372 14.1695 7.01017 14.9387 7.82298C15.708 8.63578 16.1359 9.71289 16.134 10.832V12.418C16.1342 12.4886 16.1416 12.5589 16.156 12.628H16.134C16.1484 13.9174 16.6483 15.1539 17.534 16.091C17.7377 16.2937 17.8977 16.536 18.004 16.803C18 16.864 18 16.933 18 17Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <Avatar
                      alt="User settings"
                      img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                      rounded
                    />
                  }
                >
                  <Dropdown.Header>
                    <span className="block text-sm">Bonnie Green</span>
                    <span className="block truncate text-sm font-medium">
                      name@flowbite.com
                    </span>
                  </Dropdown.Header>
                  <Dropdown.Item>Dashboard</Dropdown.Item>
                  <Dropdown.Item>Settings</Dropdown.Item>
                  <Dropdown.Item>Earnings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item>Sign out</Dropdown.Item>
                </Dropdown>
                <Navbar.Toggle />
              </div>
              <Navbar.Collapse>
                <TextInput
                  type="text"
                  placeholder="Search Anything"
                  id="search-bar"
                  className="bg-gray-700 rounded-md"
                />
              </Navbar.Collapse>
            </Navbar>

            <div
              className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all duration-300  px-3 py-4 ${
                isCollapsed ? "w-auto" : "w-64"
              } bg-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all`}
            >
              <button onClick={toggleSidebar}>
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
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                    href="/billing"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
              </ul>
              <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-300 dark:border-gray-700">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                  >
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 17 20"
                    >
                      <path d="M7.958 19.393a7.7 7.7 0 0 1-6.715-3.439c-2.868-4.832 0-9.376.944-10.654l.091-.122a3.286 3.286 0 0 0 .765-3.288A1 1 0 0 1 4.6.8c.133.1.313.212.525.347A10.451 10.451 0 0 1 10.6 9.3c.5-1.06.772-2.213.8-3.385a1 1 0 0 1 1.592-.758c1.636 1.205 4.638 6.081 2.019 10.441a8.177 8.177 0 0 1-7.053 3.795Z" />
                    </svg>
                    {!isCollapsed && (
                      <span className="ml-3">Upgrade to Pro</span>
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                  >
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 16 20"
                    >
                      <path d="M16 14V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v15a3 3 0 0 0 3 3h12a1 1 0 0 0 0-2h-1v-2a2 2 0 0 0 2-2ZM4 2h2v12H4V2Zm8 16H3a1 1 0 0 1 0-2h9v2Z" />
                    </svg>
                    {!isCollapsed && (
                      <span className="ml-3">Documentation</span>
                    )}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                  >
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 18"
                    >
                      <path d="M18 0H6a2 2 0 0 0-2 2h14v12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                      <path d="M14 4H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM2 16v-6h12v6H2Z" />
                    </svg>

                    {!isCollapsed && <span className="ml-3">Components</span>}
                  </a>
                </li>
              </ul>
            </div>

            <div
              className={`p-0 ${
                isCollapsed ? "sm:ml-16" : "sm:ml-64"
              } mt-16 transition-all	`}
            >
              <DynamicBreadcrumb />
              <div className="p-4">{children}</div>
            </div>
          </>
        </AuthProvider>
      </body>
    </html>
  );
}
