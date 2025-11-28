"use client";

import React, { useState } from "react";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - desktop and mobile variants handled inside component */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 ml-0 ${
          collapsed ? "sm:ml-0" : "sm:ml-0"
        } flex flex-col`}
      >
        <TopNav
          onToggleMobile={() => setMobileOpen((s) => !s)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
