export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-lg font-semibold">Bright Platform</div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">{children}</div>
      </div>
    </div>
  );
}
