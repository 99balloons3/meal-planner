import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");

const jobs = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
  { src: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
];

for (const job of jobs) {
  const src = path.join(__dirname, job.src);
  const out = path.join(outDir, job.out);
  await sharp(src).resize(job.size, job.size).png().toFile(out);
  console.log("wrote", out);
}
