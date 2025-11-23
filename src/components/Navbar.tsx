"use client";

import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="bg-purple-600 text-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-purple-600 font-bold text-lg">R</span>
        </div>
        <h1 className="text-2xl font-bold">RentPro</h1>
      </div>
      <LogoutButton />
    </nav>
  );
}
