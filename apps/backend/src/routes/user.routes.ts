import express, { Request, Response, NextFunction } from "express";
import { supabaseAdmin, authMiddleware } from "@wraith/auth/server";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const getGoogleProfileData = async (token: string) => {
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  const identityData = user?.identities?.[0]?.identity_data || {};

  return {
    user,
    name:
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      identityData.full_name ||
      identityData.name ||
      null,
    email: user?.email || identityData.email || null,
    phone: user?.phone || user?.user_metadata?.phone || identityData.phone || null,
    googlePhoto:
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      user?.user_metadata?.picture_url ||
      identityData.avatar_url ||
      identityData.picture ||
      identityData.picture_url ||
      null,
  }
}

router.get("/check-username", authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const username = req.query.u as string;
    const userId = req.user?.id;

    if (!username || username.length < 3) {
      return res.json({ available: false });
    }

    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (!data) return res.json({ available: true });

    if (userId && data.id === userId) {
      return res.json({ available: true });
    }

    res.json({ available: false });
  } catch (err) {
    res.json({ available: false });
  }
});

router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(" ")[1];

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("email, name, google_photo, username, user_photo, profile_status, phone")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message, code: error.code });
      }

      if (data && (!data.google_photo || !data.phone) && token) {
        const { user, googlePhoto, name, phone } = await getGoogleProfileData(token);

        if (user) {
          const { error: backfillError } = await supabaseAdmin
            .from("profiles")
            .update({
              google_photo: data.google_photo || googlePhoto,
              phone: data.phone || phone,
              name: data.name || name,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (!backfillError) {
            data.google_photo = data.google_photo || googlePhoto;
            data.phone = data.phone || phone;
            data.name = data.name || name;
          }
        }
      }

      return res.json({
        profile: {
          ...data,
          photo: data?.user_photo || data?.google_photo || null,
        },
      });
    } catch (err) {
      
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
);

router.post(
  "/complete-profile",
  authMiddleware as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { username, photoUrl } = req.body;

      if (!userId || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      const updateData = {
        username: username.toLowerCase(),
        user_photo: typeof photoUrl === "string" && photoUrl.trim() ? photoUrl.trim() : null,
        profile_status: "active",
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingProfile) {
        result = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("id", userId);
      } else {
        result = await supabaseAdmin
          .from("profiles")
          .insert({
            id: userId,
            ...updateData
          });
      }

      if (result.error) {
        throw result.error;
      }

      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to complete profile" });
    }
  }
);

export default router;