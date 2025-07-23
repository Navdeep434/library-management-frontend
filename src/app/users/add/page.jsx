"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // Required dropdown value
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");

    try {
      if (!userData) throw new Error();

      const parsed = JSON.parse(userData);
      const storedToken = parsed.token;
      const storedRole = parsed.role;

      if (!storedToken || !storedRole) throw new Error();

      if (storedRole !== "ADMIN") {
        alert("Access denied. Admins only.");
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      alert("Please select a role for the user.");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("Missing token");

      const { token } = JSON.parse(userData);

      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token directly from localStorage
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/users");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4 max-w-lg"
      >
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
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select role</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add User
        </button>
      </form>
    </div>
  );
}
