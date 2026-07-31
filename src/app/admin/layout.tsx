import NextAuthProvider from "@/components/providers/NextAuthProvider";

// This layout wraps all /admin pages including /admin/login
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
