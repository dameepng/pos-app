import LoginPage from "@/ui/pages/auth/LoginPage";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function Page() {
  return <LoginPage />;
}
