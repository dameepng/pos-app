import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import PrinterSettingsPage from "@/ui/pages/admin/PrinterSettingsPage";

export default async function Page() {
  const user = await getAuthUserFromRequest();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "OWNER") {
    redirect("/admin/products");
  }

  return <PrinterSettingsPage />;
}
