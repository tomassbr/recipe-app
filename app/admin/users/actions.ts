"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/utils/supabase/server";
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
  const authz = await requireAdmin(supabase);
  if (!authz.ok) {
    return { ok: false, error: authz.error };
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
