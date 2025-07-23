"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "normal",
  });

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
      } catch (err) {
        console.error("Invalid user data");
        router.push("/login");
        return;
      }
    }

    if (!storedToken) storedToken = localStorage.getItem("token");
    if (!storedRole) storedRole = localStorage.getItem("userRole");

    if (!storedToken || !storedRole) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setRole(storedRole);

    if (storedRole !== "ADMIN") {
      alert("Access denied. Admins only.");
      router.push("/"); // or a 403 page
      return;
    }

    fetchUser(storedToken);
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setForm({
        name: data.name,
        email: data.email,
        password: "",
        role: data.role,
      });
    } catch (err) {
      console.error("Failed to fetch user", err);
      alert("Could not load user data.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/users");
      } else {
        alert("Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Something went wrong while updating.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4 max-w-lg">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Leave blank to keep unchanged"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="normal">Normal User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Update User
        </button>
      </form>
    </div>
  );
}
