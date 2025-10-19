import type { User } from "@/types/message";

export default function parseUser(rawUser: string): User {
  return {
    name: rawUser.match(/"(.*)"/)?.[1] ?? null,
    email: rawUser.match(/<(.*)>/)?.[1] ?? rawUser,
  };
}
