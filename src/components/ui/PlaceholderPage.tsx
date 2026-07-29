type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-neutral-800 p-10">
      <h1 className="text-xl font-semibold text-neutral-100">{title}</h1>
      <p className="text-sm text-neutral-500">Em construção.</p>
    </div>
  );
}
