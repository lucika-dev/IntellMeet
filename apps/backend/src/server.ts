import "dotenv/config";
import { supabaseAdmin } from "@wraith/auth/server";
import { app } from "./app";

const PORT = process.env.PORT || 5000;

async function runSupabasePreflight() {
  const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);

  if (error) {
    return;
  }
}

runSupabasePreflight().finally(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
});

