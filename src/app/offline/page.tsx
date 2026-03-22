"use client";

// src/app/offline/page.tsx
export default function OfflinePage() {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          background: "#1a1f2e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: 64 }}>📶</div>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginTop: 16 }}>
          Không có kết nối mạng
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
          Vui lòng kiểm tra kết nối internet và thử lại.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 24,
            padding: "12px 24px",
            background: "#6c8fff",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}
