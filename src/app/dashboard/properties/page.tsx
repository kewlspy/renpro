"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Property = {
  id: string;
  name: string;
  address: string;
  createdAt: string;
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
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

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="flex flex-col justify-between p-6 space-y-8 bg-gray-100">
      <div className="flex justify-end">
        <LogoutButton />
      </div>
      <div className="p-4">
        <div className="flex justify-between"><h1 className="text-2xl text-purple-900 font-bold mb-4">
          My Properties
        </h1>
        <button className="mb-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          <Link href="/dashboard/properties/add">Add New Property</Link>
        </button></div>
        {properties.length === 0 ? (
          <p className="text-gray-500">No properties found.</p>
        ) : (
          <ul className="space-y-4">
            {properties.map((property) => (
              <li
                key={property.id}
                className="p-4 bg-white shadow rounded-md border border-gray-200"
              >
                <h2 className="text-lg text-purple-900 font-semibold">
                  {property.name}
                </h2>
                <p className="text-sm text-gray-600">{property.address}</p>
                <p className="text-xs text-gray-400">
                  Added on {new Date(property.createdAt).toLocaleDateString()}
                </p>

                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="text-purple-500 text-sm hover:underline mt-2 inline-block"
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
