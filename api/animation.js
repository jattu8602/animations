const fs = require("fs");
const path = require("path");

const ANIMATIONS_DIR = path.join(process.cwd(), "animations");

function safePath(baseDir, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const clean = decoded.replace(/^\/+/, "");
  const resolved = path.normalize(path.join(baseDir, clean));
  if (!resolved.startsWith(baseDir)) {
    return null;
  }
  return resolved;
}

module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const name = req.query && req.query.name ? String(req.query.name) : "";
  if (!name) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Missing name" }));
    return;
  }

  const filePath = safePath(ANIMATIONS_DIR, name);
  if (!filePath) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Invalid path" }));
    return;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".json" ? "application/json; charset=utf-8" : "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("Content-Type", mime);
  fs.createReadStream(filePath).pipe(res);
};
