"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <div className="container mx-auto py-8">Redirecting...</div>;
}
