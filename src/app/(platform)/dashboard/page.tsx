import { StatCard } from "@/components/ui/StatCard";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Empresas" />
        <StatCard title="Clientes" />
        <StatCard title="Produtos" />
        <StatCard title="Agentes IA" />
        <StatCard title="Workflows" />
        <StatCard title="Integrações" />
      </div>
    </div>
  );
}
