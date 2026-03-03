import { cookies } from "next/headers";

export type ServerLang = "en" | "hi";

export async function getServerLang(): Promise<ServerLang> {
  // Language selector removed: app stays in English.
  await cookies();
  return "en";
}
