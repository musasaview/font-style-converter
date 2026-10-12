import index from "./index.html";

const server = Bun.serve({
  routes: { "/": index },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
  port: Number(process.env.PORT || 3000),
});
console.log(`Server running at ${server.url}`);
