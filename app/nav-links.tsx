"use client";

import Link from "next/link";
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
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
