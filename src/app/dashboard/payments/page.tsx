"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { CreditCard, Plus } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  paidAt: string;
  lease?: {
    id: string;
    tenant?: { name: string };
    rent: number;
  };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    leaseId: "",
    amount: "",
    paidAt: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setPayments(Array.isArray(data) ? data : []);
        }
        // fetch pending list
        try {
          const pRes = await fetch("/api/payments/pending", {
            cache: "no-store",
            credentials: "include",
          });
          if (pRes.ok) {
            const d = await pRes.json();
            setPendingList(Array.isArray(d) ? d : []);
          }
        } catch (err) {
          console.warn("Failed to load pending payments", err);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
    // preload leases for payment modal
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const res = await fetch("/api/leases", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLeases(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("Failed to fetch leases", err);
    }
  };

  const openModal = () => {
    setForm({
      leaseId: "",
      amount: "",
      paidAt: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreatePayment = async () => {
    if (!form.leaseId || !form.amount || !form.paidAt) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: form.leaseId,
          amount: form.amount,
          paidAt: form.paidAt,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        // refresh lists
        const pRes = await fetch("/api/payments", {
          cache: "no-store",
          credentials: "include",
        });
        if (pRes.ok) setPayments(await pRes.json());
        const pend = await fetch("/api/payments/pending", {
          cache: "no-store",
          credentials: "include",
        });
        if (pend.ok) setPendingList(await pend.json());
      } else {
        const err = await res.json();
        alert(err?.message || "Failed to create payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating payment");
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = pendingList.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Track and manage tenant payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="ml-4">
              <CreditCard size={32} className="text-purple-600 opacity-50" />
            </div>
          </div>
          <button
            onClick={openModal}
            className="ml-4 px-3 py-2 bg-green-600 text-white rounded flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus size={16} />
            <span className="text-sm">Add Payment</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {pendingPayments}
              </h3>
            </div>
            <CreditCard size={32} className="text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Pending Payments
        </h2>
        {pendingList.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-500">No pending payments</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Amount Due
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((p) => (
                  <tr key={p.leaseId} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {p.tenant?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.tenant?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{p.property?.name}</td>
                    <td className="px-6 py-4 text-sm">{p.room?.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      ${Number(p.pending).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading payments...</p>
      ) : (
        <DataTable
          title="Payment History"
          columns={[
            {
              key: "tenantName" as any,
              label: "Tenant",
              render: (_, row: Payment) => row.lease?.tenant?.name || "Unknown",
            },
            {
              key: "amount",
              label: "Amount",
              render: (value) => `$${Number(value).toFixed(2)}`,
            },
            {
              key: "paidAt",
              label: "Date",
              render: (value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
            },
          ]}
          data={payments}
          emptyMessage="No payments found"
        />
      )}

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Lease
                </label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.leaseId}
                  onChange={(e) =>
                    setForm({ ...form, leaseId: e.target.value })
                  }
                >
                  <option value="">Select lease</option>
                  {leases.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.tenant?.name || l.id} — {l.room?.property?.name || ""}{" "}
                      / {l.room?.name || ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Paid At
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.paidAt}
                  onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayment}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Create Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
