import { getAuthUserFromRequest } from "@/domain/auth/auth.service";
import { redirect } from "next/navigation";
import {
  listAdminCategories,
  listAdminProducts,
} from "@/domain/products/adminProducts.service";
import ProductsAdminPage from "@/ui/pages/admin/ProductsAdminPage";

export default async function Page() {
  const user = await getAuthUserFromRequest();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "OWNER" && user.role !== "OPS") {
    redirect("/pos");
  }

  const take = 10;
  const skip = 0;

  const [categories, initialData] = await Promise.all([
    listAdminCategories(),
    listAdminProducts({ take, skip }),
  ]);

  return (
    <ProductsAdminPage
      initialRole={user.role}
      initialCategories={categories}
      initialData={initialData}
    />
  );
}
