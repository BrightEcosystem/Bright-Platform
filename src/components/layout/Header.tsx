"use client";

import { usePathname } from "next/navigation";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";
import { UserMenu } from "@/components/layout/UserMenu";
import type { NavItem } from "@/components/navigation/nav-items";

type HeaderProps = {
  userEmail: string;
  userName: string | null;
  avatarUrl: string | null;
  tenantName: string | null;
  navItems: NavItem[];
};

export function Header({ userEmail, userName, avatarUrl, tenantName, navItems }: HeaderProps) {
  const pathname = usePathname();
  const currentItem = navItems.find((item) => item.href === pathname);
  const canViewProfile = navItems.some((item) => item.href === "/minha-conta");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-950 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation items={navItems} />
        <span className="truncate text-sm font-medium text-neutral-200">
          {currentItem?.label ?? "Bright Platform"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <TenantSwitcher tenantName={tenantName} />
        <UserMenu
          userEmail={userEmail}
          userName={userName}
          avatarUrl={avatarUrl}
          showProfileLink={canViewProfile}
        />
      </div>
    </header>
  );
}
