"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { set } from "zod/v4";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isRegister && !role) {
      setError("Please select at least one role.");
      setLoading(false);
      return;
    }
    try {
      setError(null); // clear previous errors

      if (isRegister) {
        // 1️⃣ Register user
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone, role }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
          setLoading(false);
          return;
        }

        // // 2️⃣ Auto-login after registration
        // const loginRes = await signIn("credentials", {
        //   email,
        //   password,
        //   redirect: false,
        // });

        // if (!loginRes || !loginRes.ok) {
        //   setError("Auto-login failed. Please log in manually.");
        //   return;
        // }

        // 3️⃣ Redirect new user to login
          router.refresh();
       
        return;
      }

      // 4️⃣ Regular Login Flow
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginRes || !loginRes.ok) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/dashboard/properties");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Try again.");
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
            className="w-full border focus:border-2 focus:border-purple-900 focus:outline-none p-2 text-purple-600 rounded"
            required
          />
        )}
        {isRegister && (
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border focus:border-2 focus:border-purple-900 focus:outline-none p-2 text-purple-600 rounded"
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
        {isRegister && (
          <>
            {/* Role Selection */}
            <div className="flex items-center gap-4 my-2">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="radio"
                  name="role"
                  value="OWNER"
                  checked={role === "OWNER"}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-purple-600"
                />
                Owner
              </label>

              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="radio"
                  name="role"
                  value="TENANT"
                  checked={role === "TENANT"}
                  onChange={(e) => setRole(e.target.value)}
                  className="accent-purple-600"
                />
                Tenant
              </label>
            </div>
          </>
        )}

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
          onClick={() => {
            setIsRegister(!isRegister), setError(null);
          }}
          className=" cursor-pointer text-purple-400 hover:underline"
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
