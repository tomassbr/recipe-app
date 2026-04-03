"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="rounded-full border border-slate-200/90 bg-white/60 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-red-200/80 hover:bg-red-50/90 hover:text-red-700"
    >
      {label}
    </button>
  );
}
