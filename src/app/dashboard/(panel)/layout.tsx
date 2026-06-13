import { redirect } from "next/navigation";
import { sesionActual } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await sesionActual();
  if (!email) redirect("/dashboard/login");

  return (
    <div className="min-h-screen bg-ink">
      <DashboardNav email={email} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
