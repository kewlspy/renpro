"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

type WorkOrder = {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: string;
  createdAt: string;
  resolvedAt?: string;
};

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const res = await fetch("/api/work-orders", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setWorkOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const stats = {
    pending: workOrders.filter((w) => w.status === "PENDING").length,
    inProgress: workOrders.filter((w) => w.status === "IN_PROGRESS").length,
    completed: workOrders.filter((w) => w.status === "COMPLETED").length,
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.PENDING;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Maintenance Requests
        </h1>
        <p className="text-gray-600 mt-1">
          Track and manage property maintenance requests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pending}
              </h3>
            </div>
            <AlertCircle size={32} className="text-yellow-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.inProgress}
              </h3>
            </div>
            <Clock size={32} className="text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.completed}
              </h3>
            </div>
            <CheckCircle size={32} className="text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading maintenance requests...</p>
      ) : (
        <DataTable
          title="All Maintenance Requests"
          columns={[
            { key: "title", label: "Title" },
            { key: "priority", label: "Priority" },
            {
              key: "status",
              label: "Status",
              render: (value) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                    value
                  )}`}
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
      )}
    </div>
  );
}
