"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Hero from "@/components/landing/Hero";
import Card from "@/components/landing/Card";
import Features from "@/components/landing/Features";
import Section from "@/components/landing/Section";
import Screen from "@/components/landing/Screen";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/lib/supabaseClient";


export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        // Just redirect to callback logic or dashboard
        // Dashboard route already handles the handoff
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  return (
    <main>
      <Header />
      <Hero />

      <Card>
        <Features />
        <Section/>
        <Section/>
        <Section/>
      </Card>
    </main>
  );
}