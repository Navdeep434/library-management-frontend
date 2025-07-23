// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardWidget from "@/components/DashboardWidget";
import ExecutionChart from "@/components/ExecutionChart";

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [recentLends, setRecentLends] = useState([]);
  const [monthlyLendStats, setMonthlyLendStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const userData = localStorage.getItem("user");
    let token = null;
    let role = null;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        token = user.token;
        role = user.role?.toUpperCase();
        setUserRole(role);
      } catch (e) {
        console.error("Error parsing user data:", e);
        setError("Invalid user data. Please login again.");
        setLoading(false);
        return;
      }
    }

    if (!token) {
      setError("No authentication token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:8080/api/dashboard/stats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          setError("Session expired. Please login again.");
        } else if (res.status === 403) {
          setError("You do not have permission to access this resource.");
        } else {
          setError(`Unexpected error: ${res.statusText}`);
        }
        setLoading(false);
        return;
      }

      const data = await res.json();

      const widgetData = [
        { title: "Total Books", value: data.totalBooks || 0, color: "bg-blue-600" },
        { title: "Authors", value: data.totalAuthors || 0, color: "bg-green-600" },
        { title: "Publishers", value: data.totalPublishers || 0, color: "bg-yellow-600" },
      ];

      if (role === "ADMIN") {
        widgetData.push({
          title: "Users",
          value: data.totalUsers || 0,
          color: "bg-purple-600",
        });
      }

      setStats(widgetData);
      setMonthlyLendStats(data.monthlyLendStats || []);
      setRecentLends(data.recentLends || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-red-800 font-semibold">Dashboard Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stat Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((item, idx) => (
            <DashboardWidget key={idx} {...item} />
          ))}
        </div>

        {/* Lending Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Books Lent Per Month</h2>
          <ExecutionChart data={monthlyLendStats} />
        </div>

        {/* Recent Lending Data */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Lend Records</h2>
          {recentLends.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {recentLends.map((lend, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{lend.userName}</span> lent <span className="italic">"{lend.bookTitle}"</span> Book on {lend.dateLent}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent lend records.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}