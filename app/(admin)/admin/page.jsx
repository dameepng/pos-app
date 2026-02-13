import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { getAdminDashboard } from "@/domain/dashboard/dashboard.service";
import { redirect } from "next/navigation";
import AdminHomePage from "@/ui/pages/admin/AdminHomePage";

export default async function Page() {
  const user = await getAuthUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "OPS") {
    redirect("/admin/products");
  }

  if (user.role !== "OWNER") {
    redirect("/pos");
  }

  const dashboard = await getAdminDashboard();

  return <AdminHomePage initialDashboard={dashboard} />;
}
