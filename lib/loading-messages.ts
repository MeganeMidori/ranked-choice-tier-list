import { readFileSync } from "node:fs";
import path from "node:path";

// Messages the loading overlay cycles through, one per line in config/loading-messages.txt. Read on each call
// rather than at import, so edits show up without restarting the dev server. Server-only, since it reads the file.
export function getLoadingMessages(): string[] {
  const text = readFileSync(path.join(process.cwd(), "config/loading-messages.txt"), "utf8");
  const messages = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return messages.length > 0 ? messages : ["Loading…"];
}
