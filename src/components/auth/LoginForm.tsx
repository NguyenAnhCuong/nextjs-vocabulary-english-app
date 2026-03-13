"use client";

import { FormEvent } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { usePasswordVisibility } from "@/components/hooks/usePasswordVisibility";

type LoginFormProps = {
  onSubmit?: (values: { email: string; password: string }) => void;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const { visible, type, toggle } = usePasswordVisibility();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";

    onSubmit?.({ email, password });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Email
        </Typography>
        <TextField
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          size="small"
          fullWidth
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Mật khẩu
        </Typography>
        <TextField
          id="password"
          name="password"
          type={type}
          placeholder="••••••••"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={toggle}
                  edge="end"
                >
                  {visible ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        sx={{
          mt: 1,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          py: 1,
        }}
        fullWidth
      >
        Sign in
      </Button>
    </Box>
  );
}
