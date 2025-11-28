"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Trash2, X } from "lucide-react";

type Tenant = {
  id: string;
  name: string;
  email: string;
};

type Room = {
  id: string;
  name: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
};

type Lease = {
  id: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rent: number;
  rentDueDate: number;
  tenant: Tenant;
  room: Room;
};

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    leaseId: string;
    currentEndDate: string;
  } | null>(null);
  const [editEndDate, setEditEndDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leases", {
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch leases");
      }

      const data: Lease[] = await res.json();
      setLeases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (lease: Lease) => {
    setEditModal({
      leaseId: lease.id,
      currentEndDate: new Date(lease.endDate).toISOString().split("T")[0],
    });
    setEditEndDate(new Date(lease.endDate).toISOString().split("T")[0]);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditEndDate("");
  };

  const handleUpdateEndDate = async () => {
    if (!editModal || !editEndDate) {
      alert("Please select an end date");
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch("/api/leases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: editModal.leaseId,
          endDate: editEndDate,
        }),
      });

      if (res.ok) {
        closeEditModal();
        fetchLeases();
      } else {
        const err = await res.json();
        alert(err?.message || "Failed to update lease");
      }
    } catch (err) {
      alert("Error updating lease");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteLease = async (leaseId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/leases?id=${leaseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setDeleteConfirm(null);
        fetchLeases();
      } else {
        const err = await res.json();
        alert(err?.message || "Failed to delete lease");
      }
    } catch (err) {
      alert("Error deleting lease");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading leases...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leases</h1>
        <p className="text-gray-600 mt-1">
          Manage all your active and past leases
        </p>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No leases found.</p>
          <p className="text-gray-400 mt-2">
            Create a lease from the Properties page
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Rent
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leases.map((lease) => {
                const now = new Date();
                const startDate = new Date(lease.startDate);
                const endDate = new Date(lease.endDate);
                const isActive = startDate <= now && endDate >= now;

                return (
                  <tr
                    key={lease.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      isActive ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {lease.tenant.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {lease.tenant.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {lease.room.property.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {lease.room.property.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lease.room.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(lease.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {new Date(lease.endDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${lease.rent}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(lease)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit end date"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(lease.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete lease"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeEditModal}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update End Date</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  New End Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEndDate}
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {editLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Lease?</h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lease? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLease(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
