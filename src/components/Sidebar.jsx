"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Books", href: "/books" },
  { name: "Authors", href: "/authors" },
  { name: "Publishers", href: "/publishers" },
  { name: "Users", href: "/users" },
  { name: "Lend", href: "/lend" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);

  if (!user) return null;
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">📚 Library</h2>
      <ul className="space-y-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block py-2 px-4 rounded ${
                pathname.startsWith(item.href)
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
