"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { CreditCard } from "lucide-react";

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingCount = payments.filter(
    (p) => new Date(p.paidAt) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Track and manage tenant payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${totalRevenue.toFixed(2)}
              </h3>
            </div>
            <CreditCard size={32} className="text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {pendingCount}
              </h3>
            </div>
            <CreditCard size={32} className="text-orange-600 opacity-50" />
          </div>
        </div>
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
    </div>
  );
}
