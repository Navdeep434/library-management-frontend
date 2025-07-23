"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditPublisherPage(props) {
  const router = useRouter();

  // Safely unwrap route params
  const params = typeof props.params?.then === "function" ? use(props.params) : props.params;
  const { id } = params;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    let storedToken = null;
    let storedRole = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        storedToken = user.token;
        storedRole = user.role;
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
        return;
      }
    }

    if (!storedToken) storedToken = localStorage.getItem("token");
    if (!storedRole) storedRole = localStorage.getItem("userRole");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setRole(storedRole);
    fetchPublisher(storedToken);
  }, []);

  const fetchPublisher = async (authToken) => {
    try {
      const res = await fetch(`http://localhost:8080/api/publishers/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch publisher");

      const data = await res.json();
      setName(data.name || "");
      setAddress(data.address || "");
    } catch (err) {
      console.error("Failed to fetch publisher", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:8080/api/publishers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, address }),
      });

      if (res.ok) {
        router.push("/publishers");
      } else {
        alert("Failed to update publisher");
      }
    } catch (err) {
      console.error("Error updating publisher:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading publisher data...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-xl font-bold mb-4">Edit Publisher</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Publisher Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Update Publisher
        </button>
      </form>
    </div>
  );
}
