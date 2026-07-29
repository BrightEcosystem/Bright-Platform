type StatCardProps = {
  title: string;
  status?: string;
};

export function StatCard({ title, status = "Não conectado" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-2 text-lg font-semibold text-neutral-200">{status}</p>
    </div>
  );
}
