"use client";

import React, { useState, useEffect } from "react";
import SummaryCard from "@/components/SummaryCard";
import DataTable from "@/components/DataTable";
import { Home, CreditCard, Wrench } from "lucide-react";

type Property = {
  id: string;
  name: string;
  address: string;
  createdAt: string;
};

type Lease = {
  id: string;
  rent: number;
  startDate: string;
  endDate: string;
  tenant?: { id: string; name: string; email: string };
};

type Payment = {
  id: string;
  amount: number;
  paidAt: string;
  lease?: { id: string; tenant?: { name: string } };
};

type WorkOrder = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, leasesRes, paymentsRes, woRes] = await Promise.all([
          fetch("/api/properties", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/leases", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/payments", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/work-orders", {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

        if (propsRes.ok) {
          const propsData = await propsRes.json();
          setProperties(Array.isArray(propsData) ? propsData : []);
        }

        if (leasesRes.ok) {
          const leasesData = await leasesRes.json();
          setLeases(Array.isArray(leasesData) ? leasesData : []);
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        }

        if (woRes.ok) {
          const woData = await woRes.json();
          setWorkOrders(Array.isArray(woData) ? woData : []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics
  const totalProperties = properties.length;
  const pendingPayments = payments.filter((p) => {
    const paidDate = new Date(p.paidAt);
    const today = new Date();
    return paidDate > today;
  }).length;
  const newMaintenance = workOrders.filter(
    (wo) => wo.status === "PENDING"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of your rental properties.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Properties"
          value={totalProperties}
          icon={<Home />}
          color="purple"
        />
        <SummaryCard
          title="Pending Payments"
          value={pendingPayments}
          icon={<CreditCard />}
          color="blue"
        />
        <SummaryCard
          title="New Maintenance"
          value={newMaintenance}
          icon={<Wrench />}
          color="orange"
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties Table */}
        <DataTable
          title="My Properties"
          columns={[
            { key: "name", label: "Property" },
            { key: "address", label: "Location" },
          ]}
          data={properties}
          emptyMessage="No properties found"
        />

        {/* Pending Payments Table */}
        <DataTable
          title="Pending Payments"
          columns={[
            {
              key: "tenantName" as any,
              label: "Tenant",
              render: (_, row: Payment) => row.lease?.tenant?.name || "Unknown",
            },
            {
              key: "propertyId" as any,
              label: "Property",
              render: (_, row: Payment) => row.lease?.id || "Unknown Property",
            },
            {
              key: "amount",
              label: "Amount",
              render: (value) => `$${Number(value).toFixed(2)}`,
            },
          ]}
          data={payments}
          emptyMessage="No pending payments"
        />
      </div>

      {/* Full Width Tables */}
      <div>
        <DataTable
          title="Recent Maintenance Requests"
          columns={[
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            {
              key: "status",
              label: "Status",
              render: (value) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    value === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : value === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {value}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "Created",
              render: (value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
            },
          ]}
          data={workOrders}
          emptyMessage="No maintenance requests"
        />
      </div>
    </div>
  );
}
