"use client";
// Remember you must use an AuthProvider for
// client components to useSession
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4">
      <ul className="flex justify-evenly text-2xl font-bold">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        {!session && (
          <li>
            <Link href="/api/auth/signin">Sign In</Link>
          </li>
        )}
        {session && (
          <li>
            <Link href="/api/auth/signout">Sign Out</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
