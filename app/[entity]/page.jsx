import { notFound } from "next/navigation";
import EntityManagementPage from "@/components/entity-management-page";
import entityLib from "@/lib/entity-configs";

const { getEntityConfig } = entityLib;

export default async function DynamicEntityPage({ params, searchParams }) {
  const resolvedParams = await params;
  const config = getEntityConfig(resolvedParams.entity);

  if (!config) {
    notFound();
  }

  return <EntityManagementPage config={config} searchParams={searchParams} />;
}
