import { rm } from "node:fs/promises";
import tailwind from "bun-plugin-tailwind";

await rm("./dist", { recursive: true, force: true });
const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  plugins: [tailwind],
  minify: true,
  target: "browser",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}
console.log(`Built ${result.outputs.length} files in dist/`);
