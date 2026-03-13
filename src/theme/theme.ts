import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
    },
    secondary: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#16a34a",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },

  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.05em" },
    h2: { fontWeight: 700, letterSpacing: "-0.04em" },
    h3: { fontWeight: 600, letterSpacing: "-0.03em" },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 14,
  },

  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },

    // ⭐ QUAN TRỌNG CHO NEXTJS SSR
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  },
});

export default theme;
