"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// global-error replaces the root layout — must include <html> and <body>
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="cs">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f1f5f9" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "400px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", color: "#1e293b" }}>
              Kritická chyba aplikace
            </h2>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "#64748b" }}>
              {error.digest ? `Kód chyby: ${error.digest}` : "Prosím obnovte stránku."}
            </p>
            <button
              onClick={reset}
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.5rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Obnovit
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
