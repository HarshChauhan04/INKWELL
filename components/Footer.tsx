import { HomeIcon, PenLineIcon, ScrollTextIcon, UsersIcon } from "lucide-react";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { appName } from "@/utils/data";

export const QuickLinksList = [
  { name: "Home", href: "/feed", icon: HomeIcon },
  { name: "People", href: "/profiles", icon: UsersIcon },
  { name: "Posts", href: "/posts", icon: ScrollTextIcon },
];

const TechSitesLinkList = [
  { name: "Github", href: "https://github.com/HarshChauhan04", icon: BsGithub },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/harsh-chauhan88/", icon: BsLinkedin },
];

export default async function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/feed" className="flex items-center gap-2.5 w-fit">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <PenLineIcon className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground/80">
                {appName.toUpperCase()}
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              A space for thinkers, writers, and storytellers.
            </p>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Quick links */}
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">
                Navigate
              </h3>
              <ul className="flex flex-col gap-2">
                {QuickLinksList.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        "text-muted-foreground hover:text-primary",
                        "transition-colors duration-200"
                      )}
                    >
                      <link.icon size={13} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dev links */}
            <div>
              <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">
                Connect
              </h3>
              <ul className="flex flex-col gap-2">
                {TechSitesLinkList.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target="_blank"
                      className={cn(
                        "flex items-center gap-2 text-sm font-medium",
                        "text-muted-foreground hover:text-primary",
                        "transition-colors duration-200"
                      )}
                    >
                      <link.icon size={13} />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/40">
            <span>Made with</span>
            <span className="text-primary">♥</span>
            <span>for writers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
