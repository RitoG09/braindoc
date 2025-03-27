import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Brain } from "lucide-react";

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-1">
            <Brain className="text-indigo-600" />
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                BrainDock
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <SignedIn>
              <nav className="hidden md:flex space-x-8 mr-6">
                <Link
                  href="/my-docs"
                  className="text-gray-600 hover:text-gray-900 font-medium nav-link"
                >
                  Doc Store
                </Link>
              </nav>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
