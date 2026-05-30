"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

const DesktopHeader = dynamic(() => import("../header/DesktopHeader"), { ssr: false });
const MobileHeader  = dynamic(() => import("../header/MobileHeader"),  { ssr: false });

export function Header() {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    
    return () => {
      mql.removeEventListener("change", handler);
      subscription.unsubscribe();
    };
  }, []);

  if (!isMounted) return null;

  return isDesktop ? <DesktopHeader isAuthenticated={isAuthenticated} /> : <MobileHeader isAuthenticated={isAuthenticated} />;
}