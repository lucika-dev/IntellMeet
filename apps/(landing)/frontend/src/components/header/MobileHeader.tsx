"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Layers, DollarSign, LogIn } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const NAV_LINKS = [
  { label: "Home",    href: "/",        icon: Home },
  { label: "Demo",    href: "/demo",    icon: Layers },
  { label: "Pricing", href: "#pricing", icon: DollarSign },
  { label: "Sign up", href: "/signup",  icon: LogIn },
];

export default function MobileHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [...NAV_LINKS];
  if (isAuthenticated) {
    const signupIndex = links.findIndex(l => l.label === "Sign up");
    if (signupIndex !== -1) {
      links[signupIndex] = { label: "Dashboard", href: "/dashboard", icon: LogIn };
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 glass">
        <Logo src="/Logo.svg" alt="IntellMeet" size={36} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-full"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-2 glass border-t border-border"
      >
        {links.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-muted-foreground hover:text-foreground transition-colors text-[10px]"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col justify-center items-center gap-8"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-3xl font-semibold tracking-tight hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}