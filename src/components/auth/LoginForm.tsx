"use client";

import { FormEvent, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { usePasswordVisibility } from "@/components/hooks/usePasswordVisibility";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/context/snackbar.provider";
import GoogleIcon from "@mui/icons-material/Google";
import Link from "next/link";

type LoginFormProps = {
  onSubmit?: (values: { email: string; password: string }) => void;
};

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const router = useRouter();

  const { showSnackbar } = useSnackbar();

  const [errorEmail, setErrorEmail] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");

  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);
  const { visible, type, toggle } = usePasswordVisibility();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsErrorEmail(false);
    setIsErrorPassword(false);
    setErrorEmail("");
    setErrorPassword("");

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";

    if (!email) {
      setIsErrorEmail(true);
      setErrorEmail("Email không được để trống");
      return;
    }
    if (!password) {
      setIsErrorPassword(true);
      setErrorPassword("Mật khẩu không được để trống");
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res?.error) {
      router.push("/");
    } else {
      if (res?.error === "CredentialsSignin") {
        showSnackbar("Email hoặc mật khẩu không đúng", "error");
        return;
      }
      showSnackbar(res?.error, "error");
    }
  };

  return (
    <>
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
            error={isErrorEmail}
            helperText={errorEmail}
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
            error={isErrorPassword}
            helperText={errorPassword}
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
        <Link
          href="/auth/signup"
          style={{
            textAlign: "left",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#1976d2",
            textDecoration: "underline",
          }}
        >
          Không có tài khoản? Đăng ký ngay!
        </Link>

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
          Đăng nhập
        </Button>

        <Divider sx={{ my: 2 }}>Hoặc</Divider>
        <Button
          variant="outlined"
          sx={{
            mt: 1,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            py: 1,
          }}
          fullWidth
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <GoogleIcon sx={{ mr: 1 }} fontSize="small" />
          Đăng nhập với Google
        </Button>
      </Box>
    </>
  );
}
