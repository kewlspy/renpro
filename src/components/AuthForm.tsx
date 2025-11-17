"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
          return;
        }

        // Auto-login after successful registration
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          router.push("/"); // Redirect to home/dashboard
        } else {
          setError("Auto-login failed. Try logging in manually.");
        }
      } else {
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.ok) {
          router.push("/dashboard/properties"); // Redirect to dashboard
        } else {
          setError("Invalid credentials");
        }
      }
    } catch (err: any) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl text-slate-600 font-semibold text-center mb-6">
        {isRegister ? "Register" : "Login"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border text-slate-600 p-2 rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border focus:border-2 focus:border-purple-900 focus:outline-none p-2 text-purple-600 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border focus:border-2 focus:border-purple-900 focus:outline-none p-2 text-purple-600 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-900 cursor-pointer transition"
          disabled={loading}
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p className="text-center text-slate-600 mt-4 text-sm">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className=" cursor-pointer text-purple-400 hover:underline"
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
