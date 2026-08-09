import { UserRoundXIcon } from "lucide-react";
import GoogleButton from "@/components/GoogleButton";

export default async function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="flex flex-col md:flex-row text-center items-center gap-2 text-xl md:text-5xl font-bold  text-destructive">
        <UserRoundXIcon className="size-16" />
        Unauthorized
      </span>

      <GoogleButton />
    </div>
  );
}
