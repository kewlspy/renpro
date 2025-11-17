// app/dashboard/properties/client-view.tsx
"use client";

import { useEffect, useState } from "react";

export default function PropertiesClientView() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {properties.map((p: any) => (
        <li key={p.id}>{p.address}</li>
      ))}
    </ul>
  );
}
