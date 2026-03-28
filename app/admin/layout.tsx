import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if ((session.user as { role: string }).role !== "admin") {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
