import AdminSidebar from "@/components/admin/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// This layout applies to all dashboard pages (everything except /admin/login)
// Auth protection is handled both at proxy.ts (network boundary) and here (server layout check)
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
