"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LendPage() {
  const [books, setBooks] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user in localStorage");

      const parsedUser = JSON.parse(userData);
      const userId = parseInt(parsedUser.userId) || parsedUser.id;
      const storedToken = parsedUser.token;

      if (!userId || !storedToken) throw new Error("Missing userId or token");

      const storedUser = { ...parsedUser, id: userId };
      setUser(storedUser);
      setToken(storedToken);

      fetchBooks(storedUser, storedToken);
    } catch (err) {
      console.error("Auth Error:", err.message);
      localStorage.clear();
      router.push("/login");
    }
  }, []);

  const fetchBooks = async (user, tokenToUse) => {
    try {
      setLoading(true);

      const isAdmin = user?.role === "ADMIN";
      const url = isAdmin
        ? "http://localhost:8080/api/lending/all-books-status"
        : `http://localhost:8080/api/lending/books/user?userId=${user.id}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.push("/login");
        }
        throw new Error("Failed to fetch books");
      }

      const data = await res.json();

      if (isAdmin) {
        setBooks(data);
      } else {
        const available = (data.available || []).map((book) => ({
          ...book,
          status: "available",
        }));
        const lent = (data.lent || []).map((record) => ({
          ...record.book,
          status: "lent",
          lendingId: record.id,
          lentAt: record.createdAt,
          lentTo: user.name, // for normal user, it's always themselves
        }));
        setBooks([...available, ...lent]);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading books");
    } finally {
      setLoading(false);
    }
  };

  const handleLend = async (bookId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/lending/lend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, bookId }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.push("/login");
        }
        throw new Error("Failed to lend book");
      }

      alert("Book lent successfully.");
      fetchBooks(user, token);
    } catch (err) {
      console.error(err);
      alert("Error lending book.");
    }
  };

  const handleReturn = async (lendingId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/lending/return?lendingId=${lendingId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          router.push("/login");
        }
        throw new Error("Failed to return book");
      }

      alert("Book returned successfully.");
      fetchBooks(user, token);
    } catch (err) {
      console.error(err);
      alert("Error returning book.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Books</h1>

      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p className="text-gray-500">No books available or borrowed.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Publisher</th>
              <th className="p-3">Status</th>
              <th className="p-3">Lent To</th>
              <th className="p-3">Lent At</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id + book.status} className="border-t">
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.author?.name || "N/A"}</td>
                <td className="p-3">{book.publisher?.name || "N/A"}</td>
                <td className="p-3 capitalize">{book.status}</td>
                <td className="p-3">{book.status === "lent" ? book.lentTo || "--" : "--"}</td>
                <td className="p-3">
                  {book.status === "lent" && book.lentAt
                    ? new Date(book.lentAt).toLocaleString()
                    : "--"}
                </td>
                <td className="p-3">
                  {book.status === "available" ? (
                    <button
                      onClick={() => handleLend(book.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Lend
                    </button>
                  ) : book.lendingId ? (
                    <button
                      onClick={() => handleReturn(book.lendingId)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Return
                    </button>
                  ) : (
                    <span className="text-gray-500">Unavailable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
