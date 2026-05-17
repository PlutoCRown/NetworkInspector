#!/usr/bin/env bun
/**
 * 统计仓库代码行数（排除依赖与构建产物）
 *
 * 用法: bun scripts/loc.ts
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vitepress/cache",
  ".turbo",
  "coverage",
]);

const SKIP_FILES = new Set(["bun.lock", "package-lock.json", "pnpm-lock.yaml"]);

/** 扩展名 → 分类 */
const BUCKETS: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".css": "Styles",
  ".html": "HTML",
  ".json": "JSON",
  ".md": "Markdown",
  ".mts": "Config",
  ".yml": "Config",
  ".yaml": "Config",
};

interface FileStat {
  path: string;
  lines: number;
  bucket: string;
}

async function walk(dir: string, out: FileStat[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = join(dir, ent.name);
    const rel = relative(ROOT, abs);

    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      await walk(abs, out);
      continue;
    }

    if (!ent.isFile() || SKIP_FILES.has(ent.name)) continue;

    const ext = ent.name.includes(".") ? ent.name.slice(ent.name.lastIndexOf(".")) : "";
    const bucket = BUCKETS[ext];
    if (!bucket) continue;

    const text = await readFile(abs, "utf8");
    const lines = text === "" ? 0 : text.split("\n").length;
    out.push({ path: rel, lines, bucket });
  }
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

const files: FileStat[] = [];
await walk(ROOT, files);

const byBucket = new Map<string, { files: number; lines: number }>();
let totalLines = 0;
let totalFiles = 0;

for (const f of files) {
  totalLines += f.lines;
  totalFiles += 1;
  const cur = byBucket.get(f.bucket) ?? { files: 0, lines: 0 };
  cur.files += 1;
  cur.lines += f.lines;
  byBucket.set(f.bucket, cur);
}

const codeBuckets = new Set(["TypeScript", "JavaScript", "Styles", "HTML"]);
let codeLines = 0;
let codeFiles = 0;
for (const [name, stat] of byBucket) {
  if (codeBuckets.has(name)) {
    codeLines += stat.lines;
    codeFiles += stat.files;
  }
}

console.log(`NetworkInspector 行数统计（根目录: ${ROOT}）\n`);
console.log("已排除: node_modules, dist, .git, lock 文件等\n");

const rows = [...byBucket.entries()].sort((a, b) => b[1].lines - a[1].lines);
console.log(pad("分类", 14), pad("文件", 8), "行数");
console.log("-".repeat(36));
for (const [name, stat] of rows) {
  console.log(pad(name, 14), pad(String(stat.files), 8), stat.lines.toLocaleString());
}
console.log("-".repeat(36));
console.log(pad("合计", 14), pad(String(totalFiles), 8), totalLines.toLocaleString());
console.log();
console.log(`源码合计 (TS/JS/CSS/HTML): ${codeLines.toLocaleString()} 行 / ${codeFiles} 个文件`);

const top = [...files].sort((a, b) => b.lines - a.lines).slice(0, 8);
if (top.length) {
  console.log("\n行数最多的文件:");
  for (const f of top) {
    console.log(`  ${pad(String(f.lines), 6)}  ${f.path}`);
  }
}
