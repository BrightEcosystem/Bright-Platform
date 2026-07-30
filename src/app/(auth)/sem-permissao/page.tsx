import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { AccessDenied } from "@/components/ui/AccessDenied";

export default async function SemPermissaoPage() {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  return <AccessDenied />;
}
