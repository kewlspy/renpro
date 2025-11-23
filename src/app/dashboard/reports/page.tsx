"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propsRes, paymentsRes, woRes] = await Promise.all([
          fetch("/api/properties", {
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

        let totalRevenue = 0;
        if (paymentsRes.ok) {
          const payments = await paymentsRes.json();
          totalRevenue = payments.reduce(
            (sum: number, p: any) => sum + Number(p.amount),
            0
          );
        }

        const propsCount = propsRes.ok ? (await propsRes.json()).length : 0;
        const woCount = woRes.ok ? (await woRes.json()).length : 0;

        setStats({
          properties: propsCount,
          revenue: totalRevenue,
          maintenanceRequests: woCount,
          averageRevenue:
            propsCount > 0 ? (totalRevenue / propsCount).toFixed(2) : 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          View detailed insights about your rental business
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading reports...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.properties || 0}
                  </h3>
                </div>
                <BarChart3 size={32} className="text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    ${stats?.revenue?.toFixed(2) || 0}
                  </h3>
                </div>
                <DollarSign size={32} className="text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Revenue/Property</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    ${stats?.averageRevenue || 0}
                  </h3>
                </div>
                <TrendingUp size={32} className="text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Maintenance Tasks</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.maintenanceRequests || 0}
                  </h3>
                </div>
                <BarChart3 size={32} className="text-orange-600 opacity-50" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Business Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Active Properties</span>
                <span className="font-semibold text-gray-900">
                  {stats?.properties || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Total Collected</span>
                <span className="font-semibold text-gray-900">
                  ${stats?.revenue?.toFixed(2) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Open Maintenance</span>
                <span className="font-semibold text-gray-900">
                  {stats?.maintenanceRequests || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Monthly Revenue</span>
                <span className="font-semibold text-gray-900">
                  ${(Number(stats?.revenue || 0) / 12 || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
