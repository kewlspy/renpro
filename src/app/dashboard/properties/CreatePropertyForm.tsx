"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePropertyForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    rooms: [{ name: "", description: "" }],
  });
  const [loading, setLoading] = useState(false);

  if (status === "loading") return <p>Loading session...</p>;
  if (!session?.user) return <p>You must be signed in to add a property.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setForm({
        name: "",
        address: "",
        rooms: [{ name: "", description: "" }],
      });
      router.refresh(); // to re-fetch properties
    } else {
      const { error } = await res.json();
      alert("Error: " + error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-6 bg-white shadow-md rounded"
    >
      <h2 className="text-xl text-purple-900 font-semibold">
        Add New Property
      </h2>

      <input
        type="text"
        placeholder="Property Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="border text-slate-700 p-2 w-full"
      />

      <input
        type="text"
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        required
        className="border text-slate-700 p-2 w-full"
      />
      <input
        type="number"
        placeholder="Number of Rooms"
        value={form.rooms.length}
        onChange={(e) => {
          const count = Math.max(1, parseInt(e.target.value, 10) || 1);
          setForm({
            ...form,
            rooms: Array.from({ length: count }, (_, i) => ({
              name: form.rooms[i]?.name || "",
              description: form.rooms[i]?.description || "",
            })),
          });
        }}
        className="border text-slate-700 p-2 w-full"
      />
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Property"}
      </button>
    </form>
  );
}
