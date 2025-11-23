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

  const activeLease = (room.leases || []).find((l) => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    return start <= now && end >= now;
  });

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

      <div className="text-xs text-gray-400">
        {activeLease ? (
          <div>
            <div>
              Ends: {new Date(activeLease.endDate).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div>—</div>
        )}
      </div>
    </div>
  );
}
