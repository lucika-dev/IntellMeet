import { Request, Response } from "express";
import { supabaseAdmin } from "@wraith/auth/server";

const getGoogleProfileData = (user: any) => {
  const identityData = user?.identities?.[0]?.identity_data || {};

  return {
    name:
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      identityData.full_name ||
      identityData.name ||
      null,
    googlePhoto:
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.user_metadata?.picture_url ||
      identityData.avatar_url ||
      identityData.picture ||
      identityData.picture_url ||
      null,
  };
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const fallbackRedirect = process.env.AUTH_CALLBACK_URL || "http://localhost:3000/auth/callback";
    const requestedRedirect = typeof req.query.redirectTo === "string" ? req.query.redirectTo : undefined;
    const redirectTo = requestedRedirect || fallbackRedirect;

    let parsedRedirect: URL;
    try {
      parsedRedirect = new URL(redirectTo);
    } catch {
      return res.status(400).json({ error: "Invalid redirectTo URL" });
    }

    if (parsedRedirect.protocol !== "http:" && parsedRedirect.protocol !== "https:") {
      return res.status(400).json({ error: "Invalid redirectTo protocol" });
    }

    const allowedHosts = (process.env.ALLOWED_AUTH_REDIRECT_HOSTS || "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    if (allowedHosts.length > 0 && !allowedHosts.includes(parsedRedirect.host)) {
      return res.status(400).json({ error: "redirectTo host is not allowed" });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: parsedRedirect.toString(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data?.url) {
      return res.status(500).json({ error: "OAuth URL not generated" });
    }

    return res.redirect(data.url);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const syncUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const googleProfileData = getGoogleProfileData(user);

    const upsertData = {
      id: user.id,
      email: user.email,
      name: googleProfileData.name,
      google_photo: googleProfileData.googlePhoto,
      profile_status: "pending",
    };

    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert([upsertData], { onConflict: "id" });

    if (upsertError) {
      return res.status(500).json({ error: "Failed to sync user profile" });
    }

    await supabaseAdmin.from("auth_logs").insert({
      user_id: user.id,
      action: "google_login",
      status: "success",
      ip_address: req.ip,
      device: req.headers["user-agent"] || "unknown",
    });

    await supabaseAdmin.from("sessions").insert({
      user_id: user.id,
      is_active: true,
      ip_address: req.ip,
      device: req.headers["user-agent"] || "unknown",
      created_at: new Date().toISOString(),
    });

    return res.json({ ok: true });
  } catch (err) {
    
    return res.status(500).json({ error: "Internal server error" });
  }
};