import AdminAccountSecurity from "@/components/admin/AdminAccountSecurity";

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Account Settings</h1>
        <p className="text-[#9ca3af] text-sm mt-1">
          Manage your account credentials, security settings, and admin email address.
        </p>
      </div>

      <AdminAccountSecurity />
    </div>
  );
}
