import type { Metadata } from "next";
import "./globals.css";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";

export const metadata: Metadata = {
  title: "Health Care App",
  description: "Health Care App for managing your health",
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
