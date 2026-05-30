"use client";

import ProfileForm from '@/components/onboarding/ProfileForm'
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const OnboardingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      try {
        const res = await fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        const data = await res.json();
        
        // If profile is already active, skip onboarding
        if (data?.profile?.profile_status === 'active') {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <ProfileForm/>
    </div>
  )
}

export default OnboardingPage