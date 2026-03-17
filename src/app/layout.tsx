import type { Metadata } from "next";
import "./globals.css";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";

export const metadata: Metadata = {
  title: "Học Từ Vựng",
  description: "Học Từ Vựng Tiếng Anh Hiệu Quả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
