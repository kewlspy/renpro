"use client";

import React from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "purple" | "blue" | "orange";
}

const colorClasses = {
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
};

export default function SummaryCard({
  title,
  value,
  icon,
  color,
}: SummaryCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border shadow-sm transition-transform hover:shadow-md hover:-translate-y-1 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="text-2xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}
