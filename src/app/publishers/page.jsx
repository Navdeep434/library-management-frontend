"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PublisherListPage() {
  const [publishers, setPublishers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  const router = useRouter();

  useEffect(() => {
    // Get authentication data
    const userData = localStorage.getItem("user");
    let storedToken = null;
    let storedRole = null;

    console.log("Raw userData from localStorage:", userData);

    if (userData) {
      try {
        const user = JSON.parse(userData);
        storedToken = user.token;
        storedRole = user.role;
        console.log("Parsed user data:", { token: storedToken, role: storedRole });
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
        return;
      }
    }

    // Fallback: check if token is stored separately
    if (!storedToken) {
      storedToken = localStorage.getItem("token");
      console.log("Fallback token from localStorage:", storedToken);
    }
    if (!storedRole) {
      storedRole = localStorage.getItem("userRole");
      console.log("Fallback role from localStorage:", storedRole);
    }

    if (!storedToken) {
      console.log("No token found, redirecting to login");
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setRole(storedRole);
    fetchPublishers("", storedToken);
  }, []);

  const fetchPublishers = async (name = "", authToken = token) => {
    setLoading(true);
    try {
      const url = name
        ? `http://localhost:8080/api/publishers/search?name=${encodeURIComponent(name)}`
        : `http://localhost:8080/api/publishers`;
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          console.error("403 Forbidden - Token:", authToken);
          console.error("403 Forbidden - Role:", storedRole);
          alert(`Access denied (403). Your role: ${storedRole}. Please check your permissions.`);
          return;
        }
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setPublishers(data);
    } catch (err) {
      console.error("Failed to fetch publishers", err);
      alert("Failed to load publishers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      fetchPublishers("");
      return;
    }
    fetchPublishers(trimmed);
  };

  const handleDelete = async (publisherId) => {
    if (!confirm("Are you sure you want to delete this publisher?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/publishers/${publisherId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error(`Delete failed with status ${res.status}`);
      }

      // Remove publisher from local state
      setPublishers(publishers.filter(publisher => publisher.id !== publisherId));
      alert("Publisher deleted successfully!");
    } catch (err) {
      console.error("Failed to delete publisher", err);
      alert("Failed to delete publisher. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Publishers</h1>
        {role === "ADMIN" && (
          <Link
            href="/publishers/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Publisher
          </Link>
        )}
      </div>

      {/* 🔍 Search */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-3">
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
          onClick={() => {
            setSearchTerm("");
            fetchPublishers("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading publishers...</p>
        </div>
      ) : publishers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No publishers found.</p>
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
              {publishers.map((publisher) => (
                <tr key={publisher.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{publisher.id}</td>
                  <td className="px-4 py-2 font-medium">{publisher.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {role === "ADMIN" && (
                        <>
                          <Link
                            href={`/publishers/${publisher.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(publisher.id)}
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