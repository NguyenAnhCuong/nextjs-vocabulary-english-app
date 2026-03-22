// src/app/layout.tsx
import InstallBanner from "@/components/InstallBanner";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Học Từ Vựng | WordWise",
  description:
    "Học từ vựng tiếng Anh mỗi ngày với flashcard và spaced repetition",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WordWise",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1f2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // tắt zoom — cảm giác native hơn
  userScalable: false,
  viewportFit: "cover", // fill vào notch / camera cutout
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="WordWise" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ margin: 0 }}>
        {/* Safe area wrapper — tránh notch và navigation bar Android */}
        <MuiThemeProvider>
          <div
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
              minHeight: "100dvh", // dvh thay vh — tính đúng trên mobile
            }}
          >
            {children}
          </div>
        </MuiThemeProvider>
        <InstallBanner />
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('[SW] Registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
