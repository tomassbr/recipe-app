"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { setProfileAdminRole } from "./actions";
import { GlassTable } from "@/components/ui";
import type { ProfileRow } from "@/types/profile";
import { cn } from "@/utils/cn";

type UserManagementTableProps = {
  profiles: ProfileRow[];
  currentUserId: string;
};

export function UserManagementTable({
  profiles,
  currentUserId,
}: UserManagementTableProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggleAdmin = useCallback(
    async (row: ProfileRow, nextIsAdmin: boolean) => {
      setErrorMessage(null);
      const nextRole = nextIsAdmin ? "admin" : "user";
      setPendingId(row.id);
      const result = await setProfileAdminRole(row.id, nextRole);
      setPendingId(null);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      router.refresh();
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <p
          className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <GlassTable>
        <thead>
          <tr className="border-b border-white/40 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 md:px-6">Uživatel</th>
            <th className="px-4 py-3 md:px-6">E-mail</th>
            <th className="px-4 py-3 md:px-6">Administrátor</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((row) => {
            const label =
              row.display_name?.trim() ||
              row.email?.trim() ||
              row.id.slice(0, 8);
            const isAdmin = row.role === "admin";
            const busy = pendingId === row.id;

            return (
              <tr
                key={row.id}
                className="border-b border-white/25 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-slate-800 md:px-6 md:py-4">
                  {label}
                  {row.id === currentUserId ? (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (vy)
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600 md:px-6 md:py-4">
                  {row.email ?? "—"}
                </td>
                <td className="px-4 py-3 md:px-6 md:py-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isAdmin}
                    disabled={busy}
                    onClick={() => toggleAdmin(row, !isAdmin)}
                    className={cn(
                      "relative h-8 w-14 shrink-0 rounded-full border transition-colors disabled:opacity-60",
                      isAdmin
                        ? "border-gold/50 bg-gold-muted shadow-inner"
                        : "border-white/50 bg-white/40"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                        isAdmin
                          ? "left-7 translate-x-0 border border-gold/30"
                          : "left-1"
                      )}
                    />
                    <span className="sr-only">
                      {isAdmin ? "Odebrat roli administrátora" : "Udělit roli administrátora"}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </GlassTable>
    </div>
  );
}
