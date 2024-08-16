"use client";

import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import {
  HiArrowSmRight,
  HiChartPie,
  HiInbox,
  HiShoppingBag,
  HiTable,
  HiUser,
  HiViewBoards,
} from "react-icons/hi";

export default function Page() {
  return (
    <div className="flex min-h-screen">
      <div className="flex gap-4 flex-col justify-between py-6">
        <section className="grid grid-col md:grid-cols-8 p-0 rounded-md gap-4">
          <Sidebar
            aria-label="Sidebar with content separator example"
            className="bg-white p-0 rounded-md"
            id="sidebar-reports"
          >
            <Sidebar.Items className="bg-white">
              <Sidebar.ItemGroup>
                <Sidebar.Item href="#" icon={HiChartPie}>
                  Dashboard
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiViewBoards}>
                  Kanban
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiInbox}>
                  Inbox
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiUser}>
                  Users
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiShoppingBag}>
                  Products
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiArrowSmRight}>
                  Sign In
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiTable}>
                  Sign Up
                </Sidebar.Item>
              </Sidebar.ItemGroup>
              <Sidebar.ItemGroup>
                <Sidebar.Item href="#" icon={HiChartPie}>
                  Upgrade to Pro
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={HiViewBoards}>
                  Documentation
                </Sidebar.Item>
                <Sidebar.Item href="#" icon={BiBuoy}>
                  Help
                </Sidebar.Item>
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
        </section>
      </div>
    </div>
  );
}
