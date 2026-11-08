"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./cn";
import { isNavActive } from "./nav-items";

type NavLinkProps = {
  href: string;
  label: string;
  onNavigate?: () => void;
};

export function NavLink({ href, label, onNavigate }: NavLinkProps) {
  const active = isNavActive(href, usePathname());
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center rounded-control px-3 text-sm font-medium transition-colors",
        active ? "bg-ink text-ink-inverse" : "text-ink-muted hover:bg-hover hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
