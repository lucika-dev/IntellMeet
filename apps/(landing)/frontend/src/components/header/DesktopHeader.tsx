"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuContent, NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import GoogleAuthButton from "@/components/common/GoogleAuthButton";

gsap.registerPlugin(ScrollTrigger);

export default function DesktopHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const navRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const isScrollingDown = useRef(false);

  const onScroll = useCallback(() => {
    const current = window.scrollY;

    if (Math.abs(current - lastScroll.current) < 10) return;

    if (current <= 0) {
      setShow(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      isScrollingDown.current = false;
      lastScroll.current = current;
      return;
    }

    if (current > lastScroll.current) {
      if (!isScrollingDown.current) {
        isScrollingDown.current = true;

        hideTimeout.current = setTimeout(() => {
          setShow(false);
        }, 800);
      }
    } else {
      isScrollingDown.current = false;
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setShow(true);
    }

    lastScroll.current = current;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [onScroll]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "200px top",
          scrub: true,
        },
      })
        .to(el, { width: "1024px", paddingLeft: "1.5rem", paddingRight: "1.5rem", ease: "none" }, 0)
        .to(el, { scale: 1, ease: "none" }, 0);
    });
    return () => ctx.revert();
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center
        transition-transform duration-300 ease-out
        ${show ? "translate-y-0" : "-translate-y-32"}`}
    >
      <div
        ref={navRef}
        className="glass w-[95vw] px-10 py-3 rounded-full flex items-center justify-between will-change-[width,transform]"
      >
        <div className="relative ml-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-[20px] opacity-70">
            <Logo src="/Logo.svg" alt="" size={60} className="scale-250" />
          </div>
          <Logo src="/Logo.svg" alt="IntellMeet" size={60} className="scale-320" />
        </div>

        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Demo</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[400px] grid-cols-2 gap-3 p-4">
                  <Link href="/demo/live">Live Demo</Link>
                  <Link href="/demo/ai">AI Assistant</Link>
                  <Link href="/demo/recording">Recording</Link>
                  <Link href="/demo/analytics">Analytics</Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="#pricing">Pricing</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

          <div className="flex items-center gap-3">

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-primary -z-10 rounded-xl blur-[18px] opacity-70"
            />
            {isAuthenticated ? (
               <Link
                href="/dashboard"
                className="relative block bg-primary text-primary-foreground px-8 py-3 rounded-xl text-base font-semibold transition hover:opacity-90 active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <GoogleAuthButton />
            )}
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-primary -z-10 rounded-full blur-[18px] opacity-70"
            />
            <ThemeToggle />
          </div>

          </div>
          
        </div>
    </nav>
  );
}