"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from "@askwell/shared";
import { NavLink } from "./NavLink";
import { DASHBOARD_NAV } from "./nav-items";
import { cn } from "./cn";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => (
        <li key={item.href}>
          <NavLink href={item.href} label={item.label} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold tracking-tight">
      <span aria-hidden="true" className="size-6 rounded-control bg-ink" />
      {APP_NAME}
    </Link>
  );
}

/** Sidebar on desktop (md and up), top bar with a drop-down menu on mobile. */
export function DashboardNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="glass rounded-panel sticky top-4 hidden h-[calc(100dvh-2rem)] w-56 shrink-0 flex-col p-4 md:flex">
        <div className="px-3 pb-6 pt-2">
          <Brand />
        </div>
        <nav aria-label="Dashboard">
          <NavList />
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 px-4 pt-4 md:hidden">
        <div className="glass rounded-panel">
          <div className="flex h-14 items-center justify-between px-4">
            <Brand />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-control hover:bg-hover"
            >
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform",
                    open && "translate-y-[5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 w-5 bg-ink transition-transform",
                    open && "-translate-y-[5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
          <nav id="mobile-nav" aria-label="Dashboard" hidden={!open} className="border-t border-line px-2 py-2">
            <NavList onNavigate={close} />
          </nav>
        </div>
      </div>
    </>
  );
}
