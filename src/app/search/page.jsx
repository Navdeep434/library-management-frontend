"use client";

import { useState } from "react";

export default function SearchPage() {
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    publisher: "",
    category: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    const query = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v.trim() !== "")
    ).toString();

    try {
      const res = await fetch(`http://localhost:8080/api/books/search?${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Search Books</h1>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded shadow-md space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Book Title"
            value={filters.title}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={filters.author}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="publisher"
            placeholder="Publisher"
            value={filters.publisher}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={filters.category}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p>Searching...</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((book) => (
            <div key={book.id} className="bg-white p-4 shadow rounded">
              {book.thumbnailUrl && (
                <img
                  src={book.thumbnailUrl}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <h2 className="text-lg font-semibold">{book.title}</h2>
              <p className="text-sm text-gray-600">
                Author: {book.author?.name} <br />
                Publisher: {book.publisher?.name} <br />
                Category: {book.category}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
}
