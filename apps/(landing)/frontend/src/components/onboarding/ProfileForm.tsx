"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { FileUpload, FileUploadTrigger } from "@/components/ui/file-upload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabaseClient } from "@/lib/supabaseClient";

const DEFAULT_DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:5173/dashboard";
const ALLOWED_RETURN_HOSTS = (process.env.NEXT_PUBLIC_ALLOWED_RETURN_TO_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const resolveSafeReturnUrl = (candidate: string | null) => {
  if (!candidate) return DEFAULT_DASHBOARD_URL;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return DEFAULT_DASHBOARD_URL;
    if (ALLOWED_RETURN_HOSTS.length === 0) return candidate;
    if (ALLOWED_RETURN_HOSTS.includes(parsed.host)) return candidate;
    return DEFAULT_DASHBOARD_URL;
  } catch {
    return DEFAULT_DASHBOARD_URL;
  }
};

interface UserProfile {
  email: string;
  name: string;
  username?: string | null;
  google_photo: string;
  user_photo?: string | null;
  photo?: string | null;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadPhotoToCloudinary(file: File) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured in the frontend environment");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url as string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!username.trim()) {
        setAvailable(null);
        return;
      }

      setChecking(true);
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        const res = await fetch(`/api/user/check-username?u=${encodeURIComponent(username)}`, {
          headers: session?.access_token ? {
            Authorization: `Bearer ${session.access_token}`
          } : {}
        });
        const data = await res.json();
        setAvailable(data.available);
      } catch (error) {
        console.error("Error checking username:", error);
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        window.location.href = "/";
        return;
      }

      const res = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error("Error fetching profile:", {
          status: res.status,
          ...errorBody,
        });
        throw new Error("Failed to fetch profile");
      }

      const payload = await res.json();
      const profileData = payload?.profile as UserProfile | null;

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);
      
      if (profileData.username) {
        setUsername(profileData.username);
      }

      const photoToShow = profileData.user_photo || profileData.google_photo || "";
      setPreviewUrl(photoToShow);
      
      if (profileData.user_photo) {
        setUploadedPhotoUrl(profileData.user_photo);
      }
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFiles(files);
    setUploadedPhotoUrl(""); 
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!available || !username.trim()) return;

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        throw new Error("No session found");
      }

      let photoUrl = uploadedPhotoUrl || profile?.user_photo || null;

      if (selectedFiles.length > 0 && selectedFiles[0] && !uploadedPhotoUrl) {
        setUploading(true);
        try {
          photoUrl = await uploadPhotoToCloudinary(selectedFiles[0]);
          setUploadedPhotoUrl(photoUrl);
          setPreviewUrl(photoUrl);
        } catch (error) {
          setSubmitting(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      if (!photoUrl) {
        alert("Please upload a profile photo.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username,
          photoUrl: photoUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to complete profile");
      }

      const params = new URLSearchParams(window.location.search);
      const returnTo = resolveSafeReturnUrl(params.get("return_to"));
      window.location.href = returnTo;
    } catch (error) {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        <div className="text-foreground text-xl">Loading your profile...</div>
      </div>
    );
  }

  const avatarPreview = previewUrl || (profile?.google_photo) || "https://github.com/shadcn.png";
  const isSubmitDisabled = !available || !username.trim() || submitting || uploading || (!uploadedPhotoUrl && selectedFiles.length === 0 && !profile?.user_photo);

  return (
    <div className="min-h-[100vh] flex bg-background">
      <div className="flex w-1/2 flex-col justify-center items-center glass px-10 border-r border-border/50">
        <div className="relative z-10 max-w-md text-center flex flex-col items-center gap-6 mx-auto">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Complete Profile
            </h1>
            <p className="text-muted-foreground">Customize how you appear to others</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <FileUpload
              value={selectedFiles}
              onValueChange={handleFileChange}
              accept="image/*"
              maxFiles={1}
              maxSize={2 * 1024 * 1024}
            >
              <FileUploadTrigger asChild>
                <div className="group relative cursor-pointer rounded-full p-1 border-2 border-primary/20 hover:border-primary transition-colors">
                  <Avatar className="size-40 border-4 border-background">
                    <AvatarImage src={avatarPreview} alt="Profile" className="object-cover" />
                    <AvatarFallback className="bg-muted text-2xl uppercase">
                      {profile?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="size-8 text-white" />
                  </div>
                  {(uploading || submitting) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                      <div className="size-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </FileUploadTrigger>
            </FileUpload>
            {!uploadedPhotoUrl && !uploading && selectedFiles.length === 0 && !profile?.user_photo && (
              <p className="text-xs text-destructive font-medium animate-pulse">
                Custom profile photo is required *
              </p>
            )}
            {(uploadedPhotoUrl || profile?.user_photo) && (
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span>✓</span> Photo ready
              </p>
            )}
          </div>

          <div className="w-full space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={profile?.name || ""}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-foreground disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-foreground disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5 ml-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  placeholder="Choose a username"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    available === true
                      ? "border-green-500 bg-green-500/5 focus:ring-2 focus:ring-green-500/20"
                      : available === false
                      ? "border-destructive bg-destructive/5 focus:ring-2 focus:ring-destructive/20"
                      : "border-border bg-card focus:ring-2 focus:ring-primary/20"
                  } text-foreground`}
                />
                {checking && (
                  <div className="absolute right-4 top-3.5 flex items-center">
                    <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                {!checking && available === true && (
                  <span className="absolute right-4 top-3.5 text-green-600 text-sm font-semibold">
                    Available
                  </span>
                )}
                {!checking && available === false && (
                  <span className="absolute right-4 top-3.5 text-destructive text-sm font-medium">
                    Already taken
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="w-full mt-6 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed hover:brightness-110 transition-all"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Profile"
              )}
            </button>
            
            <p className="text-[10px] text-center text-muted-foreground pt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-1/2 flex items-center justify-center px-16 bg-muted/30">
        <div className="max-w-md">
          <p className="text-5xl text-muted mb-4">"</p>
          <p className="text-2xl leading-1px text-muted-foreground">
            Intellmeet showed up when we were close to giving up. We were stuck,
            exhausted, and nothing was moving. It didn't just fix our issues but also
            gave us a second chance. Everything started working, and so did we.
          </p>
          <div className="flex items-center mt-6 gap-3">
            <div className="w-8 h-8 bg-secondary rounded-full" />
            <span className="text-sm text-muted-foreground">
              @Someone From Future
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}