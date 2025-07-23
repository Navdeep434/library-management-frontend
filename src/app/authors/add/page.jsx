"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddAuthorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    let storedToken = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        storedToken = user.token;
      } catch (err) {
        console.error("Error parsing user data:", err);
        router.push("/login");
        return;
      }
    }

    if (!storedToken) {
      storedToken = localStorage.getItem("token");
    }

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/authors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, biography }),
      });

      if (res.ok) {
        window.alert("Author added successfully!");
        router.push("/authors");
      } else {
        alert("Failed to add author.");
      }
    } catch (err) {
      console.error("Error creating author:", err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Add Author</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Author Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Biography</label>
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={4}
            className="w-full border rounded px-3 py-2"
            placeholder="Write a short biography..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Add Author
        </button>
      </form>
    </div>
  );
}
