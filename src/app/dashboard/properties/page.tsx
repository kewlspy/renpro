"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronDown } from "lucide-react";
import RoomCard from "./RoomCard";

type Lease = {
  id: string;
  tenantId: string;
  startDate: string;
  endDate: string;
};

type Room = {
  id: string;
  name: string;
  description?: string | null;
  leases: Lease[];
};

type Property = {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  rooms?: Room[];
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/properties", {
          cache: "no-store",
          credentials: "include", // ✅ include NextAuth cookies
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || "Failed to fetch properties");
        }

        const data: Property[] = await res.json();
        setProperties(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all your rental properties
          </p>
        </div>
        <Link
          href="/dashboard/properties/add"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 w-fit"
        >
          <Plus size={20} />
          <span>Add New Property</span>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No properties found.</p>
          <Link
            href="/dashboard/properties/add"
            className="text-purple-600 hover:underline mt-2 inline-block"
          >
            Create your first property
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li
              key={property.id}
              className="p-6 bg-white shadow-sm rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl text-purple-900 font-semibold">
                    {property.name}
                  </h2>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added on {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="text-purple-600 text-sm hover:underline"
                  >
                    View Details
                  </Link>

                  <button
                    aria-expanded={!!expanded[property.id]}
                    onClick={() =>
                      setExpanded((s) => ({
                        ...s,
                        [property.id]: !s[property.id],
                      }))
                    }
                    className="p-2 rounded hover:bg-gray-100"
                    title={expanded[property.id] ? "Hide rooms" : "Show rooms"}
                  >
                    <ChevronDown
                      size={20}
                      className={`transform transition-transform duration-150 ${
                        expanded[property.id] ? "rotate-180" : "rotate-0"
                      } text-gray-600`}
                    />
                  </button>
                </div>
              </div>

              {expanded[property.id] && (
                <div className="mt-4 space-y-2">
                  {(property.rooms || []).map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                  {(!property.rooms || property.rooms.length === 0) && (
                    <p className="text-sm text-gray-500">No rooms yet.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
