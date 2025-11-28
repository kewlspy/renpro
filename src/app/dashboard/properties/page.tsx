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
  const [propertyLeaseModal, setPropertyLeaseModal] = useState<{
    propertyId: string;
    propertyName: string;
  } | null>(null);
  const [tenants, setTenants] = useState<Array<any>>([]);
  const [filteredTenants, setFilteredTenants] = useState<Array<any>>([]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [form, setForm] = useState({
    tenantId: "",
    startDate: "",
    endDate: "",
    rent: "",
    rentDueDate: "1",
  });
  const [leaseLoading, setLeaseLoading] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/properties", {
          cache: "no-store",
          credentials: "include",
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

  const fetchTenants = async (phone: string = "") => {
    setLeaseLoading(true);
    try {
      const url = new URL("/api/tenants", window.location.origin);
      if (phone) url.searchParams.set("phone", phone);
      const res = await fetch(url.toString());
      const data = await res.json();
      setTenants(data || []);
      setFilteredTenants(data || []);
    } catch (err) {
      setTenants([]);
      setFilteredTenants([]);
    } finally {
      setLeaseLoading(false);
    }
  };

  const handlePhoneSearch = (phone: string) => {
    setPhoneSearch(phone);
    if (phone.trim()) {
      fetchTenants(phone);
    } else {
      setFilteredTenants(tenants);
    }
  };

  const openPropertyLeaseModal = (propertyId: string, propertyName: string) => {
    setPropertyLeaseModal({ propertyId, propertyName });
    setPhoneSearch("");
    setForm({
      tenantId: "",
      startDate: "",
      endDate: "",
      rent: "",
      rentDueDate: "1",
    });
    fetchTenants();
  };

  const closePropertyLeaseModal = () => {
    setPropertyLeaseModal(null);
    setPhoneSearch("");
    setForm({
      tenantId: "",
      startDate: "",
      endDate: "",
      rent: "",
      rentDueDate: "1",
    });
  };

  const handleCreatePropertyLease = async () => {
    if (
      !propertyLeaseModal ||
      !form.tenantId ||
      !form.startDate ||
      !form.endDate ||
      !form.rent
    ) {
      alert("Please fill all fields");
      return;
    }

    setLeaseLoading(true);
    try {
      const res = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: propertyLeaseModal.propertyId,
          tenantId: form.tenantId,
          startDate: form.startDate,
          endDate: form.endDate,
          rent: form.rent,
          rentDueDate: Number(form.rentDueDate),
        }),
      });

      if (res.ok) {
        closePropertyLeaseModal();
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err?.message || "Failed to create lease");
      }
    } catch (err) {
      alert("Error creating lease");
    } finally {
      setLeaseLoading(false);
    }
  };

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
                  <button
                    onClick={() =>
                      openPropertyLeaseModal(property.id, property.name)
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    Lease Property
                  </button>

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

      {/* Property Lease Modal */}
      {propertyLeaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closePropertyLeaseModal}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create Lease for {propertyLeaseModal.propertyName}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Search Tenant by Phone
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={phoneSearch}
                  onChange={(e) => handlePhoneSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Select Tenant
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.tenantId}
                  onChange={(e) =>
                    setForm({ ...form, tenantId: e.target.value })
                  }
                  disabled={leaseLoading}
                >
                  <option value="">
                    {leaseLoading ? "Loading..." : "Select tenant"}
                  </option>
                  {filteredTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.email} {t.phone ? `(${t.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Rent</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.rent}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Rent Due Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.rentDueDate}
                  onChange={(e) =>
                    setForm({ ...form, rentDueDate: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  onClick={closePropertyLeaseModal}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePropertyLease}
                  disabled={leaseLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {leaseLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
