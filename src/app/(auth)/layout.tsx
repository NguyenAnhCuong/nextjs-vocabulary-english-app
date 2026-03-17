import SnackbarProvider from "@/context/snackbar.provider";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SnackbarProvider>
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, #e0f2fe 0, #f9fafb 40%, #eef2ff 100%)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "1.25rem",
            boxShadow:
              "0 20px 45px rgba(15,23,42,0.10), 0 0 0 1px rgba(148,163,184,0.25)",
            padding: "2.25rem 2rem",
            backdropFilter: "blur(16px)",
          }}
        >
          <header style={{ marginBottom: "1.75rem" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                marginBottom: "0.35rem",
              }}
            >
              Chào mừng bạn đến với <br />
              Ứng Dụng Học Từ Vựng!
            </h1>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#64748b",
              }}
            >
              Đăng nhập để quản lý những thông tin về từ vựng của bạn.
            </p>
          </header>
          {children}
        </div>
      </section>
    </SnackbarProvider>
  );
}
