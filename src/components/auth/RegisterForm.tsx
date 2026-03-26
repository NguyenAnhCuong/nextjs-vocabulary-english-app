"use client";

import { FormEvent, useState } from "react";
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
import { useSnackbar } from "@/context/snackbar.provider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  onSubmit?: (values: { email: string; password: string }) => void;
};

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [errorEmail, setErrorEmail] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isErrorEmail, setIsErrorEmail] = useState<boolean>(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);
  const { visible, type, toggle } = usePasswordVisibility();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email ?? "",
        password: password ?? "",
      }),
    });

    const data = await res.json();

    if (!data?.error) {
      showSnackbar("Đăng ký thành công!", "success");
      router.push("/auth/signin");
    } else {
      showSnackbar(data?.message || "Đăng ký thất bại!", "error");
    }
    setIsLoading(false);
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
          loading={isLoading}
        >
          Đăng ký
        </Button>
      </Box>
      <Box
        sx={{
          textAlign: "left",
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "#1976d2",
          textDecoration: "underline",
          display: "flex",
          gap: 0.5,
          mt: 4,
          cursor: "pointer",
        }}
        onClick={() => signIn()}
      >
        <ArrowBackIcon />
        <Link href="#">Bạn đã có tài khoản? Đăng nhập ngay!</Link>
      </Box>
    </>
  );
}
