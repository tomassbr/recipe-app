import { Suspense } from "react";
import { LoginContent } from "@/components/features/auth/LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-slate-500">
          Načítám přihlášení…
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
