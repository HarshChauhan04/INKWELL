import RevealHero from "@/components/animations/RevealHero";
import { authOptions } from "@/utils/authOptions";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import Reveal from "@/components/animations/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { UpdateUserName } from "@/components/UpdateUserName";
import AvatarUploader from "@/components/AvatarUploader";
import { Separator } from "@/components/ui/separator";
import { ShieldCheckIcon, UserIcon, MailIcon } from "lucide-react";

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  return (
    <section className="w-full px-4 max-w-xl mx-auto flex flex-col items-center gap-6">
      <RevealHero className="mx-auto">
        <span className="font-extrabold text-3xl">Account Settings</span>
      </RevealHero>

      <Reveal className="w-full">
        <Card className="w-full overflow-hidden">
          {/* Profile header band */}
          <div className="h-20 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 relative">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
          </div>

          <CardContent className="flex flex-col items-center -mt-14 pb-6">
            {/* Avatar uploader */}
            <div className="ring-4 ring-background rounded-full">
              <AvatarUploader
                currentImage={user?.image}
                name={user?.name}
              />
            </div>

            {/* Name row */}
            <div className="mt-4 flex items-center gap-2">
              <span className="font-bold text-xl">{user?.name ?? "Anonymous"}</span>
              <UpdateUserName />
            </div>

            <span className="text-sm text-muted-foreground">{user?.email}</span>

            <Separator className="my-5 w-full" />

            {/* Info rows */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-muted/50 border border-border">
                <UserIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">Display Name</span>
                  <span className="text-sm font-medium truncate">{user?.name ?? "Not set"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-muted/50 border border-border">
                <MailIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">Email Address</span>
                  <span className="text-sm font-medium truncate">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <ShieldCheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-green-600 dark:text-green-400">Authentication</span>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Signed in via Google
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <p className="text-xs text-muted-foreground text-center pb-4">
        Click your avatar to upload and crop a new profile photo.
      </p>
    </section>
  );
}
