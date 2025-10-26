import type { User } from "@/types/message";

export default function parseUser(rawUser: string): User {
  const matches = rawUser.match(/^["']?([^"'<>]*)["']?\s*<(.*)>$/);
  if (!matches) return { name: null, email: rawUser.trim() };

  const name = matches?.[1].trim() || null;
  const email = matches?.[2] ?? rawUser.trim();
  return { name, email };
}
