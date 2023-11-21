"use client";
// Remember you must use an AuthProvider for
// client components to useSession
import { useSession } from "next-auth/react";

export default function dashboard() {
  const { data: session, loading } = useSession();

  // if (!session?.user) return;

  return (
    <>
      <a href="/api/auth/signin">Sign in</a>
      <h1>This is the dashboard</h1>

      <h1 className="text-lg">Welcome {session?.user.username}</h1>
    </>
  );
}
