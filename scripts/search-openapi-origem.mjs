import fs from "node:fs/promises";

async function main() {
  const content = await fs.readFile("docs-magazord-openapi.yaml", "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("origem")) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
      lines.slice(Math.max(0, idx - 5), Math.min(lines.length, idx + 10)).forEach((l, i) => {
        console.log(`  ${idx - 5 + i + 1}: ${l}`);
      });
      console.log("---");
    }
  });
}

main().catch(console.error);
