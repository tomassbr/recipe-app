"use server";

import { createClient } from "@/lib/supabase/server";

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

/**
 * Permanently deletes the currently authenticated user's account.
 * Calls the `delete_user()` PostgreSQL function (SECURITY DEFINER) which
 * removes the row from auth.users — profiles cascade-delete automatically.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Nejste přihlášeni." };
  }

  const { error } = await supabase.rpc("delete_user");

  if (error) {
    return { ok: false, error: error.message };
  }

  // Sign out locally so cookies are cleared — ignore errors, account is already deleted
  try {
    await supabase.auth.signOut();
  } catch {
    // Session will expire naturally via JWT expiry
  }

  return { ok: true };
}
