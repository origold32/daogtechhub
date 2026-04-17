import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function buildCustomerName(user: any, profile: ProfileRow) {
  const meta = (user?.user_metadata ?? {}) as {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };

  const fromProfile = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  if (fromProfile) return fromProfile;

  if (meta.full_name?.trim()) return meta.full_name.trim();

  const fromMeta = [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim();
  if (fromMeta) return fromMeta;

  return (user?.email as string | undefined)?.split("@")[0] ?? "Customer";
}
