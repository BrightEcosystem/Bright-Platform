export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
      <input
        type="search"
        placeholder="Buscar..."
        disabled
        className="w-64 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-400 placeholder:text-neutral-600"
      />
      <div className="flex items-center gap-4 text-sm text-neutral-400">
        <span>Notificações</span>
        <span className="h-8 w-8 rounded-full bg-neutral-800" aria-label="Perfil" />
      </div>
    </header>
  );
}
