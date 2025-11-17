"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPropertyPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [roomCount, setRoomCount] = useState(0);
  const [rooms, setRooms] = useState<{ name: string; description: string }[]>(
    []
  );
  const router = useRouter();

  const handleRoomCountChange = (count: number) => {
    setRoomCount(count);
    const updatedRooms = Array.from(
      { length: count },
      (_, i) => rooms[i] || { name: "", description: "" }
    );
    setRooms(updatedRooms);
  };

  const handleRoomChange = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        address,
        rooms,
      }),
    });

    if (res.ok) {
      router.push("/dashboard/properties");
    } else {
      const error = await res.json();
      alert(error.message || "Failed to create property");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-10 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 rounded bg-white shadow-md w-full max-w-md"
      >
        <h2 className="text-xl text-purple-900 font-semibold">
          Add New Property
        </h2>

        <div>
          <label className="block mb-1 text-slate-700 font-medium">
            Property Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border w-full text-slate-700 px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-700 font-medium">
            Address
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="border text-slate-700 w-full px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1 font-medium">
            Number of Rooms
          </label>
          <input
            type="number"
            min={0}
            value={roomCount}
            onChange={(e) => handleRoomCountChange(parseInt(e.target.value))}
            className="border text-slate-700 w-full px-3 py-2 rounded"
          />
        </div>

        {rooms.map((room, index) => (
          <div
            key={index}
            className="flex flex-col border p-4 rounded bg-purple-200 mt-4"
          >
            <h3 className="font-semibold text-slate-700 mb-2">
              Room {index + 1}
            </h3>
            <input
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => handleRoomChange(index, "name", e.target.value)}
              className="border text-purple-600 w-full px-3 py-2 rounded mb-2"
              required
            />
            <input
              placeholder="Description"
              value={room.description}
              onChange={(e) =>
                handleRoomChange(index, "description", e.target.value)
              }
              className="border text-purple-600  w-full px-3 py-2 rounded"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-800 cursor-pointer"
        >
          Create Property
        </button>
      </form>
    </div>
  );
}
