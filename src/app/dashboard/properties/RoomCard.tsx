"use client";

import React from "react";

type Lease = {
  id: string;
  tenantId: string;
  startDate: string;
  endDate: string;
};

type RoomProps = {
  room: {
    id: string;
    name: string;
    description?: string | null;
    leases: Lease[];
  };
};

export default function RoomCard({ room }: RoomProps) {
  const now = new Date();
  const [showModal, setShowModal] = React.useState(false);
  const [tenants, setTenants] = React.useState<Array<any>>([]);
  const [filteredTenants, setFilteredTenants] = React.useState<Array<any>>([]);
  const [phoneSearch, setPhoneSearch] = React.useState("");
  const [form, setForm] = React.useState({
    tenantId: "",
    startDate: "",
    endDate: "",
    rent: "",
    rentDueDate: "1",
  });
  const [loading, setLoading] = React.useState(false);

  const activeLease = (room.leases || []).find((l) => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return start <= now && end >= now;
  });

  const fetchTenants = async (phone: string = "") => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (showModal && !phoneSearch) {
      fetchTenants();
    }
  }, [showModal]);

  const handlePhoneSearch = (phone: string) => {
    setPhoneSearch(phone);
    if (phone.trim()) {
      fetchTenants(phone);
    } else {
      setFilteredTenants(tenants);
    }
  };

  const handleCreate = async () => {
    if (!form.tenantId || !form.startDate || !form.endDate || !form.rent) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch("/api/leases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: room.id,
        tenantId: form.tenantId,
        startDate: form.startDate,
        endDate: form.endDate,
        rent: form.rent,
        rentDueDate: Number(form.rentDueDate),
      }),
    });

    if (res.ok) {
      setShowModal(false);
      window.location.reload();
    } else {
      const err = await res.json();
      alert(err?.message || "Failed to create lease");
    }
  };

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-800">{room.name}</h3>
          {room.description && (
            <span className="text-xs text-gray-500">— {room.description}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {activeLease ? (
            <span className="text-green-700">
              Leased (tenant {activeLease.tenantId})
            </span>
          ) : (
            <span className="text-blue-700">Available</span>
          )}
        </p>
      </div>

      <div className="flex items-center space-x-3 text-xs text-gray-400">
        {activeLease ? (
          <div>
            <div>
              Ends: {new Date(activeLease.endDate).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm"
            >
              Create Lease
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create Lease for {room.name}
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
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading..." : "Select tenant"}
                  </option>
                  {filteredTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.email} {t.phone ? `(${t.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">End Date</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Rent</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2"
                  value={form.rent}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">
                  Rent Due Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="w-full border rounded px-3 py-2"
                  value={form.rentDueDate}
                  onChange={(e) =>
                    setForm({ ...form, rentDueDate: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
