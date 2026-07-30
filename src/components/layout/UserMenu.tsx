"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/services/auth/actions";

type UserMenuProps = {
  userEmail: string;
  userName: string | null;
  avatarUrl: string | null;
  /** Só exibe o link "Minha conta" se a página for de fato acessível (ver `nav-items.ts`). */
  showProfileLink: boolean;
};

export function UserMenu({ userEmail, userName, avatarUrl, showProfileLink }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const displayName = userName || userEmail;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium text-neutral-300"
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg"
        >
          <div className="border-b border-neutral-800 px-3 py-2">
            <p className="truncate text-sm text-neutral-200">{userName || "Sem nome cadastrado"}</p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
          </div>
          {showProfileLink ? (
            <Link
              href="/minha-conta"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Minha conta
            </Link>
          ) : null}
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Sair
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
