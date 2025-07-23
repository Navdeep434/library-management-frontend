"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditAuthorPage(props) {
  const router = useRouter();

  const params = typeof props.params?.then === "function" ? use(props.params) : props.params;
  const { id } = params;

  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [loading, setLoading] = useState(true);
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
    fetchAuthor(storedToken);
  }, []);

  const fetchAuthor = async (authToken) => {
    try {
      const res = await fetch(`http://localhost:8080/api/authors/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch author");

      const data = await res.json();
      setName(data.name || "");
      setBiography(data.biography || "");
    } catch (err) {
      console.error("Failed to fetch author", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:8080/api/authors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, biography }),
      });

      if (res.ok) {
        window.alert("Author updated successfully!");
        router.push("/authors");
      } else {
        alert("Failed to update author");
      }
    } catch (err) {
      console.error("Update error", err);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading author data...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Edit Author</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
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
            placeholder="Write something about the author..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Author
        </button>
      </form>
    </div>
  );
}
