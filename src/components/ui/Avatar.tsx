import clsx from "clsx";
import type { User } from "@/lib/types";

const tones: Record<User["avatarTone"], string> = {
  amber: "bg-[linear-gradient(135deg,#F6A11A,#FFD58A)] text-night",
  green: "bg-[linear-gradient(135deg,#14804A,#3DDC84)] text-white",
  blue: "bg-[linear-gradient(135deg,#163C7E,#7FB6FF)] text-white",
  rose: "bg-[linear-gradient(135deg,#C2416B,#F7A4BC)] text-white",
  violet: "bg-[linear-gradient(135deg,#5B3FC4,#B4A3FF)] text-white",
};

export function Avatar({ user, size = 36, className }: { user: Pick<User, "initials" | "avatarTone" | "photo" | "name">; size?: number; className?: string }) {
  if (user.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.photo} alt={user.name} width={size} height={size} className={clsx("rounded-full object-cover shrink-0", className)} style={{ width: size, height: size }} />;
  }
  return (
    <div
      className={clsx("rounded-full flex items-center justify-center font-bold shrink-0", tones[user.avatarTone], className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {user.initials}
    </div>
  );
}
