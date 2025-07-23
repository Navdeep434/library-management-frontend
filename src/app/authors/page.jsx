"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthorListPage() {
  const [authors, setAuthors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      setToken(user.token);
      setRole(user.role);
      fetchAuthors(user.token);
    } catch (err) {
      console.error("Invalid user data", err);
      router.push("/login");
    }
  }, []);

  const fetchAuthors = async (authToken, search = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        search
          ? `http://localhost:8080/api/authors/search?name=${encodeURIComponent(search)}`
          : `http://localhost:8080/api/authors`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch authors");
      }

      const data = await res.json();
      setAuthors(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch authors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuthors(token, searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    fetchAuthors(token);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this author?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/authors/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setAuthors(authors.filter((a) => a.id !== id));
      alert("Author deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete author");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Authors</h1>
        {role === "ADMIN" && (
          <Link
            href="/authors/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Author
          </Link>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading authors...</p>
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No authors found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{author.id}</td>
                  <td className="px-4 py-2 font-medium">{author.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {role === "ADMIN" && (
                        <>
                          <Link
                            href={`/authors/${author.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(author.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
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
