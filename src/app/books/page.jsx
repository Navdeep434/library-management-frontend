"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  const [searchType, setSearchType] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

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
    fetchBooks("", storedToken);
  }, []);

  const fetchBooks = async (query = "", authToken = token) => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:8080/api/books/search?${query}`
        : `http://localhost:8080/api/books`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch books", err);
      alert("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      fetchBooks("");
      return;
    }
    const query = `${searchType}=${encodeURIComponent(trimmed)}`;
    fetchBooks(query);
  };

  const handleDelete = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      setBooks(books.filter(book => book.id !== bookId));
      alert("Book deleted successfully!");
    } catch (err) {
      console.error("Failed to delete book", err);
      alert("Failed to delete book. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books</h1>
        {role === "ADMIN" && (
          <Link
            href="/books/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Book
          </Link>
        )}
      </div>

      {/* 🔍 Search */}
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="publisher">Publisher</option>
          <option value="category">Category</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchType}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-xs"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            fetchBooks("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No books found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Thumbnail</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Author</th>
                <th className="px-4 py-2 text-left">Publisher</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{book.id}</td>
                  <td className="px-4 py-2">
                    {book.thumbnailUrl ? (
                      <img
                        src={`http://localhost:8080/${book.thumbnailUrl}`}
                        alt={book.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{book.title}</td>
                  <td className="px-4 py-2">{book.author?.name || "-"}</td>
                  <td className="px-4 py-2">{book.publisher?.name || "-"}</td>
                  <td className="px-4 py-2">{book.category || "-"}</td>
                  <td className="px-4 py-2">
                    {role === "ADMIN" && (
                      <div className="flex gap-2">
                        <Link
                          href={`/books/${book.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
