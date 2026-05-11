import fs from "node:fs/promises";

export async function loadEnvFile(file) {
  try {
    const content = await fs.readFile(file, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

export async function loadProjectEnv() {
  await loadEnvFile(".env");
  await loadEnvFile("secrets/cabana.env");
  await loadEnvFile("secrets/magazord.env");
  await loadEnvFile("secrets/ga4.env");
}
