export type NavItem = { href: string; label: string };

export const DASHBOARD_NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "Projects" },
  { href: "/dashboard/knowledge", label: "Knowledge" },
  { href: "/dashboard/conversations", label: "Conversations" },
  { href: "/dashboard/customize", label: "Customize" },
  { href: "/dashboard/install", label: "Install" },
  { href: "/dashboard/billing", label: "Billing" },
];

/**
 * Whether a nav link is the current page. The dashboard root matches only
 * itself; other links also match their sub-pages.
 */
export function isNavActive(href: string, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (href === "/dashboard") return path === "/dashboard";
  return path === href || path.startsWith(`${href}/`);
}
