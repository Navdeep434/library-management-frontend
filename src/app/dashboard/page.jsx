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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Get token from the user object stored in localStorage
    const userData = localStorage.getItem("user");
    let token = null;
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        token = user.token;
      } catch (e) {
        console.error("Error parsing user data:", e);
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
      
      console.log("Token:", token);
      
      const res = await fetch("http://localhost:8080/api/dashboard/stats", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          setError("Authentication expired. Please login again.");
          // Optionally redirect to login
          // window.location.href = "/login";
          return;
        } else if (res.status === 403) {
          setError("Access denied. You don't have permission to view this data.");
          return;
        } else {
          setError(`Server error: ${res.status} ${res.statusText}`);
          return;
        }
      }

      const data = await res.json();
      console.log("Dashboard data:", data);

      setStats([
        { title: "Total Books", value: data.totalBooks || 0, color: "bg-blue-600" },
        { title: "Authors", value: data.totalAuthors || 0, color: "bg-green-600" },
        { title: "Publishers", value: data.totalPublishers || 0, color: "bg-yellow-600" },
        { title: "Users", value: data.totalUsers || 0, color: "bg-purple-600" },
      ]);

      setMonthlyLendStats(data.monthlyLendStats || []);
      setRecentLends(data.recentLends || []);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
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
          <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

        {/* 📦 Stat Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((item, idx) => (
            <DashboardWidget key={idx} {...item} />
          ))}
        </div>

        {/* 📊 Lending Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Books Lent Per Month</h2>
          <ExecutionChart data={monthlyLendStats} />
        </div>

        {/* 🕓 Recent Lends */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Lend Records</h2>
          {recentLends.length > 0 ? (
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {recentLends.map((lend, idx) => (
                <li key={idx}>
                  User: {lend.userName} → Book: "{lend.bookTitle}"
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