const fs = require("fs");
const path = require("path");

const ANIMATIONS_DIR = path.join(process.cwd(), "animations");

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

module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const items = listAnimations();
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ items }, null, 2));
};
