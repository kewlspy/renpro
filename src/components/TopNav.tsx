"use client";

import React from "react";
import LogoutButton from "./LogoutButton";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  onToggleMobile?: () => void;
  onToggleCollapse?: () => void;
  collapsed?: boolean;
};

export default function TopNav({
  onToggleMobile,
  onToggleCollapse,
  collapsed,
}: Props) {
  return (
    <nav className="bg-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={onToggleMobile}
            className="sm:hidden p-2 rounded-md hover:bg-purple-500/20"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold text-lg">R</span>
          </div>
          <h1 className="text-lg md:text-2xl font-bold">RentPro</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-sm text-purple-100">
            Welcome, Owner
          </div>

          {/* Collapse toggle - visible on md+ */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex items-center justify-center p-2 rounded-md hover:bg-purple-500/20"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
