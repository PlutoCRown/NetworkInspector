import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const docsPkg = join(root, "..");
const repoRoot = join(docsPkg, "../..");
const prdSrc = join(repoRoot, "docs/PRD");
const prdDest = join(docsPkg, "prd");
const llmsSrc = join(docsPkg, "llms.txt");
const publicDir = join(docsPkg, "public");

if (!existsSync(prdSrc)) {
  console.error(`PRD source not found: ${prdSrc}`);
  process.exit(1);
}

rmSync(prdDest, { recursive: true, force: true });
mkdirSync(prdDest, { recursive: true });

for (const name of readdirSync(prdSrc)) {
  if (!name.endsWith(".md") || name === "README.md") continue;
  cpSync(join(prdSrc, name), join(prdDest, name));
}

cpSync(join(prdSrc, "README.md"), join(prdDest, "index.md"));
console.log(`Synced PRD → ${prdDest}`);

if (existsSync(llmsSrc)) {
  mkdirSync(publicDir, { recursive: true });
  cpSync(llmsSrc, join(publicDir, "llms.txt"));
  cpSync(llmsSrc, join(repoRoot, "llms.txt"));
  console.log("Synced llms.txt → public/ and repo root");
} else {
  console.warn(`llms.txt not found: ${llmsSrc}`);
}
