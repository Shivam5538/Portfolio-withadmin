import AdminFilesClient from "@/components/admin/AdminFilesClient";

export const metadata = {
  title: "Files & Media Library | Admin",
  description: "Manage portfolio files and uploaded assets",
};

export default function FilesPage() {
  return <AdminFilesClient />;
}
