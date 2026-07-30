import type { ReactNode } from "react";

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{title}</p>
      <div className="mt-2 text-lg font-semibold text-neutral-100">{children}</div>
    </div>
  );
}
