"use client";

import { cn } from "@/lib/utils";
import { anurati } from "@/utils/fonts";
import { HomeIcon, Menu, PenLineIcon, ScrollTextIcon, UsersIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitch from "./ThemeSwitch";
import { useState } from "react";
import UserButton from "./UserButton";
import { Button } from "./ui/button";
import Reveal from "./animations/Reveal";
import { appName } from "@/utils/data";

export const NavBarLinks = [
  { name: "Home", href: "/feed", icon: HomeIcon },
  { name: "People", href: "/profiles", icon: UsersIcon },
  { name: "Posts", href: "/posts", icon: ScrollTextIcon },
];

export default function NavBar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      className={cn(
        "w-full",
        "border-b border-white/5",
        "sticky top-0 left-0 z-50",
        "py-3.5 flex flex-row items-center",
        "bg-background/70 backdrop-blur-xl",
        "shadow-sm shadow-black/20"
      )}
    >
      <Reveal
        className={cn(
          "flex items-center justify-between",
          "mx-auto px-5 md:px-10",
          "w-full max-w-5xl gap-3"
        )}
      >
        {/* Logo */}
        <Link
          href="/feed"
          prefetch={true}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <PenLineIcon className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className={cn(anurati.className, "text-xl font-bold tracking-tight")}>
            {appName.toUpperCase()}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          className={cn(
            "flex flex-col md:flex-row",
            "items-start md:items-center",
            "gap-1 md:gap-1",
            "top-full w-full left-0",
            "py-4 px-5 md:p-0",
            "absolute md:static",
            "transition-all duration-200",
            "shadow-lg md:shadow-none",
            expanded
              ? "scale-y-100 translate-y-0 opacity-100"
              : "-translate-y-1/2 scale-y-0 opacity-0 md:scale-y-100 md:translate-y-0 md:opacity-100",
            expanded && "bg-background/95 backdrop-blur-xl",
            "border-b-[1px] md:border-0 border-border/30"
          )}
        >
          {NavBarLinks.map((link, index) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={index}
                prefetch={true}
                href={link.href}
                onClick={() => setExpanded(false)}
                className={cn(
                  "flex flex-row items-center gap-1.5",
                  "px-4 py-2 rounded-lg font-medium text-sm",
                  "transition-all duration-200 w-full md:w-max",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <link.icon className="size-3.5" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
          <ThemeSwitch />
          <UserButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              setExpanded((prev) => !prev);
              e.stopPropagation();
            }}
            className={cn(
              "flex md:hidden relative w-8 h-8 rounded-lg",
              "border border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <X
              className={cn(
                "absolute transition-all duration-200",
                expanded ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
              )}
            />
            <Menu
              className={cn(
                "absolute transition-all duration-200",
                expanded ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
              )}
            />
          </Button>
        </div>
      </Reveal>
    </nav>
  );
}
