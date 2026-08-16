"use client";

import { usePathname } from "next/navigation";

const links = [
  ["/explore", "Explore"],
  ["/ai", "AI report"],
  ["/sources", "Sources"],
  ["/methodology", "Method"],
  ["/contribute", "Contribute"],
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation">
      {links.map(([href, label]) => {
        const exploreSection = href === "/explore" && ["/cities", "/pillars", "/systems"].some(
          (section) => pathname === section || pathname.startsWith(`${section}/`),
        );
        const active = pathname === href || pathname.startsWith(`${href}/`) || exploreSection;
        return (
          <a key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </a>
        );
      })}
    </nav>
  );
}
