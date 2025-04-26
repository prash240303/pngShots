"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, LayoutDashboard } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <ImageIcon className="h-6 w-6" />
          <span className="font-bold text-xl">png Shots</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAdmin ? (
            <Button asChild variant="ghost">
              <Link href="/">
                <ImageIcon className="mr-2 h-4 w-4" />
                Gallery
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
