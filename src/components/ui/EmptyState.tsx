type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-800 p-10 text-center">
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
