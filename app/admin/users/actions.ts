"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/profile";

export type SetProfileRoleResult = { ok: true } | { ok: false; error: string };

export async function setProfileAdminRole(
  targetUserId: string,
  role: ProfileRole
): Promise<SetProfileRoleResult> {
  if (role !== "admin" && role !== "user") {
    return { ok: false, error: "Neplatná role" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Nejste přihlášeni" };
  }

  const { data: me, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const isPerformingUserAdmin = me?.role === "admin";
  if (!isPerformingUserAdmin) {
    return {
      ok: false,
      error:
        "Aktualizaci profilů smí provádět jen uživatel s rolí administrátor v tabulce profiles.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}
