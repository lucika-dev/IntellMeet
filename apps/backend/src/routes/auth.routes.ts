import express from "express";
import { googleLogin, syncUser } from "@/controllers/auth.controller";

const router = express.Router();

router.get("/google", googleLogin);
router.post("/sync", syncUser);

export default router;