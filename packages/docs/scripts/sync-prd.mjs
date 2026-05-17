import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const docsPkg = join(root, "..");
const prdSrc = join(docsPkg, "../../docs/PRD");
const prdDest = join(docsPkg, "prd");

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
