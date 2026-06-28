import { AdminHome } from "@/components/admin/admin-home";
import { requireAdminRoute } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/queries/admin-overview";

export default async function AdminPage() {
  const user = await requireAdminRoute();
  const overview = await getAdminOverview(user.id);

  return <AdminHome overview={overview} />;
}
