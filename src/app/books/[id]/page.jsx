"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
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
    fetchInitialData(storedToken);
  }, []);

  const fetchInitialData = async (authToken) => {
    try {
      const [bookRes, authorsRes, publishersRes] = await Promise.all([
        fetch(`http://localhost:8080/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
        fetch("http://localhost:8080/api/authors", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
        fetch("http://localhost:8080/api/publishers", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
      ]);

      if (!bookRes.ok || !authorsRes.ok || !publishersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const book = await bookRes.json();
      setTitle(book.title);
      setAuthorId(book.author.id);
      setPublisherId(book.publisher.id);
      setCategory(book.category);
      setPreview(book.thumbnailUrl);

      setAuthors(await authorsRes.json());
      setPublishers(await publishersRes.json());
    } catch (err) {
      console.error("Failed to load book data", err);
      alert("Error loading book. Please try again.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:8080/api/books/${id}`, {
        method: "PUT",
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
        alert("Failed to update book.");
        return;
      }

      if (role === "ADMIN" && thumbnail) {
        const formData = new FormData();
        formData.append("file", thumbnail);

        const thumbRes = await fetch(`http://localhost:8080/api/books/${id}/thumbnail`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!thumbRes.ok) {
          alert("Book updated, but thumbnail upload failed.");
        }
      }

      window.alert("Book updated successfully!");
      router.push("/books");
    } catch (err) {
      console.error("Error updating book:", err);
      alert("Something went wrong while updating the book.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow-md space-y-4">
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

        {role === "ADMIN" && (
          <div>
            <label className="block mb-1 font-medium">Thumbnail</label>
            {preview && (
              <img
                src={`http://localhost:8080/${preview}`}
                alt="Thumbnail"
                className="h-24 mb-2 rounded"
              />
            )}
            <div className="relative w-fit">
              <label className="cursor-pointer inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded shadow">
                Choose Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Update Book
        </button>
      </form>
    </div>
  );
}
