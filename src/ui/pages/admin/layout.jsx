import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import AdminNavbar from "@/ui/components/AdminNavbar";

export default async function AdminLayout({ children }) {
  const user = await getAuthUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/pos");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNavbar user={user} />
      <main className="pt-16 lg:pt-0 lg:pl-64">{children}</main>
    </div>
  );
}
