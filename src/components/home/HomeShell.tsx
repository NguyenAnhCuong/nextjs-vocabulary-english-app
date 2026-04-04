"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import QuizIcon from "@mui/icons-material/Quiz";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import styles from "./HomeShell.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppTheme } from "@/theme/ThemeContext";

type NavKey =
  | "dashboard"
  | "vocabulary"
  | "activity"
  | "statistics"
  | "goals"
  | "health-insights"
  | "profile"
  | "setting"
  | "logout";

type NavItem = {
  key: NavKey;
  label: string;
  description: string;
  path: string;
  group: "Study" | "Progress" | "User";
  icon: (props: { className?: string }) => React.ReactNode;
};

function IconGrid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h7v7H4V4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 4h7v7h-7V4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h7v7H4v-7z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 13h7v7h-7v-7z"
      />
    </svg>
  );
}

function IconFileText({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-5-6z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h2" />
    </svg>
  );
}

function IconActivity({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h4l2-7 4 14 2-7h6"
      />
    </svg>
  );
}

function IconQuiz({ className }: { className?: string }) {
  return <QuizIcon fontSize="small" className={className} />;
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21a8 8 0 10-16 0"
      />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a7.9 7.9 0 000-6l-2 1.2a6 6 0 01-1.3-1.3l1.2-2a7.9 7.9 0 00-6 0l1.2 2a6 6 0 01-1.3 1.3L9 9a7.9 7.9 0 000 6l2-1.2a6 6 0 011.3 1.3l-1.2 2a7.9 7.9 0 006 0l-1.2-2a6 6 0 011.3-1.3l2 1.2z"
      />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 17l-1 1a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h1a2 2 0 012 2l1 1"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12l-3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12l-3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12h-5" />
    </svg>
  );
}

export default function HomeShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { theme } = useAppTheme();

  const items: NavItem[] = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Tổng Quan",
        description: "Tiến độ học từ vựng và chuỗi ngày học tập của bạn.",
        group: "Study",
        path: "/",
        icon: IconGrid,
      },
      {
        key: "vocabulary",
        label: "Học Từ Vựng",
        description: "Xây dựng vốn từ vựng với các bài học.",
        group: "Study",
        path: "/learning",
        icon: IconFileText,
      },
      // {
      //   key: "activity",
      //   label: "Luyện tập",
      //   description:
      //     "Sử dụng thẻ ghi nhớ và luyện tập câu để tăng khả năng ghi nhớ.",
      //   group: "Study",
      //   path: "/practice",
      //   icon: IconActivity,
      // },
      {
        key: "statistics",
        label: "Câu đố",
        description:
          "Kiểm tra kiến thức của bạn với các bài kiểm tra từ vựng nhanh.",
        group: "Progress",
        path: "/quizzes",
        icon: IconQuiz,
      },
      // {
      //   key: "goals",
      //   label: "Mục Tiêu",
      //   description:
      //     "Theo dõi mục tiêu hàng ngày: từ mới, buổi ôn tập và các cột mốc quan trọng..",
      //   group: "Progress",
      //   path: "/goals",
      //   icon: IconTarget,
      // },
      {
        key: "profile",
        label:
          status === "loading"
            ? "Hồ Sơ Cá Nhân"
            : session?.user?.name || "Hồ Sơ Cá Nhân",
        description: "Quản lý tài khoản và tùy chọn của bạn.",
        group: "User",
        icon: IconUser,
        path: "/profile",
      },
    ],
    [session, status],
  );

  const router = useRouter();
  const [active, setActive] = useState<NavKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeItem = items.find((i) => i.key === active) ?? items[0];

  const grouped = useMemo(() => {
    return {
      Study: items.filter((i) => i.group === "Study"),
      Progress: items.filter((i) => i.group === "Progress"),
      User: items.filter((i) => i.group === "User"),
    } satisfies Record<NavItem["group"], NavItem[]>;
  }, [items]);

  const themeS = useTheme();
  const isMobile = useMediaQuery(themeS.breakpoints.down("md"), {
    noSsr: true,
  });

  const handleNavigate = (item: NavItem) => {
    setActive(item.key);

    if (item.path && item.path !== "#") {
      router.push(item.path);
    }
  };

  const renderSidebarContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          px: 2,
          py: 2,
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            backgroundImage:
              "linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #22c55e 100%)",
          }}
        >
          VC
        </Avatar>
        <Box>
          <Typography
            fontWeight={700}
            letterSpacing="-0.04em"
            color="white"
            fontSize="1.25rem"
          >
            Học Từ Vựng
          </Typography>
          <Typography variant="caption" color="white" fontSize="0.875rem">
            Luyện tập mỗi ngày • Tự tin nói chuyện
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto", pt: 1 }}>
        <Typography
          variant="overline"
          sx={{ px: 2.25, pt: 1, pb: 0.5 }}
          color="text.secondary"
        >
          Study
        </Typography>
        <List dense disablePadding>
          {grouped.Study.map((item) => (
            <ListItemButton
              key={item.key}
              selected={active === item.key}
              onClick={() => handleNavigate(item)}
            >
              <ListItemIcon>
                {item.icon({ className: styles.navIcon })}
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItemButton>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{ px: 2.25, pt: 2, pb: 0.5 }}
          color="text.secondary"
        >
          Progress
        </Typography>
        <List dense disablePadding>
          {grouped.Progress.map((item) => (
            <ListItemButton
              key={item.key}
              selected={active === item.key}
              onClick={() => handleNavigate(item)}
            >
              <ListItemIcon>
                {item.icon({ className: styles.navIcon })}
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItemButton>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{ px: 2.25, pt: 2, pb: 0.5 }}
          color="text.secondary"
        >
          User
        </Typography>
        <List dense disablePadding>
          {grouped.User.map((item) => (
            <ListItemButton
              key={item.key}
              selected={active === item.key}
              onClick={() => handleNavigate(item)}
            >
              <ListItemIcon>
                {item.icon({ className: styles.navIcon })}
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      className={styles.shell}
      sx={
        !isMobile
          ? { gridTemplateColumns: sidebarOpen ? "280px 1fr" : "1fr" }
          : undefined
      }
    >
      {/* Desktop drawer */}
      {!isMobile && sidebarOpen && (
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              width: 280,
              borderRight: "none",
              backgroundImage: `linear-gradient(180deg, ${theme.dark} 0%, ${theme.dark} 35%, ${theme.dark}ee 100%)`,
              color: "common.white",
              transition: "background-image 0.4s ease",
            },
          }}
        >
          {renderSidebarContent()}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        className={styles.content}
        sx={{
          backgroundColor: theme.bg,
          transition: "background-color 0.4s ease",
        }}
      >
        <Box className={styles.header}>
          <Box className={styles.title}>
            <Typography variant="h5" fontWeight={700} letterSpacing="-0.04em">
              {activeItem.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeItem.description}
            </Typography>
          </Box>

          {!isMobile && (
            <IconButton
              sx={{
                background: "#0000001c",
                cursor: "pointer",
                "&:hover": { background: "#0c0c141c" },
              }}
              size="small"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>

        {/* OUTLET */}
        <Box className={styles.pageContent}>{children}</Box>
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <BottomNavigation
            showLabels={false}
            value={items.findIndex((i) => i.key === active)}
            onChange={(_, index) => setActive(items[index].key)}
          >
            {items.map((item) => (
              <BottomNavigationAction
                key={item.key}
                icon={item.icon({ className: styles.dockIcon })}
              />
            ))}
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}
