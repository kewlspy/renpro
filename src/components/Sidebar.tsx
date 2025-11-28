"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Leases", href: "/dashboard/leases", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Props = {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onClose,
}: Props) {
  const pathname = usePathname();

  // Desktop sidebar (hidden on small screens)
  const desktop = (
    <aside
      className={`hidden sm:block bg-gray-50 border-r border-gray-200 p-6 h-screen overflow-y-auto transition-all duration-200 ${
        collapsed ? "w-24" : "w-64"
      }`}
    >
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "space-x-3"
                } px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={collapsed ? 20 : 20} />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  // Mobile overlay sidebar
  const mobile = (
    <div
      className={`sm:hidden ${mobileOpen ? "fixed inset-0 z-50" : "hidden"}`}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">R</span>
            </div>
            <h2 className="text-lg font-bold">RentPro</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            Close
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}
