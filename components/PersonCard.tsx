import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

export default function ProfileCard({ profile }: { profile: User }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-3 p-6 rounded-2xl",
        "border border-border/40 bg-card",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-[2px] transition-all duration-300",
        "overflow-hidden cursor-pointer"
      )}
    >
      {/* Red glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(232,41,58,0.06) 0%, transparent 65%)",
        }}
      />

      {/* Avatar with crimson ring on hover */}
      <div className="relative z-10">
        <div className="p-0.5 rounded-full bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/40 group-hover:to-primary/10 transition-all duration-300">
          <Avatar className="size-18 border-2 border-border/30 group-hover:border-primary/30 transition-all duration-300">
            <AvatarImage
              src={profile.image ?? undefined}
              alt={profile.name ?? "User Avatar"}
              className="rounded-full"
            />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : "NA"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="relative z-10 text-center">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
          {profile.name}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[140px]">
          {profile.email}
        </p>
      </div>
    </div>
  );
}
