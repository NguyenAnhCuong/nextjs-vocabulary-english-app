"use client";

import { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import theme from "@/theme/theme";
import { SessionProvider } from "next-auth/react";
import ThemeRegistry from "@/theme/ThemeRegistry";

type Props = {
  children: ReactNode;
};

export default function MuiThemeProvider({ children }: Props) {
  return (
    <SessionProvider>
      <AppRouterCacheProvider>
        <ThemeRegistry>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ThemeRegistry>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}
