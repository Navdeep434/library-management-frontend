"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBookPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [category, setCategory] = useState("");
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    let storedToken = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        storedToken = user.token;
      } catch (err) {
        console.error("Invalid user data");
        router.push("/login");
        return;
      }
    }

    if (!storedToken) storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    fetchData(storedToken);
  }, []);

  const fetchData = async (authToken) => {
    try {
      const [authorsRes, publishersRes] = await Promise.all([
        fetch("http://localhost:8080/api/authors", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch("http://localhost:8080/api/publishers", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (!authorsRes.ok || !publishersRes.ok) {
        throw new Error("Failed to fetch authors or publishers");
      }

      setAuthors(await authorsRes.json());
      setPublishers(await publishersRes.json());
    } catch (err) {
      console.error("Failed to load authors/publishers", err);
      alert("Failed to load authors or publishers.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          author: { id: Number(authorId) },
          publisher: { id: Number(publisherId) },
        }),
      });

      if (!res.ok) {
        alert("Failed to add book.");
        return;
      }

      router.push("/books");
    } catch (err) {
      console.error("Error creating book:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Book</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Author</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Publisher</label>
          <select
            value={publisherId}
            onChange={(e) => setPublisherId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Publisher</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Book
        </button>
      </form>
    </div>
  );
}
