"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/profile";

export type SetProfileRoleResult = { ok: true } | { ok: false; error: string };

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function setUserApproved(
  targetUserId: string,
  approved: boolean
): Promise<SetProfileRoleResult> {
  if (!isValidUUID(targetUserId)) {
    return { ok: false, error: "Neplatné ID uživatele" };
  }

  const supabase = await createClient();
  const authz = await requireAdmin(supabase);
  if (!authz.ok) {
    return { ok: false, error: authz.error };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ approved, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setProfileAdminRole(
  targetUserId: string,
  role: ProfileRole
): Promise<SetProfileRoleResult> {
  if (!isValidUUID(targetUserId)) {
    return { ok: false, error: "Neplatné ID uživatele" };
  }
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
