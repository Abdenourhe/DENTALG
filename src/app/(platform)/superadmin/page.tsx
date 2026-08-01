import { requirePlatformAdmin } from "@/lib/platform-auth";

export default async function AdminDashboardPage() {
  const admin = await requirePlatformAdmin();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Panneau d&apos;administration</h1>
      <p className="mt-2 text-muted-foreground">
        Connecté en tant que {admin.email}
      </p>
    </main>
  );
}
