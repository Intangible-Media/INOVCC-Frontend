"use client";

import { Badge, Sidebar } from "flowbite-react";
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
  HiViewBoards,
} from "react-icons/hi";
import { Inter } from "next/font/google";
import AuthProvider from "../context/AuthProvider";
import Link from "next/link";
import { Breadcrumb } from "flowbite-react";
import SidePanel from "../components/SidePanel";
import { HiHome } from "react-icons/hi";

import { useEffect, useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>
          <SidePanel />
          <div className="p-4 pt-10 px-14 sm:ml-64">
            <div className="rounded-lg dark:border-gray-700 ">
              <div className="flex pb-10">
                <Breadcrumb
                  className="dark-text"
                  aria-label="Default breadcrumb example"
                >
                  <Breadcrumb.Item href="#" icon={HiHome}>
                    Home
                  </Breadcrumb.Item>
                  <Breadcrumb.Item href="#">Projects</Breadcrumb.Item>
                  <Breadcrumb.Item>Flowbite React</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
