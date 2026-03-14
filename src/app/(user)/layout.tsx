import HomeShell from "@/components/home/HomeShell";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeShell>{children}</HomeShell>
    </>
  );
}
