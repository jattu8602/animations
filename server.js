const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const ANIMATIONS_DIR = path.join(ROOT, "animations");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function safePath(baseDir, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const clean = decoded.replace(/^\/+/, "");
  const resolved = path.normalize(path.join(baseDir, clean));
  if (!resolved.startsWith(baseDir)) {
    return null;
  }
  return resolved;
}

function listAnimations() {
  let files = [];
  try {
    files = fs.readdirSync(ANIMATIONS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  return files
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      url: `/api/animation?name=${encodeURIComponent(entry.name)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/animations") {
    const data = listAnimations();
    return send(res, 200, JSON.stringify({ items: data }, null, 2), MIME_TYPES[".json"]);
  }

  if (url.pathname === "/api/animation") {
    const name = url.searchParams.get("name");
    if (!name) {
      return send(res, 400, "Missing name");
    }
    const filePath = safePath(ANIMATIONS_DIR, name);
    if (!filePath) {
      return send(res, 400, "Invalid path");
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return send(res, 404, "Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (url.pathname.startsWith("/animations/")) {
    const filePath = safePath(ANIMATIONS_DIR, url.pathname.replace("/animations/", ""));
    if (!filePath) {
      return send(res, 400, "Invalid path");
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return send(res, 404, "Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const publicPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = safePath(PUBLIC_DIR, publicPath);
  if (!filePath) {
    return send(res, 400, "Invalid path");
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return send(res, 404, "Not found");
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Animation site running at http://localhost:${PORT}`);
});
